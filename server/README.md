# StoryGenius Backend Server

This is the backend API server for the StoryGenius Health Pal application.

## 🚀 Setup Instructions

### 1. Install Dependencies

First, make sure you have installed bcryptjs:

```bash
npm install bcryptjs
```

All other dependencies should already be installed. If not, run:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` folder by copying the example:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual configuration:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/storygenius

# JWT Secret Key - IMPORTANT: Change this to a random secure string
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

- **Windows**: MongoDB should be running as a service
- **Mac/Linux**: Run `mongod` in a terminal

Or use MongoDB Atlas (cloud database) and update the `MONGODB_URI` accordingly.

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
server/
├── controller/
│   ├── authController.js    # Authentication logic (signup/login)
│   └── routes.js            # API route definitions
├── model/
│   ├── User.js              # User schema for MongoDB
│   └── Convo.js             # Conversation schema for MongoDB
├── index.js                 # Server entry point
├── .env.example             # Environment variables template
└── package.json             # Dependencies and scripts
```

## 🔑 API Endpoints

### Authentication

#### POST `/api/signup`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/login`
Authenticate existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### Health Check

#### GET `/api/`
Check if API is running

**Response:**
```json
{
  "success": true,
  "message": "StoryGenius API is running"
}
```

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Authentication**: JSON Web Tokens are used for secure authentication
- **CORS Protection**: CORS is configured to only allow requests from the frontend
- **Input Validation**: All user inputs are validated before processing
- **Email Uniqueness**: Prevents duplicate user registrations

## 🛠️ Technologies Used

- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing

## 📝 Notes

- The JWT token expires after 7 days
- Passwords must be at least 8 characters long
- Email addresses are stored in lowercase for consistency
- All API routes are prefixed with `/api`
