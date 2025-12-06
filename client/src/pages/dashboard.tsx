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
  Clock
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

  // Redirect immediately if no token, then fetch
  useEffect(() => {
    const token = localStorage.getItem("vco_token");
    if (!token) {
      setLocation("/login");
      return;
    }
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

    fetchAttendance();
  }, []);

  // Derive dashboard data from API results
  const flattened = (attendanceData || []).flatMap((a: any) =>
    (a?.datesofattendance || []).map((d: string) => ({
      id: `${a._id}_${new Date(d).toISOString()}`,
      name: a.name,
      phone: a.phone,
      department: a.dept,
      time: new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: toISODate(d),
      status: a.noofattendance === 1 ? 'New' : 'Returning',
    }))
  );

  const availableDates = Array.from(new Set(flattened.map(r => r.date))).sort((a, b) => (a < b ? 1 : -1)).slice(0, 8);

  // Top cards (today)
  const attendeesToday = (attendanceData || []).filter(
    (a: any) => a?.datesofattendance?.length && toISODate(a.datesofattendance[0]) === todayISO
  );
  const computedAttendanceStats = {
    totalToday: attendeesToday.length,
    newVisitors: attendeesToday.filter((a: any) => (a.noofattendance || 0) === 1).length,
    returning: attendeesToday.filter((a: any) => (a.noofattendance || 0) > 1).length,
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

  // Weekly trend (last 6 Sundays)
  const getLastNSundays = (n: number) => {
    const list: string[] = [];
    let anchor = new Date();
    // Move to the most recent Sunday (including today if Sunday)
    anchor.setDate(anchor.getDate() - anchor.getDay());
    for (let i = 0; i < n; i++) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i * 7);
      list.push(toISODate(d));
    }
    return list.reverse();
  };
  const sundays = getLastNSundays(6);
  const computedWeeklyTrend = sundays.map(dateISO => ({
    name: new Date(dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    attendance: (attendanceData || []).filter((a: any) => (a.datesofattendance || []).some((d: string) => toISODate(d) === dateISO)).length,
  }));

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

  const handleLogout = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b border-gray-200 h-[70px] sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="font-bold text-lg text-primary hidden sm:block">VCO Admin Dashboard</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 py-2 px-3 rounded-full">
            <User className="w-4 h-4 text-primary" />
            <span>Admin User</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
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
            <Card className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Attendance Today</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">{computedAttendanceStats.totalToday}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">For {computedAttendanceStats.date}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">New Visitors Today</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-accent-foreground">{computedAttendanceStats.newVisitors}</span>
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">New</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Returning Members</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-800">{computedAttendanceStats.returning}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Absent Members</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-red-500">{computedAttendanceStats.absent}</span>
                  <span className="text-xs text-gray-400">from last week</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="overview">Overview & Trends</TabsTrigger>
            <TabsTrigger value="management">Attendance Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Attendance Graph Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">Weekly Attendance Trend (Last 6 Sundays)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={computedWeeklyTrend}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ stroke: '#1E3A8A', strokeWidth: 1, strokeDasharray: '5 5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#1E3A8A" 
                        strokeWidth={3}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Attendance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <motion.div variants={item}>
                   <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                     <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <div className="text-sm text-gray-500">Consistent Members</div>
                         <div className="text-3xl font-bold text-gray-800">{computedConsistency.consistent}</div>
                       </div>
                       <Users className="w-10 h-10 text-green-100" />
                     </CardContent>
                   </Card>
                 </motion.div>
                 
                 <motion.div variants={item}>
                   <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                     <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <div className="text-sm text-gray-500">Absent for 2 Weeks</div>
                        <div className="text-3xl font-bold text-gray-800">{computedConsistency.absent2Weeks}</div>
                       </div>
                       <UserMinus className="w-10 h-10 text-yellow-100" />
                     </CardContent>
                   </Card>
                 </motion.div>

                <motion.div variants={item}>
                  <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Absent 3+ Weeks</div>
                        <div className="text-3xl font-bold text-gray-800">{computedConsistency.absent3PlusWeeks}</div>
                      </div>
                      <UserMinus className="w-10 h-10 text-orange-100" />
                    </CardContent>
                  </Card>
                </motion.div>

                 <motion.div variants={item}>
                   <Card className="border-l-4 border-l-red-500 shadow-sm bg-red-50/30 hover:shadow-md transition-shadow">
                     <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <div className="text-sm text-gray-500">Absent for 4+ Weeks</div>
                         <div className="text-3xl font-bold text-red-600">{computedConsistency.absent4Weeks}</div>
                       </div>
                       <UserMinus className="w-10 h-10 text-red-100" />
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
              className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search by name or phone" className="pl-10 rounded-lg border-gray-200" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                 <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                   <Calendar className="w-4 h-4 text-gray-500" />
                   <Select value={selectedDate} onValueChange={setSelectedDate}>
                     <SelectTrigger className="w-[180px] h-8 border-none bg-transparent focus:ring-0 p-0">
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

                 <Button variant="outline" className="gap-2 border-accent text-primary hover:bg-accent hover:text-accent-foreground" onClick={exportCsv}
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
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Attendance List for {selectedDate}
                </h3>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role/Dept</TableHead>
                          <TableHead>Time Logged</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAttendance.length > 0 ? (
                          currentAttendance.map((attendee, index) => (
                            <TableRow key={attendee.id} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="font-medium text-primary">{attendee.name}</TableCell>
                              <TableCell className="text-gray-500">{attendee.phone}</TableCell>
                              <TableCell className="text-gray-600">{attendee.department}</TableCell>
                              <TableCell className="text-gray-500 tabular-nums">{attendee.time}</TableCell>
                              <TableCell className="text-right">
                                 {attendee.status === "New" ? (
                                   <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">First Timer</Badge>
                                 ) : (
                                   <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Returning</Badge>
                                 )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No attendance records found for this date.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </motion.div>

              {/* Absentee Analysis Panel */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Absentee Analysis (Current)
                </h3>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="bg-red-50/50 pb-3 border-b border-red-100">
                    <CardTitle className="text-sm font-medium text-red-800">
                      Missing Today but Present Previously
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {computedAbsentMembers.map((member) => (
                        <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
                              {member.missedSundays} Missed
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">{member.phone}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            Last seen: {member.lastSeen}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" className="w-full text-xs h-8">
                              Call
                            </Button>
                            <Button size="sm" variant="outline" className="w-full text-xs h-8">
                              History
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 text-center">
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-primary w-full">
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
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Absent for 3+ Weeks
                </h3>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="bg-orange-50/50 pb-3 border-b border-orange-100">
                    <CardTitle className="text-sm font-medium text-orange-800">
                      Members missing for over 21 days
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {computedAbsent3PlusMembers.length ? (
                        computedAbsent3PlusMembers.map((member) => (
                          <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                                {member.missedSundays} Missed
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">{member.phone}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              Last seen: {member.lastSeen}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline" className="w-full text-xs h-8">
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="w-full text-xs h-8">
                                History
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">No members absent for 3+ weeks.</div>
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
