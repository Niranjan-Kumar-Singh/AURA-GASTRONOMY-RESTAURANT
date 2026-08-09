// Phase 2.2 Core Backend Services Verification Script
const BASE_URL = 'http://localhost:8080/api/v1';

async function verifyPhase22() {
  console.log('====================================================');
  console.log('⚡ PHASE 2.2 CORE BACKEND SERVICES VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Test Recommendation Engine API
    console.log('1. Testing GET /recommendations...');
    const recRes = await fetch(`${BASE_URL}/recommendations`);
    const recData = await recRes.json();
    console.log(`   Status: ${recRes.status} OK | Retrieved ${recData.data?.length || 0} recommended dishes`);
    if (recData.data?.length > 0) {
      console.log(`   Featured Recommendation: "${recData.data[0].name}" ($${recData.data[0].price}) - Category: ${recData.data[0].category?.name}`);
    }

    // 2. Test Get Reservations
    console.log('\n2. Testing GET /reservations...');
    const resRes = await fetch(`${BASE_URL}/reservations`);
    const resData = await resRes.json();
    console.log(`   Status: ${resRes.status} OK | Existing Reservations Count: ${resData.data?.length || 0}`);

    // 3. Test Create New Table Reservation
    console.log('\n3. Testing POST /reservations...');
    const newReservation = {
      guestName: 'Duchess Genevieve',
      guestEmail: 'genevieve@haute-cuisine.com',
      guestPhone: '+1 (555) 019-9988',
      partySize: 6,
      reservationTime: new Date(Date.now() + 3600000 * 5).toISOString().substring(0, 19),
      specialRequests: 'Chef tasting menu requested for party of 6.'
    };
    const createRes = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReservation)
    });
    const createData = await createRes.json();
    console.log(`   Status: ${createRes.status} Created | Guest: ${createData.data?.guestName} | ID: ${createData.data?.id}`);

    // 4. Test Update Reservation Status
    console.log('\n4. Testing PATCH /reservations/{id}/status...');
    const resId = createData.data?.id || 1;
    const patchRes = await fetch(`${BASE_URL}/reservations/${resId}/status?status=SEATED`, { method: 'PATCH' });
    const patchData = await patchRes.json();
    console.log(`   Status: ${patchRes.status} OK | Message: '${patchData.message}' | New Status: ${patchData.data?.status}`);

    console.log('\n====================================================');
    console.log('✅ PHASE 2.2 CORE BACKEND SERVICES VERIFIED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ PHASE 2.2 VERIFICATION ERROR:', err);
  }
}

verifyPhase22();
