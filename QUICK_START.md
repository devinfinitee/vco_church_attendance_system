# Church Attendance System - Quick Start Guide

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
cd ..
```

**Frontend:**
```bash
npm install
```

### 2. Configure Environment

Make sure `server/.env` has your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=vcosecretkey
PORT=5001
ADMIN_EMAIL=admin@church.com
ADMIN_PASSWORD=admin123
```

### 3. Start the Application

**Option A: Start both servers in separate terminals**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**Option B: Test Backend First**

Run the test script to verify backend is working:
```bash
cd server
npm run dev
# In another terminal:
node test-backend.js
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001/api
- **Attendance Form:** http://localhost:5173 (main page)
- **Login:** http://localhost:5173/login (use the admin credentials above)
- **Admin Dashboard:** http://localhost:5173/admin (requires login)

---

## API Endpoints Summary

### POST /api/submit
Submit attendance with: name, address, DOB, level, dept, phone

### GET /api/admin
Retrieve all attendance records

---

## File Structure

```
ChurchAttendanceSystem/
├── client/                      # Frontend React app
│   └── src/
│       └── pages/
│           ├── attendance.tsx   # Attendance submission form
│           └── dashboard.tsx    # Admin dashboard
├── server/                      # Backend Express server
│   ├── index.js                # Server entry point
│   ├── .env                    # Environment variables
│   ├── controller/
│   │   └── routes.js           # API routes
│   └── model/
│       └── Attendee.js         # Attendee schema
├── API_DOCUMENTATION.md         # Full API documentation
└── test-backend.js             # Backend test script
```

---

## Troubleshooting

### Backend won't start
- Check if MongoDB connection string in `.env` is correct
- Ensure port 5001 is not already in use

### Frontend can't connect to backend
- Verify backend is running on port 5001
- Check browser console for CORS errors
- Ensure fetch URLs are pointing to `http://localhost:5001/api`

### Database connection issues
- Verify MongoDB Atlas credentials
- Check if IP address is whitelisted in MongoDB Atlas
- Test connection string independently

---

## What's Been Configured

✅ **Backend Routes:**
- POST `/api/submit` - Records attendance
- GET `/api/admin` - Retrieves all records (JWT-protected)
- POST `/api/login` - Authenticate admin and returns JWT
- POST `/api/logout` - Stateless logout acknowledgment
- POST `/api/admin/change-password` - Change admin password (JWT-protected)

✅ **Frontend Integration:**
- Attendance form (`attendance.tsx`) sends POST to `/api/submit`
- Login page (`login.tsx`) authenticates and stores JWT
- Dashboard (`dashboard.tsx`) fetches data from `/api/admin` using JWT

✅ **Database Schema:**
- Attendee model with fields: name, address, DOB, level, dept, phone, dateregistered

✅ **Error Handling:**
- Field validation on backend
- Proper error responses with status codes
- Frontend error messages for failed submissions

---

## Next Steps

1. Start the backend server
2. Start the frontend server
3. Test attendance submission at http://localhost:5173
4. View records in admin dashboard
5. (Optional) Run `node test-backend.js` to verify API

For detailed API documentation, see **API_DOCUMENTATION.md**
