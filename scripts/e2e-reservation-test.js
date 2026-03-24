/*
  Client-like end-to-end reservation check:
  1) Find active backend port via /api/test
  2) Register or login test user
  3) Fetch rooms and pick an available room
  4) Create booking
  5) Verify booking appears in /my-bookings
  6) Cancel booking to keep room inventory reusable
*/

const START_PORT = 3000;
const END_PORT = 3010;

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

async function findApiBase() {
  for (let port = START_PORT; port <= END_PORT; port += 1) {
    try {
      const res = await fetch(`http://localhost:${port}/api/test`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.message === 'API is working!') {
        return `http://localhost:${port}`;
      }
    } catch {
      // Try next port.
    }
  }
  throw new Error('No active backend found on ports 3000-3010.');
}

async function jsonRequest(url, options = {}) {
  const mergedOptions = { ...options };
  mergedOptions.headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, mergedOptions);

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  return { ok: res.ok, status: res.status, body };
}

async function registerOrLogin(apiBase, email, password, name) {
  const registerRes = await jsonRequest(`${apiBase}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (registerRes.ok && registerRes.body?.token) {
    return registerRes.body.token;
  }

  const loginRes = await jsonRequest(`${apiBase}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.ok && loginRes.body?.token) {
    return loginRes.body.token;
  }

  throw new Error(
    `Auth failed. Register status=${registerRes.status}, Login status=${loginRes.status}`
  );
}

async function run() {
  const apiBase = await findApiBase();
  console.log(`[1/6] Backend found: ${apiBase}`);

  const unique = Date.now();
  const email = `client.test.${unique}@example.com`;
  const password = 'client123';
  const name = `Client ${unique}`;

  const token = await registerOrLogin(apiBase, email, password, name);
  console.log('[2/6] Auth success (register/login)');

  const roomsRes = await jsonRequest(`${apiBase}/api/rooms`);
  if (!roomsRes.ok || !Array.isArray(roomsRes.body?.rooms)) {
    throw new Error(`Failed to fetch rooms. status=${roomsRes.status}`);
  }

  const availableRoom = roomsRes.body.rooms.find((room) => room?.available === true);
  if (!availableRoom?._id) {
    throw new Error('No available room found to run reservation test.');
  }
  console.log(`[3/6] Room selected: ${availableRoom.roomNumber || availableRoom._id}`);

  const checkIn = addDays(new Date(), 1).toISOString();
  const checkOut = addDays(new Date(), 3).toISOString();

  const bookingRes = await jsonRequest(`${apiBase}/api/bookings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roomId: availableRoom._id, checkIn, checkOut }),
  });

  if (!bookingRes.ok || !bookingRes.body?.booking?._id) {
    throw new Error(`Booking create failed. status=${bookingRes.status} body=${JSON.stringify(bookingRes.body)}`);
  }

  const bookingId = bookingRes.body.booking._id;
  console.log(`[4/6] Booking created: ${bookingId}`);

  const myBookingsRes = await jsonRequest(`${apiBase}/api/bookings/my-bookings`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!myBookingsRes.ok || !Array.isArray(myBookingsRes.body?.bookings)) {
    throw new Error(`Could not verify booking list. status=${myBookingsRes.status}`);
  }

  const exists = myBookingsRes.body.bookings.some((b) => String(b._id) === String(bookingId));
  if (!exists) {
    throw new Error('Booking was created but not found in my-bookings.');
  }
  console.log('[5/6] Booking verified in my-bookings');

  const cancelRes = await jsonRequest(`${apiBase}/api/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!cancelRes.ok) {
    console.warn(`[6/6] Cleanup warning: booking not cancelled (status ${cancelRes.status})`);
  } else {
    console.log('[6/6] Cleanup done: booking cancelled and room freed');
  }

  console.log('E2E reservation test PASSED');
}

run().catch((err) => {
  console.error('E2E reservation test FAILED');
  console.error(err.message || err);
  process.exit(1);
});
