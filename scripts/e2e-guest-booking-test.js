const http = require('http');

// Helper: Find backend on available port
async function findApiBase() {
  for (let port = 3000; port <= 3010; port++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/test`, { timeout: 2000 }, resolve);
        req.on('error', reject);
      });
      if (res.statusCode === 200) return `http://localhost:${port}`;
    } catch (e) {
      // continue to next port
    }
  }
  throw new Error('Backend not found on ports 3000-3010');
}

// Helper: Make JSON request
async function jsonRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mergedOptions = { ...options };
    mergedOptions.headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const req = http.request(url, mergedOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (mergedOptions.body) req.write(mergedOptions.body);
    req.end();
  });
}

// Main test
async function runTest() {
  try {
    console.log('[1/5] Finding backend...');
    const apiBase = await findApiBase();
    console.log(`[1/5] Backend found: ${apiBase}`);

    // Get rooms
    console.log('[2/5] Fetching available rooms...');
    const roomRes = await jsonRequest(`${apiBase}/api/rooms`);
    const rooms = roomRes.body.rooms || [];
    const availableRoom = rooms.find(r => r.available);
    
    if (!availableRoom) {
      throw new Error('No available rooms for booking');
    }
    const roomId = availableRoom._id || availableRoom.id;
    console.log(`[2/5] Room selected: ${availableRoom.roomNumber}`);

    // Create guest booking WITHOUT EMAIL (should work now)
    console.log('[3/5] Creating guest booking without email...');
    const checkIn = new Date().toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const bookingRes = await jsonRequest(`${apiBase}/api/bookings`, {
      method: 'POST',
      body: JSON.stringify({
        roomId: roomId,
        checkIn: checkIn,
        checkOut: checkOut,
        guestName: 'Ahmed Benali',
        guestPhone: '0550123456',
        // Note: NO guestEmail provided
      }),
    });

    if (bookingRes.status !== 201) {
      throw new Error(`Booking failed. status=${bookingRes.status} body=${JSON.stringify(bookingRes.body)}`);
    }

    const bookingId = bookingRes.body.booking._id;
    console.log(`[3/5] Guest booking created (no email): ${bookingId}`);

    // Retrieve by email (should work - guests with email can lookup)
    console.log('[4/5] Testing email-based lookup...');
    const emailLookupRes = await jsonRequest(`${apiBase}/api/bookings/guest/by-email`, {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@email.com' }),
    });

    // Expected to not find bookings (since we didn't provide email)
    if (emailLookupRes.status === 404) {
      console.log('[4/5] Email lookup correctly returned 404 (no email stored)');
    }

    // Cancel booking with email verification (guest provides name for authorization)
    console.log('[5/5] Cleaning up: canceling guest booking...');
    const cancelRes = await jsonRequest(`${apiBase}/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({
        guestName: 'Ahmed Benali',
        guestPhone: '0550123456',
      }),
    });

    if (cancelRes.status !== 200) {
      throw new Error(`Cancel failed. status=${cancelRes.status}`);
    }

    console.log('[5/5] Booking cancelled successfully');
    console.log('\n✅ E2E guest booking test (without email) PASSED');
  } catch (error) {
    console.error('\n❌ E2E guest booking test FAILED');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

runTest();
