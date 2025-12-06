/**
 * Backend Test Script
 * Run this to verify your backend routes are working
 * 
 * Make sure your backend server is running first:
 * cd server
 * npm run dev
 */

const BASE_URL = "http://localhost:5001/api";

// Test data
const testAttendance = {
  name: "Test User",
  address: "123 Test Street, Ogbomosho",
  DOB: "01/01/2000",
  level: "300L",
  dept: "Computer Science",
  phone: "08012345678"
};

// Test 1: Submit Attendance
async function testSubmitAttendance() {
  console.log("\n🧪 Testing POST /api/submit...");
  
  try {
    const response = await fetch(`${BASE_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testAttendance),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Submit attendance test PASSED");
      console.log("Response:", JSON.stringify(result, null, 2));
      return result.data._id; // Return the ID for further tests
    } else {
      console.log("❌ Submit attendance test FAILED");
      console.log("Error:", result);
      return null;
    }
  } catch (error) {
    console.log("❌ Submit attendance test FAILED");
    console.log("Error:", error.message);
    return null;
  }
}

// Test 2: Get All Attendance
async function testGetAttendance() {
  console.log("\n🧪 Testing GET /api/admin...");
  
  try {
    const response = await fetch(`${BASE_URL}/admin`);
    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Get attendance test PASSED");
      console.log(`Found ${result.count} attendance records`);
      if (result.data.length > 0) {
        console.log("Sample record:", JSON.stringify(result.data[0], null, 2));
      }
    } else {
      console.log("❌ Get attendance test FAILED");
      console.log("Error:", result);
    }
  } catch (error) {
    console.log("❌ Get attendance test FAILED");
    console.log("Error:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting Backend API Tests...");
  console.log("Make sure your backend server is running on port 5001");
  console.log("=" .repeat(60));
  
  const attendeeId = await testSubmitAttendance();
  await testGetAttendance();
  
  console.log("\n" + "=".repeat(60));
  console.log("✨ All tests completed!");
}

// Execute tests
runAllTests();
