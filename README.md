## 📊 VCO Attendance Tracker

### Modernizing Ministry Follow-up and Member Engagement for Victory Chapel Ogbomosho (VCO)


### Project Goal

This project aims to revolutionize how Victory Chapel Ogbomosho (VCO), a student church, tracks and engages with its attendees. By replacing unreliable manual methods, the VCO Attendance Tracker provides a structured, digital system for collecting contact details, monitoring consistency, and generating actionable follow-up lists for leadership.

### Key Features

#### 1\. Quick & Mobile-Friendly Attendee Form (Public Access)

  * **Simple Data Capture:** Collects Full Name, Phone Number, Address, Date of Birth, Department, and Academic Level (100L - 600L).
  * **Status Tracking:** Differentiates instantly between **First-time Visitors** and **Returning Members**.
  * **Automation:** Automatically records the date and time of attendance upon submission.
  * **Confirmation:** Shows a simple "Thank you" confirmation screen.

#### 2\. Secure Admin Analytics Dashboard (Leadership Access)

A single, robust dashboard providing church leaders with real-time insights:

  * **Attendance Summary:** Real-time metrics for today (Total Attendees, New Visitors, Returning Members).
  * **Detailed List:** Filterable table of every attendee, including their Student Level and Time Submitted.
  * **Trend Analysis (Weekly & Monthly):** Bar and line charts visualizing attendance trends across Sundays for comparison.
  * **Consistency Tracking (Critical for Follow-up):**
      * Identifies members who attended last week but were absent today.
      * Flags members absent for 2–4 consecutive weeks.
      * Tracks new visitors who have not returned (Crucial for integration).
  * **Data Export:** Ability to download and export attendance records (CSV/Excel).

### 🛠 Technology Stack

This system is built for performance, scalability, and ease of deployment.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js | Building the responsive Form and the dynamic Analytics Dashboard UI. |
| **Styling** | Tailwind CSS | Utility-first framework for clean, mobile-first design. |
| **Backend API** | Node.js (Express) | Handling form submissions, authentication, and serving analytics data. |
| **Database** | PostgreSQL | Robust storage for structured attendance data and complex query support (Consistency Tracking). |
| **Authentication** | JWT (JSON Web Tokens) | Secure, sessionless authentication for Admin Login. |

### 🚀 Getting Started (For Developers)

1.  **Clone the Repository:**
    ```bash
    git clone [repository-url]
    cd vco-attendance-tracker
    ```
2.  **Backend Setup:**
    ```bash
    # (Navigate to the backend directory, install dependencies, set up .env file for database credentials)
    npm install
    npm run migrate # Set up PostgreSQL tables
    npm start
    ```
3.  **Frontend Setup:**
    ```bash
    # (Navigate to the frontend directory)
    npm install
    npm run dev
    ```
4.  **Access:**
      * **Form Page (Public):** `http://localhost:3000/`
      * **Admin Login:** `http://localhost:3000/admin/login`
