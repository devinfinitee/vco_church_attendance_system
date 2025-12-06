# Church Attendance System - API Documentation

## Backend Setup

The backend server is located in the `server` folder and runs on **port 5001**.

### Prerequisites
- Node.js installed
- MongoDB Atlas connection (configured in `.env`)
 - Admin credentials in `.env` for first-time seeding

### Starting the Backend Server

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:5001`

---

## API Endpoints

### 1. Submit Attendance (POST)

**Endpoint:** `/api/submit`

**Method:** `POST`

**Description:** Records a new attendance entry

**Request Body:**
```json
{
  "name": "John Doe",
  "address": "123 Main Street, Ogbomosho",
  "DOB": "15/05/1995",
  "level": "300L",
  "dept": "Computer Science",
  "phone": "08012345678"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "address": "123 Main Street, Ogbomosho",
    "DOB": "15/05/1995",
    "level": "300L",
    "dept": "Computer Science",
    "phone": "08012345678",
    "dateregistered": "2025-12-02T10:30:00.000Z",
    "createdAt": "2025-12-02T10:30:00.000Z",
    "updatedAt": "2025-12-02T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "All fields are required: name, address, DOB, level, dept, phone"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to record attendance",
  "error": "Error details here"
}
```

---

### 2. Get All Attendance Records (GET)

**Endpoint:** `/api/admin`

**Method:** `GET`

**Auth:** `Authorization: Bearer <token>` required (see Login below)

**Description:** Retrieves all attendance records (sorted by most recent first)

**Success Response (200):**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "address": "123 Main Street, Ogbomosho",
      "DOB": "15/05/1995",
      "level": "300L",
      "dept": "Computer Science",
      "phone": "08012345678",
      "dateregistered": "2025-12-02T10:30:00.000Z",
      "createdAt": "2025-12-02T10:30:00.000Z",
      "updatedAt": "2025-12-02T10:30:00.000Z"
    },
    // ... more records
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to retrieve attendance records",
  "error": "Error details here"
}
```

---

### 3. Admin Login (POST)

**Endpoint:** `/api/login`

**Method:** `POST`

**Description:** Authenticates admin and returns a JWT token to access protected routes.

**Request Body:**
```json
{ "email": "admin@church.com", "password": "admin123" }
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "email": "admin@church.com", "name": "Admin", "role": "admin" }
}
```

Use the token in requests:
```
Authorization: Bearer <JWT>
```

---

### 4. Logout (POST)

Stateless logout acknowledgment. Client should discard the token.

**Endpoint:** `/api/logout`

**Method:** `POST`

**Auth:** `Authorization: Bearer <token>`

**Response:**
```json
{ "success": true, "message": "Logged out" }
```

---

### 5. Change Password (POST)

Change the admin password while authenticated.

**Endpoint:** `/api/admin/change-password`

**Method:** `POST`

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "currentPassword": "old", "newPassword": "newStrongPassword" }
```

**Success Response:**
```json
{ "success": true, "message": "Password updated" }
```

---

### 6. Get Absentees Report (GET)

Get list of members absent for specified number of weeks.

**Endpoint:** `/api/admin/absentees?weeks=3`

**Method:** `GET`

**Auth:** `Authorization: Bearer <token>`

**Query Parameters:**
- `weeks` (optional, default: 2) - Number of weeks threshold

**Success Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "phone": "08012345678",
      "department": "Computer Science",
      "level": "300L",
      "lastSeen": "2025-10-15T10:30:00.000Z",
      "missedSundays": 4,
      "totalAttendances": 12
    }
  ]
}
```

---

### 7. Export CSV for Date (GET)

Export attendance records for a specific date as CSV file.

**Endpoint:** `/api/admin/export-csv?date=2025-12-03`

**Method:** `GET`

**Auth:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date` (required) - Date in YYYY-MM-DD format

**Success Response:**
- Content-Type: `text/csv`
- Returns CSV file with headers: Name, Phone, Department, Level, Date, Time, Status

**Example:**
```bash
curl "http://localhost:5001/api/admin/export-csv?date=2025-12-03" \
  -H "Authorization: Bearer <JWT>" \
  --output attendance.csv
```

---

## Database Schema

**Model:** `Attendee`

**Collection:** `attendees`

**Fields:**
- `name` (String, required) - Full name of attendee
- `address` (String, required) - Residential address
- `DOB` (String, required) - Date of birth (format: DD/MM/YYYY)
- `level` (String, required) - Academic level (e.g., "100L", "200L", etc.)
- `dept` (String, required) - Department name
- `phone` (String, required) - Phone number
- `dateregistered` (Date, required, default: now) - Timestamp of attendance
- `createdAt` (Date, auto) - Record creation timestamp
- `updatedAt` (Date, auto) - Record update timestamp

---

## Frontend Integration

The frontend is configured to connect to the backend at `http://localhost:5001/api`

### Attendance Form Submission
Located in: `client/src/pages/attendance.tsx`

Submits data to `/api/submit` endpoint when form is completed.

### Admin Dashboard
Located in: `client/src/pages/dashboard.tsx`

Fetches all attendance records from `/api/admin` endpoint on page load.

---

## Environment Variables

Located in: `server/.env`

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
ADMIN_EMAIL=admin@church.com
ADMIN_PASSWORD=admin123
```

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5000` (Alternative port)

Allowed methods: GET, POST, PUT, DELETE, OPTIONS

---

## Testing the API

### Using curl:

**Submit attendance:**
```bash
curl -X POST http://localhost:5001/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "address": "Test Address",
    "DOB": "01/01/2000",
    "level": "200L",
    "dept": "Engineering",
    "phone": "08012345678"
  }'
```

**Get all records:**
```bash
curl http://localhost:5001/api/admin
```

**Login as Admin:**
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@church.com","password":"admin123"}'
```

Then use the returned token:
```bash
curl http://localhost:5001/api/admin -H "Authorization: Bearer <JWT>"
```

---

## Running the Full Stack Application

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Access Application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001/api`

---

## Notes

- The `dateregistered` field is automatically set to the current date/time when a record is created
- All fields are required for attendance submission
- The admin endpoint does not require authentication (consider adding auth for production)
- Records are sorted by most recent first in the admin endpoint
