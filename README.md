# Hotel Project

This repository is organized as a two-part app:

- `backend/`: Express + MongoDB API
- `frontend/`: React + Vite client

## Project Structure

```text
hotel-project/
	backend/
	frontend/
	scripts/
	package.json
	README.md
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB connection string in `backend/.env`

Minimum required backend environment values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Install Dependencies

Install once in each app:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## Run The Project

From repository root:

```bash
npm run dev:backend
npm run dev:frontend
```

Alternative direct commands:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Build And Verify

Frontend production build:

```bash
npm run build:frontend
```

Backend health check (expects a running backend):

```bash
npm run check:backend
```

Full verification (frontend build + backend health check):

```bash
npm run verify
```

## API Quick Check

When backend is running, test endpoint:

`GET /api/test`

Expected response:

```json
{ "message": "API is working!" }
```

## Windows PowerShell Note

If `npm` is blocked by script policy in PowerShell, use `npm.cmd` instead:

```powershell
npm.cmd run dev:backend
npm.cmd run dev:frontend
```

## Git Commit Tip

If you do not want build output in commits, avoid adding `frontend/dist/`.

## Guest Booking Feature

Non-logged-in clients can now reserve rooms as guests. Guest bookings require:

- **guestName** (required)
- **guestPhone** (required)
- **guestEmail** (optional) - Can be omitted for complete anonymity

### Guest Booking Flow

1. **Create Booking** (POST `/api/bookings`)
   - No authentication needed
   - Provide room ID, dates, and guest info

2. **Lookup by Email** (POST `/api/bookings/guest/by-email`)
   - Guests with email can retrieve their bookings
   - Requires email in request body

3. **Cancel Booking** (PATCH `/api/bookings/{id}/cancel`)
   - Guests can cancel by providing matching name + phone
   - Authenticated users cancel with their token

### Example Guest Booking Request

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room_id_here",
    "checkIn": "2026-03-25",
    "checkOut": "2026-03-27",
    "guestName": "Ahmed Benali",
    "guestPhone": "0550123456",
    "guestEmail": "optional@email.com"
  }'
```

## Testing

Run automated tests to verify booking flows:

```bash
# Test authenticated user bookings
npm run test:reservation

# Test guest bookings (no login required)
npm run test:guest-booking

# Run both tests
npm run test:reservation && npm run test:guest-booking
```

Both tests verify complete workflows:
- Room selection
- Booking creation
- Booking management
- Cleanup/cancellation