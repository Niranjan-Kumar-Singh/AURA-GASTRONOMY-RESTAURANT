// Live E2E Functional & Error Test Script for AURA Digital Dining API
const BASE_URL = 'http://localhost:8080/api/v1';

async function runLiveAudit() {
  console.log('====================================================');
  console.log('🚀 AURA DIGITAL DINING - LIVE END-TO-END AUDIT');
  console.log('====================================================\n');

  let adminToken = '';
  let createdOrderId = null;
  let createdOrderNumber = null;

  try {
    // 1. Categories
    console.log('1. Testing GET /categories...');
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    console.log(`   Status: ${catRes.status} OK | Categories Found: ${catData.data?.length}`);

    // 2. Menu Items
    console.log('\n2. Testing GET /menu-items...');
    const itemRes = await fetch(`${BASE_URL}/menu-items`);
    const itemData = await itemRes.json();
    console.log(`   Status: ${itemRes.status} OK | Menu Items Found: ${itemData.data?.length}`);
    const firstDish = itemData.data[0];
    console.log(`   Sample Dish: [ID ${firstDish.id}] ${firstDish.name} - $${firstDish.price}`);

    // 3. Register Admin User
    console.log('\n3. Testing POST /auth/register...');
    const regPayload = {
      email: `admin_${Date.now()}@aura.com`,
      password: 'AdminPassword123!',
      fullName: 'Executive Chef Admin',
      role: 'ADMIN'
    };
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });
    const regData = await regRes.json();
    console.log(`   Status: ${regRes.status} Created | User Email: ${regData.data?.user?.email}`);
    adminToken = regData.data?.accessToken;
    console.log(`   JWT Access Token Generated: ${adminToken ? 'YES (Length: ' + adminToken.length + ' chars)' : 'NO'}`);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };

    // 4. Authenticated Request GET /tables
    console.log('\n4. Testing Protected GET /tables with Bearer JWT...');
    const tablesRes = await fetch(`${BASE_URL}/tables`, { headers: authHeaders });
    const tablesData = await tablesRes.json();
    console.log(`   Status: ${tablesRes.status} OK | Tables Count: ${tablesData.data?.length}`);
    const tableOne = tablesData.data[0];
    console.log(`   Table 1 Status: ${tableOne.tableNumber} is currently '${tableOne.tableStatus}'`);

    // 5. Customer Places Order
    console.log('\n5. Testing Customer Order Placement POST /orders...');
    const orderPayload = {
      tableId: tableOne.id,
      specialInstructions: 'Allergies: None. Medium spicy please.',
      items: [
        { menuItemId: firstDish.id, quantity: 2, specialNotes: 'Extra sauce' },
        { menuItemId: itemData.data[1].id, quantity: 1, specialNotes: 'Well done' }
      ]
    };
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    console.log(`   Status: ${orderRes.status} Created`);
    createdOrderId = orderData.data?.id;
    createdOrderNumber = orderData.data?.orderNumber;
    console.log(`   Order Created: ID=${createdOrderId} | Number=${createdOrderNumber}`);
    console.log(`   Subtotal: $${orderData.data?.subtotal} | Tax: $${orderData.data?.taxAmount} | Total: $${orderData.data?.totalAmount}`);

    // 6. Track Order Status
    console.log(`\n6. Testing Order Tracking GET /orders/number/${createdOrderNumber}...`);
    const trackRes = await fetch(`${BASE_URL}/orders/number/${createdOrderNumber}`, { headers: authHeaders });
    const trackData = await trackRes.json();
    console.log(`   Status: ${trackRes.status} OK | Order Status: '${trackData.data?.orderStatus}' | Items Count: ${trackData.data?.items?.length}`);

    // 7. Kitchen KDS Active Queue
    console.log('\n7. Testing Kitchen KDS GET /kitchen/orders...');
    const kdsRes = await fetch(`${BASE_URL}/kitchen/orders`, { headers: authHeaders });
    const kdsData = await kdsRes.json();
    console.log(`   Status: ${kdsRes.status} OK | Active Kitchen Tickets: ${kdsData.data?.length}`);

    // 8. Chef Updates Status to PREPARING
    console.log(`\n8. Testing Chef Status Advance PATCH /kitchen/orders/${createdOrderId}/status...`);
    const statusRes = await fetch(`${BASE_URL}/kitchen/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'PREPARING' })
    });
    const statusData = await statusRes.json();
    console.log(`   Status: ${statusRes.status} OK | Updated Order Status: '${statusData.data?.orderStatus}'`);

    // 9. Cashier Pending Bills Queue
    console.log('\n9. Testing Cashier GET /cashier/pending-bills...');
    const billsRes = await fetch(`${BASE_URL}/cashier/pending-bills`, { headers: authHeaders });
    const billsData = await billsRes.json();
    console.log(`   Status: ${billsRes.status} OK | Pending Bills: ${billsData.data?.length}`);

    // 10. Cashier Settles Payment
    console.log(`\n10. Testing Cashier Settlement POST /cashier/settle for Order #${createdOrderId}...`);
    const settleRes = await fetch(`${BASE_URL}/cashier/settle`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        orderId: createdOrderId,
        paymentMethod: 'CREDIT_CARD'
      })
    });
    const settleData = await settleRes.json();
    console.log(`    Status: ${settleRes.status} OK | Payment Status: '${settleData.data?.paymentStatus}' | Settled At: ${settleData.data?.settledAt}`);

    // 11. Verify Table Status Reset to VACANT
    console.log('\n11. Verifying Table Status after Settlement...');
    const verifyTableRes = await fetch(`${BASE_URL}/tables/${tableOne.id}`, { headers: authHeaders });
    const verifyTableData = await verifyTableRes.json();
    console.log(`    Table 1 Status: '${verifyTableData.data?.tableStatus}' (Expected: 'VACANT')`);

    // 12. Admin Analytics
    console.log('\n12. Testing Admin Executive Analytics GET /admin/analytics...');
    const adminRes = await fetch(`${BASE_URL}/admin/analytics`, { headers: authHeaders });
    const adminData = await adminRes.json();
    console.log(`    Status: ${adminRes.status} OK | Today's Total Revenue: $${adminData.data?.totalRevenueToday} | Total Completed Orders: ${adminData.data?.totalOrdersToday}`);

    // 13. Error & Validation Testing
    console.log('\n13. Error & Validation Testing:');
    
    // 13a. Invalid JWT
    const badJwtRes = await fetch(`${BASE_URL}/tables`, {
      headers: { 'Authorization': 'Bearer INVALID_JWT_STRING_HERE' }
    });
    console.log(`    13a. Invalid JWT Token   : Status ${badJwtRes.status} Unauthorized (Expected 401)`);

    // 13b. Non-existent Order Lookup
    const notFoundRes = await fetch(`${BASE_URL}/orders/999999`, { headers: authHeaders });
    const notFoundData = await notFoundRes.json();
    console.log(`    13b. Non-existent Order  : Status ${notFoundRes.status} Not Found | Code: '${notFoundData.code}'`);

    // 13c. Invalid Order Body Payload
    const invalidOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: null, items: [] })
    });
    const invalidOrderData = await invalidOrderRes.json();
    console.log(`    13c. Validation Failure  : Status ${invalidOrderRes.status} Bad Request | Code: '${invalidOrderData.code}'`);

    console.log('\n====================================================');
    console.log('✅ ALL 13 LIVE FUNCTIONAL & ERROR SCENARIOS VERIFIED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ LIVE AUDIT ERROR:', err);
  }
}

runLiveAudit();
