import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LogOut, 
  User, 
  Search, 
  Calendar, 
  Users, 
  UserPlus, 
  UserMinus, 
  Download,
  Check,
  AlertCircle,
  Clock,
  Trash2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@assets/image_1764629926090.png";
import { attendanceStats as mockAttendanceStats, weeklyTrend as mockWeeklyTrend, fullAttendanceDatabase as mockFullAttendanceDatabase, consistencyStats as mockConsistencyStats, absentMembers as mockAbsentMembers } from "@/lib/mock-data";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const toISODate = (d: Date | string) => new Date(d).toISOString().slice(0, 10);
  const todayISO = toISODate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance data function (can be called multiple times)
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("vco_token");
      const response = await fetch("https://vcoattendance.onrender.com/api/admin", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 401) {
        setLocation("/login");
        return;
      }
      const result = await response.json();
      
      if (result.success) {
        setAttendanceData(result.data);
      } else {
        console.error("Failed to fetch attendance:", result.message);
        setError(result.message || "Failed to fetch attendance");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Network error while fetching attendance");
    } finally {
      setLoading(false);
    }
  };

  // Redirect immediately if no token, then fetch
  useEffect(() => {
    const token = localStorage.getItem("vco_token");
    if (!token) {
      setLocation("/login");
      return;
    }
    fetchAttendance();
  }, []);

  // Derive dashboard data from API results
  const flattened = (attendanceData || []).flatMap((a: any) =>
    (a?.datesofattendance || []).map((d: string) => ({
      id: `${a._id}_${new Date(d).toISOString()}`,
      name: a.name,
      phone: a.phone,
      department: a.dept,
      address: a.address,
      dob: a.DOB,
      time: new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: toISODate(d),
      status: a.isFirstTimer ? 'New' : 'Returning',
    }))
  );

  const availableDates = Array.from(new Set(flattened.map(r => r.date))).sort((a, b) => (a < b ? 1 : -1)).slice(0, 8);

  // Top cards (today)
  const attendeesToday = (attendanceData || []).filter(
    (a: any) => a?.datesofattendance?.length && toISODate(a.datesofattendance[0]) === todayISO
  );
  const computedAttendanceStats = {
    totalToday: attendeesToday.length,
    newVisitors: attendeesToday.filter((a: any) => a.isFirstTimer === true).length,
    returning: attendeesToday.filter((a: any) => a.isFirstTimer === false).length,
    absent: 0, // computed below
    date: new Date().toLocaleDateString(),
  };

  // Absent from last week (previous Sunday)
  const getLastSundayISO = () => {
    const d = new Date();
    const day = d.getDay(); // 0=Sun
    const diffToLastSunday = day === 0 ? 7 : day; // if today is Sun, last week Sunday
    d.setDate(d.getDate() - diffToLastSunday);
    return toISODate(d);
  };
  const lastSundayISO = getLastSundayISO();
  const presentLastWeek = new Set(
    (attendanceData || [])
      .filter((a: any) => (a.datesofattendance || []).some((d: string) => toISODate(d) === lastSundayISO))
      .map((a: any) => String(a._id))
  );
  const presentToday = new Set(attendeesToday.map((a: any) => String(a._id)));
  computedAttendanceStats.absent = Array.from(presentLastWeek).filter(id => !presentToday.has(id)).length;

  // Weekly trend (last 6 Sundays with real data)
  const getLastNSundays = (n: number) => {
    const list: { date: string; dayOfWeek: number }[] = [];
    let anchor = new Date();
    
    // Move to the most recent Sunday (or today if it's Sunday)
    const currentDay = anchor.getDay();
    if (currentDay !== 0) {
      anchor.setDate(anchor.getDate() - currentDay);
    }
    
    // Get last N Sundays
    for (let i = 0; i < n; i++) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i * 7);
      list.push({ date: toISODate(d), dayOfWeek: d.getDay() });
    }
    return list.reverse();
  };
  
  const sundays = getLastNSundays(6);
  const computedWeeklyTrend = sundays.map(({ date: dateISO }) => {
    // Count unique attendees who attended on this specific Sunday
    const attendeesOnDate = (attendanceData || []).filter((a: any) => 
      (a.datesofattendance || []).some((d: string) => toISODate(d) === dateISO)
    );
    
    const dateObj = new Date(dateISO);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
    
    return {
      name: formattedDate,
      fullDate: dateISO,
      attendance: attendeesOnDate.length,
      isSunday: true
    };
  });

  // Consistency / absentee insights
  const now = new Date();
  const daysSince = (d: string) => Math.floor((now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
  const lastSeenDays = (a: any) => a?.datesofattendance?.length ? daysSince(a.datesofattendance[0]) : Infinity;
  const computedConsistency = {
    consistent: (attendanceData || []).filter((a: any) => (a.noofattendance || 0) >= 3 && lastSeenDays(a) <= 28).length,
    absent2Weeks: (attendanceData || []).filter((a: any) => lastSeenDays(a) > 14 && lastSeenDays(a) <= 28).length,
    absent3PlusWeeks: (attendanceData || []).filter((a: any) => lastSeenDays(a) > 21).length,
    absent4Weeks: (attendanceData || []).filter((a: any) => lastSeenDays(a) > 28).length,
  };

  const computedAbsentMembers = (attendanceData || [])
    .filter((a: any) => lastSeenDays(a) > 14)
    .sort((a: any, b: any) => lastSeenDays(b) - lastSeenDays(a))
    .slice(0, 5)
    .map((a: any) => ({
      id: String(a._id),
      name: a.name,
      phone: a.phone,
      missedSundays: Math.floor(lastSeenDays(a) / 7),
      lastSeen: new Date(a.datesofattendance?.[0] || a.dateregistered).toLocaleDateString(),
    }));

  const computedAbsent3PlusMembers = (attendanceData || [])
    .filter((a: any) => lastSeenDays(a) > 21)
    .sort((a: any, b: any) => lastSeenDays(b) - lastSeenDays(a))
    .slice(0, 8)
    .map((a: any) => ({
      id: String(a._id),
      name: a.name,
      phone: a.phone,
      missedSundays: Math.floor(lastSeenDays(a) / 7),
      lastSeen: new Date(a.datesofattendance?.[0] || a.dateregistered).toLocaleDateString(),
    }));

  // Table data for selected day
  const currentAttendance = flattened.filter((r) => r.date === selectedDate);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 20;
  
  // Filter by search term
  const filteredAttendance = currentAttendance.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm) ||
    (r.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.dob || '').includes(searchTerm)
  );
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedAttendance = filteredAttendance.slice(startIdx, startIdx + itemsPerPage);
  
  // Reset to page 1 when date or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, searchTerm]);

  const exportCsv = async () => {
    const token = localStorage.getItem("vco_token");
    if (!token) {
      alert("Please login to export CSV");
      return;
    }
    try {
      const response = await fetch(`https://vcoattendance.onrender.com/api/admin/export-csv?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export CSV: " + (e as Error).message);
    }
  };

  const handleDeleteAttendee = async (attendeeId: string, attendeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${attendeeName}? This cannot be undone.`)) {
      return;
    }
    
    const token = localStorage.getItem("vco_token");
    if (!token) {
      alert("Please login to delete records");
      return;
    }
    
    try {
      const response = await fetch(`https://vcoattendance.onrender.com/api/admin/attendee/${attendeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete attendee");
      }
      
      alert(`${attendeeName} has been deleted successfully`);
      await fetchAttendance(); // Refresh the data
    } catch (e) {
      alert("Failed to delete attendee: " + (e as Error).message);
    }
  };

  const handleLogout = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 font-sans">
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 h-[72px] sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-lg"></div>
            <img src={logo} alt="Logo" className="h-12 w-auto relative z-10 drop-shadow-md" />
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent hidden sm:block">VCO Admin</span>
            <span className="text-xs text-gray-500 hidden sm:block">Management Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 py-2.5 px-4 rounded-full border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span>Admin User</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full px-4 font-semibold transition-all hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </motion.nav>

      <main className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
        
        {/* Dashboard Overview Section */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={item}>
            <Card className="border-none shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all hover:-translate-y-1 duration-300 bg-gradient-to-br from-white to-blue-50/30 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Today</div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-br from-primary to-blue-700 bg-clip-text text-transparent">{computedAttendanceStats.totalToday}</span>
                    <span className="text-sm text-gray-500 font-medium">attendees</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 font-medium">{computedAttendanceStats.date}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-lg shadow-green-900/5 hover:shadow-xl hover:shadow-green-900/10 transition-all hover:-translate-y-1 duration-300 bg-gradient-to-br from-white to-green-50/30 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">New Visitors</div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-br from-green-600 to-emerald-700 bg-clip-text text-transparent">{computedAttendanceStats.newVisitors}</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-semibold">First Time</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 font-medium">Today's newcomers</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-lg shadow-indigo-900/5 hover:shadow-xl hover:shadow-indigo-900/10 transition-all hover:-translate-y-1 duration-300 bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Returning</div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-br from-indigo-600 to-purple-700 bg-clip-text text-transparent">{computedAttendanceStats.returning}</span>
                    <span className="text-sm text-gray-500 font-medium">members</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 font-medium">Regular attendees</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-lg shadow-red-900/5 hover:shadow-xl hover:shadow-red-900/10 transition-all hover:-translate-y-1 duration-300 bg-gradient-to-br from-white to-red-50/30 rounded-2xl overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Absent</div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <UserMinus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-br from-red-600 to-rose-700 bg-clip-text text-transparent">{computedAttendanceStats.absent}</span>
                    <span className="text-xs text-gray-500 font-medium">vs last week</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 font-medium">Need follow-up</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-[480px] grid-cols-2 mb-8 bg-gradient-to-r from-gray-100 to-blue-50/50 p-1.5 h-12 rounded-2xl border border-gray-200/50">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary font-semibold transition-all">Overview & Trends</TabsTrigger>
            <TabsTrigger value="management" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary font-semibold transition-all">Attendance Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Attendance Graph Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-none shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-blue-50/20">
                <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Weekly Attendance Trend
                    <span className="text-sm font-normal text-gray-500">(Last 6 Sundays)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[320px] w-full pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={computedWeeklyTrend}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          padding: '12px 16px',
                          backgroundColor: 'white'
                        }}
                        cursor={{ stroke: '#1E3A8A', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#1E3A8A" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorAttendance)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consistency Tracking */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Member Attendance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <motion.div variants={item}>
                   <Card className="border-l-4 border-l-green-500 shadow-lg shadow-green-900/5 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 rounded-2xl bg-gradient-to-br from-white to-green-50/20">
                     <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <div className="text-sm text-gray-600 font-semibold mb-1">Consistent Members</div>
                         <div className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-700 bg-clip-text text-transparent">{computedConsistency.consistent}</div>
                       </div>
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                         <Users className="w-8 h-8 text-green-600" />
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
                 
                 <motion.div variants={item}>
                   <Card className="border-l-4 border-l-yellow-500 shadow-lg shadow-yellow-900/5 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 rounded-2xl bg-gradient-to-br from-white to-yellow-50/20">
                     <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <div className="text-sm text-gray-600 font-semibold mb-1">Absent 2 Weeks</div>
                        <div className="text-4xl font-bold bg-gradient-to-br from-yellow-600 to-amber-700 bg-clip-text text-transparent">{computedConsistency.absent2Weeks}</div>
                       </div>
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                         <UserMinus className="w-8 h-8 text-yellow-600" />
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>

                <motion.div variants={item}>
                  <Card className="border-l-4 border-l-orange-500 shadow-lg shadow-orange-900/5 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 rounded-2xl bg-gradient-to-br from-white to-orange-50/20">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 font-semibold mb-1">Absent 3+ Weeks</div>
                        <div className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">{computedConsistency.absent3PlusWeeks}</div>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-100 flex items-center justify-center">
                        <UserMinus className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                 <motion.div variants={item}>
                   <Card className="border-l-4 border-l-red-500 shadow-lg shadow-red-900/5 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 rounded-2xl bg-gradient-to-br from-white to-red-50/20">
                     <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <div className="text-sm text-gray-600 font-semibold mb-1">Absent 4+ Weeks</div>
                         <div className="text-4xl font-bold bg-gradient-to-br from-red-600 to-rose-700 bg-clip-text text-transparent">{computedConsistency.absent4Weeks}</div>
                       </div>
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                         <AlertCircle className="w-8 h-8 text-red-600" />
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            {/* Management Toolbar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-blue-900/5 border border-gray-100"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Search by name or phone" 
                    className="pl-12 h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                 <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 rounded-xl border-2 border-blue-100 shadow-sm">
                   <Calendar className="w-5 h-5 text-primary" />
                   <Select value={selectedDate} onValueChange={setSelectedDate}>
                     <SelectTrigger className="w-[200px] h-9 border-none bg-transparent focus:ring-0 p-0 font-semibold text-gray-700">
                       <SelectValue placeholder="Select Date" />
                     </SelectTrigger>
                     <SelectContent>
                       {(availableDates.length ? availableDates : [todayISO]).map((d) => (
                         <SelectItem key={d} value={d}>
                           {new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                           {d === todayISO ? ' (Today)' : ''}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <Button 
                   variant="outline" 
                   className="gap-2 bg-gradient-to-r from-primary to-blue-600 text-white border-none hover:from-blue-900 hover:to-blue-800 shadow-lg shadow-primary/20 rounded-xl px-6 h-12 font-semibold transition-all hover:scale-105" 
                   onClick={exportCsv}
                 >
                   <Download className="w-4 h-4" />
                   Export CSV
                 </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Attendance List */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-4"
              >
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Attendance List for {selectedDate}
                  <Badge className="bg-blue-100 text-primary border-none font-bold px-3">{filteredAttendance.length} total</Badge>
                </h3>
                <Card className="border-none shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <TableRow className="border-b-2 border-blue-100">
                          <TableHead className="w-[200px] font-bold text-gray-700">Name</TableHead>
                          <TableHead className="font-bold text-gray-700">Phone</TableHead>
                          <TableHead className="font-bold text-gray-700">Address</TableHead>
                          <TableHead className="font-bold text-gray-700">DOB</TableHead>
                          <TableHead className="font-bold text-gray-700">Department</TableHead>
                          <TableHead className="font-bold text-gray-700">Time</TableHead>
                          <TableHead className="text-right font-bold text-gray-700">Status</TableHead>
                          <TableHead className="text-center font-bold text-gray-700">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAttendance.length > 0 ? (
                          paginatedAttendance.map((attendee, index) => {
                            // Extract the actual MongoDB _id from the composite id
                            const mongoId = attendee.id.split('_')[0];
                            return (
                            <TableRow key={attendee.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                              <TableCell className="font-semibold text-gray-900">{attendee.name}</TableCell>
                              <TableCell className="text-gray-600">{attendee.phone}</TableCell>
                              <TableCell className="text-gray-600">{attendee.address || 'N/A'}</TableCell>
                              <TableCell className="text-gray-600">{attendee.dob || 'N/A'}</TableCell>
                              <TableCell className="text-gray-600">{attendee.department}</TableCell>
                              <TableCell className="text-gray-600 tabular-nums font-medium">{attendee.time}</TableCell>
                              <TableCell className="text-right">
                                 {attendee.status === "New" ? (
                                   <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-none shadow-sm">First Timer</Badge>
                                 ) : (
                                   <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 font-semibold">Returning</Badge>
                                 )}
                              </TableCell>
                              <TableCell className="text-center">
                                <button
                                  onClick={() => handleDeleteAttendee(mongoId, attendee.name)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2.5 rounded-xl transition-all hover:scale-110"
                                  title="Delete attendee"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                              {searchTerm ? `No results found for "${searchTerm}"` : "No attendance records found for this date."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredAttendance.length)} of {filteredAttendance.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="rounded-xl hover:bg-blue-50 border-gray-300"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-xl ${currentPage === pageNum ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30' : 'hover:bg-blue-50 border-gray-300'}`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-xl hover:bg-blue-50 border-gray-300"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Absentee Analysis Panel */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Absentee Analysis
                </h3>
                <Card className="border-none shadow-xl shadow-red-900/5 rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 pb-4 border-b-2 border-red-100">
                    <CardTitle className="text-base font-bold text-red-900 flex items-center gap-2">
                      <UserMinus className="w-5 h-5" />
                      Missing Today but Present Previously
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                      {computedAbsentMembers.map((member) => (
                        <div key={member.id} className="p-5 hover:bg-red-50/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-gray-900 text-base">{member.name}</div>
                            <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-none shadow-sm font-bold">
                              {member.missedSundays} Week{member.missedSundays > 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3 font-medium">{member.phone}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                            Last seen: {member.lastSeen}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 text-xs h-9 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md">
                              Call
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-9 rounded-xl border-gray-300 hover:bg-blue-50">
                              History
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-red-50/30 text-center border-t-2 border-gray-100">
                      <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-blue-700 hover:bg-blue-50 w-full font-semibold rounded-xl">
                        View Full Absentee Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Absent 3+ Weeks Panel */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Absent for 3+ Weeks
                </h3>
                <Card className="border-none shadow-xl shadow-orange-900/5 rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-4 border-b-2 border-orange-100">
                    <CardTitle className="text-base font-bold text-orange-900 flex items-center gap-2">
                      <UserMinus className="w-5 h-5" />
                      Members missing for over 21 days
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                      {computedAbsent3PlusMembers.length ? (
                        computedAbsent3PlusMembers.map((member) => (
                          <div key={member.id} className="p-5 hover:bg-orange-50/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-gray-900 text-base">{member.name}</div>
                              <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-none shadow-sm font-bold">
                                {member.missedSundays} Week{member.missedSundays > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-3 font-medium">{member.phone}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                              <Clock className="w-4 h-4" />
                              Last seen: {member.lastSeen}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 text-xs h-9 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl shadow-md">
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 text-xs h-9 rounded-xl border-gray-300 hover:bg-orange-50">
                                History
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-sm text-gray-500">No members absent for 3+ weeks.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
