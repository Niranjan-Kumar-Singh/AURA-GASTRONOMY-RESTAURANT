const http = require('http');

async function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("=== VERIFYING DEMO STAFF CREDENTIALS AUTHENTICATION ===");
  const accounts = [
    { email: 'admin@aura.com', pass: 'admin123' },
    { email: 'owner@aura.com', pass: 'owner123' },
    { email: 'manager@aura.com', pass: 'manager123' },
    { email: 'chef@aura.com', pass: 'chef123' },
    { email: 'waiter@aura.com', pass: 'waiter123' },
    { email: 'cashier@aura.com', pass: 'cashier123' },
    { email: 'staff@aura.com', pass: 'staff123' }
  ];

  for (const acc of accounts) {
    try {
      const res = await testLogin(acc.email, acc.pass);
      if (res.statusCode === 200 && res.body.token) {
        console.log(`[PASS] ${acc.email} (${acc.pass}): HTTP 200 OK | Role: ${res.body.user.role} | Token length: ${res.body.token.length}`);
      } else {
        console.error(`[FAIL] ${acc.email} (${acc.pass}): HTTP ${res.statusCode}`, res.body);
      }
    } catch (err) {
      console.error(`[ERROR] ${acc.email}: ${err.message}`);
    }
  }
}

run();
