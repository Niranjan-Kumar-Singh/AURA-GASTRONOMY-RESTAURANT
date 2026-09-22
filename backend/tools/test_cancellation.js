const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 RUNNING KITCHEN CANCELLATION & DISH 86 AUTOMATED TESTS...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS ${total}] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL ${total}] ${name} - Details:`, details);
    }
  }

  try {
    const uniqueTable = 'T' + Math.floor(Math.random() * 8000 + 1000);
    const uniquePhone = '98' + Math.floor(Math.random() * 80000000 + 10000000);

    // TEST 1: Create an Order with 3 items
    const createRes = await request('POST', '/api/orders', {
      tableId: uniqueTable,
      customerPhone: uniquePhone,
      customerName: 'Gourmet Tester',
      items: [
        { menuItemId: 1, name: 'Truffle Tagliolini', quantity: 2, price: 650 },
        { menuItemId: 2, name: 'Saffron Risotto', quantity: 1, price: 550 },
        { menuItemId: 3, name: 'Artisan Tiramisu', quantity: 1, price: 350 }
      ],
      subtotal: 2200,
      tax: 110,
      total: 2310
    });

    assert(createRes.status === 201 && createRes.body?.data?.orderId, 'Order created successfully', createRes.body);
    const orderId = createRes.body?.data?.orderId;

    // TEST 2: Chef cancels Item 1 (Saffron Risotto - ₹550) with 86 reason
    const cancelItemRes = await request('PUT', `/api/orders/${orderId}/items/1/cancel`, {
      reason: "86'd / Fresh Saffron Depleted",
      cancelledBy: 'Chef Marco'
    });

    assert(
      cancelItemRes.status === 200 && cancelItemRes.body?.success === true,
      'Chef cancelled individual dish successfully',
      cancelItemRes.body
    );

    const updatedOrder = cancelItemRes.body?.data;
    const cancelledItem = updatedOrder?.items?.[1];

    assert(
      cancelledItem?.status === 'cancelled' && cancelledItem?.cancelReason === "86'd / Fresh Saffron Depleted",
      'Cancelled dish marked with status "cancelled" and reason',
      cancelledItem
    );

    // Active dishes: Truffle (2x 650 = 1300) + Tiramisu (1x 350 = 350) => Subtotal 1650, Tax 5% = 82.5, Total = 1732.5
    assert(
      updatedOrder?.subtotal === 1650 && updatedOrder?.total === 1732.5,
      'Bill & Tax automatically recalculated excluding cancelled dish (₹1732.50)',
      { subtotal: updatedOrder?.subtotal, tax: updatedOrder?.tax, total: updatedOrder?.total }
    );

    assert(
      updatedOrder?.status !== 'cancelled',
      'Order remains active for cooking the remaining dishes',
      updatedOrder?.status
    );

    // TEST 3: Attempting to cancel the same dish again returns 400
    const duplicateCancelRes = await request('PUT', `/api/orders/${orderId}/items/1/cancel`, {
      reason: "Duplicate cancel test"
    });
    assert(
      duplicateCancelRes.status === 400,
      'Prevent duplicate cancellation of already cancelled dish (returns 400 Bad Request)',
      duplicateCancelRes.body
    );

    // TEST 4: Attempting to mark a cancelled dish as prepared returns 400
    const checkCancelledRes = await request('PUT', `/api/orders/${orderId}/items/check`, {
      itemIndex: 1,
      isPrepared: true
    });
    assert(
      checkCancelledRes.status === 400,
      'Prevent marking a cancelled dish as prepared in KDS (returns 400)',
      checkCancelledRes.body
    );

    // TEST 5: Cancel remaining 2 dishes, transitioning the entire order to cancelled
    await request('PUT', `/api/orders/${orderId}/items/0/cancel`, { reason: 'Kitchen delay' });
    const finalCancelRes = await request('PUT', `/api/orders/${orderId}/items/2/cancel`, { reason: 'Guest cancelled' });

    assert(
      finalCancelRes.status === 200 && finalCancelRes.body?.allCancelled === true,
      'When all dishes are cancelled, order automatically transitions to cancelled',
      finalCancelRes.body
    );
    assert(
      finalCancelRes.body?.data?.status === 'cancelled' && finalCancelRes.body?.data?.total === 0,
      'All-dish cancelled order has status="cancelled" and total=0',
      finalCancelRes.body?.data
    );

    // TEST 6: Whole Ticket / Order Cancellation marks all items as cancelled
    const uniqueTable2 = 'T' + Math.floor(Math.random() * 8000 + 1000);
    const order2Res = await request('POST', '/api/orders', {
      tableId: uniqueTable2,
      items: [
        { menuItemId: 4, name: 'Burrata Bruschetta', quantity: 2, price: 400 },
        { menuItemId: 5, name: 'San Pellegrino', quantity: 2, price: 200 }
      ],
      subtotal: 1200,
      tax: 60,
      total: 1260
    });
    const order2Id = order2Res.body?.data?.orderId;

    const voidTicketRes = await request('PUT', `/api/orders/${order2Id}/cancel`, {
      reason: 'Customer Emergency Departure',
      cancelledBy: 'Head Chef'
    });

    const voidedOrder = voidTicketRes.body?.data;
    const allVoidedItemsCancelled = voidedOrder?.items?.every(it => it.status === 'cancelled');

    assert(
      voidTicketRes.status === 200 && voidedOrder?.status === 'cancelled' && allVoidedItemsCancelled,
      'Void Ticket cancels entire order and sets all individual items to cancelled',
      voidedOrder
    );

    console.log(`\n========================================`);
    console.log(`🏁 RESULT: ${passed}/${total} TESTS PASSED!`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
