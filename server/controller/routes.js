// Import express and create router instance
let express = require("express");
let Router = express.Router();

// Import authentication middleware for protecting routes
const authMiddleware = require("../middleware/authMiddleware");
const Attendee = require("../model/Attendee");
const jwt = require("jsonwebtoken");

// Hardcoded admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// POST /submit - Submit attendance record (create or update existing)
Router.post("/submit", async (req, res) => {
  try {
    const { name, address, DOB, level, dept, phone } = req.body;

    // Validate required fields
    if (!name || !address || !DOB || !level || !dept || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: name, address, DOB, level, dept, phone",
      });
    }

    const now = new Date();

    // Try to find existing attendee by phone (preferred unique), fallback to name
    let attendee = await Attendee.findOne({ $or: [{ phone }, { name }] });

    if (attendee) {
      // Update existing attendee: increment count and prepend today's date
      attendee.noofattendance = (attendee.noofattendance || 0) + 1;

      // Ensure latest-first order and avoid multiple entries for same day
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      attendee.datesofattendance = (attendee.datesofattendance || []).filter(
        (d) => !(new Date(d) >= startOfToday && new Date(d) <= endOfToday)
      );
      attendee.datesofattendance.unshift(now);

      await attendee.save();

      return res.status(200).json({
        success: true,
        message: "Attendance updated for existing attendee",
        data: attendee,
      });
    }

    // Create new attendee record with initial attendance
    const newAttendee = new Attendee({
      name,
      address,
      DOB,
      level,
      dept,
      phone,
      dateregistered: now,
      noofattendance: 1,
      datesofattendance: [now],
    });

    await newAttendee.save();

    res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      data: newAttendee,
    });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record attendance",
      error: error.message,
    });
  }
});

// GET /admin - Retrieve all attendance records
Router.get("/admin", authMiddleware, async (req, res) => {
  try {
    // Fetch all attendees, sorted by latest attendance date first
    const attendees = await Attendee.find().sort({ "datesofattendance.0": -1 });

    res.status(200).json({
      success: true,
      count: attendees.length,
      data: attendees,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve attendance records",
      error: error.message,
    });
  }
});

// POST /logout - Client-initiated logout (stateless)
Router.post("/logout", authMiddleware, async (req, res) => {
  // With JWT, logout is handled on the client by discarding the token.
  // This endpoint exists for symmetry; it simply returns success.
  return res.json({ success: true, message: "Logged out" });
});

// POST /admin/change-password - Disabled (using hardcoded credentials)
Router.post("/admin/change-password", authMiddleware, async (req, res) => {
  return res.status(400).json({
    success: false,
    message:
      "Password changes are disabled. Update ADMIN_PASSWORD in .env and restart.",
  });
});

// POST /login - Admin authentication (hardcoded credentials)
Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Check against hardcoded credentials
    const emailMatch = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const passwordMatch = password === ADMIN_PASSWORD;

    if (!emailMatch || !passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: "admin", email: ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      success: true,
      token,
      user: { email: ADMIN_EMAIL, name: "Admin", role: "admin" },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
});

// GET /admin/absentees - Get members absent for specified weeks
Router.get("/admin/absentees", authMiddleware, async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 2;
    const daysThreshold = weeks * 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    // Find members whose latest attendance is before the cutoff
    const absentees = await Attendee.find({
      $or: [
        { "datesofattendance.0": { $lt: cutoffDate } },
        { datesofattendance: { $size: 0 } },
      ],
    }).sort({ "datesofattendance.0": -1 });

    const formatted = absentees.map((a) => ({
      id: a._id,
      name: a.name,
      phone: a.phone,
      department: a.dept,
      level: a.level,
      lastSeen: a.datesofattendance?.[0] || a.dateregistered,
      missedSundays: Math.floor(
        (new Date().getTime() -
          new Date(a.datesofattendance?.[0] || a.dateregistered).getTime()) /
          (1000 * 60 * 60 * 24 * 7)
      ),
      totalAttendances: a.noofattendance || 0,
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Absentees fetch error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch absentees" });
  }
});

// GET /admin/export-csv - Export attendance for a specific date
Router.get("/admin/export-csv", authMiddleware, async (req, res) => {
  try {
    const dateParam = req.query.date;
    if (!dateParam) {
      return res.status(400).json({
        success: false,
        message: "Date parameter required (YYYY-MM-DD)",
      });
    }

    const targetDate = new Date(dateParam);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all attendees who have attendance on this date
    const attendees = await Attendee.find({
      datesofattendance: {
        $elemMatch: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    });

    // Build CSV
    const rows = attendees.map((a) => {
      const attendanceOnDate = a.datesofattendance?.find(
        (d) => new Date(d) >= startOfDay && new Date(d) <= endOfDay
      );
      const time = attendanceOnDate
        ? new Date(attendanceOnDate).toLocaleTimeString()
        : "N/A";
      const status = (a.noofattendance || 0) === 1 ? "New" : "Returning";

      return [
        a.name,
        a.phone,
        a.dept || "",
        a.level || "",
        dateParam,
        time,
        status,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const headers = [
      "Name",
      "Phone",
      "Department",
      "Level",
      "Date",
      "Time",
      "Status",
    ].join(",");
    const csv = [headers, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_${dateParam}.csv`
    );
    return res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to export CSV" });
  }
});

// DELETE /admin/attendee/:attendeeId - Delete an attendee record
Router.delete("/admin/attendee/:attendeeId", authMiddleware, async (req, res) => {
  try {
    const { attendeeId } = req.params;

    // Validate ObjectId format
    if (!attendeeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendee ID format",
      });
    }

    // Delete the attendee
    const deletedAttendee = await Attendee.findByIdAndDelete(attendeeId);

    if (!deletedAttendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found",
      });
    }

    return res.json({
      success: true,
      message: `${deletedAttendee.name} has been deleted successfully`,
      data: deletedAttendee,
    });
  } catch (error) {
    console.error("Delete attendee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete attendee",
      error: error.message,
    });
  }
});

// Export the router
module.exports = Router;
