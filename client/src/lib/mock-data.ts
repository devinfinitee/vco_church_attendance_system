
export const attendanceStats = {
  totalToday: 74,
  newVisitors: 10,
  returning: 64,
  absent: 22,
  date: "Sunday, Oct 24"
};

export const weeklyTrend = [
  { name: 'Sep 15', attendance: 45 },
  { name: 'Sep 22', attendance: 52 },
  { name: 'Sep 29', attendance: 48 },
  { name: 'Oct 06', attendance: 60 },
  { name: 'Oct 13', attendance: 55 },
  { name: 'Oct 20', attendance: 74 },
];

// Expanded dataset for "Extensive" view
export const fullAttendanceDatabase = [
  { id: 1, name: "John Brown", phone: "123 456 489", visitor: "New", department: "Church", time: "06:39 am", status: "New", date: "2025-10-24" },
  { id: 2, name: "Jane Doe", phone: "123 456 769", visitor: "Yes", department: "Ushering", time: "08:06 pm", status: "Returning", date: "2025-10-24" },
  { id: 3, name: "Mark Johnson", phone: "123 456 789", visitor: "No", department: "Family", time: "23:07 pm", status: "Returning", date: "2025-10-24" },
  { id: 4, name: "Emily Smith", phone: "123 456 789", visitor: "New", department: "Recurring", time: "08:19 pm", status: "New", date: "2025-10-24" },
  { id: 5, name: "Michael Scott", phone: "123 456 111", visitor: "No", department: "Choir", time: "09:00 am", status: "Returning", date: "2025-10-24" },
  { id: 6, name: "Sarah Connor", phone: "123 456 222", visitor: "Yes", department: "Security", time: "08:45 am", status: "Returning", date: "2025-10-24" },
  // Previous Sunday (Oct 17)
  { id: 7, name: "John Brown", phone: "123 456 489", visitor: "New", department: "Church", time: "07:00 am", status: "Returning", date: "2025-10-17" },
  { id: 8, name: "Jane Doe", phone: "123 456 769", visitor: "No", department: "Ushering", time: "08:00 am", status: "Returning", date: "2025-10-17" },
  { id: 9, name: "Peter Parker", phone: "123 456 000", visitor: "No", department: "Media", time: "08:30 am", status: "Returning", date: "2025-10-17" }, // Absent on Oct 24
  { id: 10, name: "Clark Kent", phone: "123 456 999", visitor: "No", department: "Prayer", time: "08:15 am", status: "Returning", date: "2025-10-17" }, // Absent on Oct 24
  // Two Sundays ago (Oct 10)
  { id: 11, name: "Peter Parker", phone: "123 456 000", visitor: "No", department: "Media", time: "08:30 am", status: "Returning", date: "2025-10-10" },
  { id: 12, name: "Bruce Wayne", phone: "123 456 888", visitor: "No", department: "Finance", time: "09:00 am", status: "Returning", date: "2025-10-10" }, // Absent on Oct 17 & 24
];

export const consistencyStats = {
  consistent: 58,
  absent2Weeks: 12,
  absent4Weeks: 10
};

export const absentMembers = [
  { id: 9, name: "Peter Parker", phone: "123 456 000", lastSeen: "2025-10-17", missedSundays: 1, department: "Media" },
  { id: 10, name: "Clark Kent", phone: "123 456 999", lastSeen: "2025-10-17", missedSundays: 1, department: "Prayer" },
  { id: 12, name: "Bruce Wayne", phone: "123 456 888", lastSeen: "2025-10-10", missedSundays: 2, department: "Finance" },
];
