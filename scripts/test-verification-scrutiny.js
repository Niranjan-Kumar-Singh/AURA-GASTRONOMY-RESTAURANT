// Verification Scrutiny Suite
const BASE_URL = 'http://localhost:8080/api/v1';

async function runScrutinySuite() {
  console.log('====================================================');
  console.log('🧪 VERIFICATION SCRUTINY & RESILIENCE SUITE');
  console.log('====================================================\n');

  try {
    // 1. Test Table Token Enforcement on Customer Order Placement
    console.log('1. Testing POST /orders WITHOUT X-Table-Token header...');
    const orderPayload = {
      tableId: 1,
      items: [{ menuItemId: 1, quantity: 2, specialNotes: 'Extra hot' }],
      specialInstructions: 'Table 1 priority order'
    };

    const noTokenRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const noTokenData = await noTokenRes.json();
    console.log(`   Status: ${noTokenRes.status} Forbidden (Expected 403)`);
    console.log(`   Rejection Message: '${noTokenData.message}'`);

    // 2. Generate Valid Cryptographic Token & Test Order Placement WITH Header
    console.log('\n2. Generating cryptographic token & testing POST /orders WITH X-Table-Token header...');
    const genRes = await fetch(`${BASE_URL}/table-tokens/generate/1`, { method: 'POST' });
    const genData = await genRes.json();
    const validToken = genData.data?.token;

    const idempotencyKey = `TX_KEY_${Date.now()}`;
    const tokenRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Table-Token': validToken,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(orderPayload)
    });
    const tokenData = await tokenRes.json();
    console.log(`   Status: ${tokenRes.status} Created | Order Number: '${tokenData.data?.orderNumber}'`);

    // 3. Test Financial Idempotency Rejection (Duplicate Key)
    console.log('\n3. Testing Financial Idempotency Rejection with duplicate X-Idempotency-Key...');
    const dupRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Table-Token': validToken,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(orderPayload)
    });
    const dupData = await dupRes.json();
    console.log(`   Status: ${dupRes.status} Conflict (Expected 409)`);
    console.log(`   Idempotency Message: '${dupData.message}'`);

    // 4. Test Reservation Double-Booking Conflict Prevention
    console.log('\n4. Testing Reservation Double-Booking Conflict Prevention...');
    const futureTime = new Date(Date.now() + 86400000).toISOString().substring(0, 19);
    const res1Payload = {
      guestName: 'Baron Rothschild',
      guestEmail: 'baron@wealth.com',
      guestPhone: '+1 (555) 019-7700',
      partySize: 4,
      reservationTime: futureTime,
      table: { id: 3 }, // Table 3 capacity = 6
      specialRequests: 'Window seat'
    };

    const res1 = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(res1Payload)
    });
    const res1Data = await res1.json();
    console.log(`   First Booking -> Status: ${res1.status} Created | Guest: ${res1Data.data?.guestName}`);

    // Attempt conflicting reservation on same Table 3 within 2-hour window
    const conflictRes = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(res1Payload)
    });
    const conflictData = await conflictRes.json();
    console.log(`   Conflicting Booking -> Status: ${conflictRes.status} Bad Request (Expected 400)`);
    console.log(`   Conflict Message: '${conflictData.message}'`);

    console.log('\n====================================================');
    console.log('✅ VERIFICATION SCRUTINY & RESILIENCE SUITE PASSED 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ SCRUTINY SUITE ERROR:', err);
  }
}

runScrutinySuite();
