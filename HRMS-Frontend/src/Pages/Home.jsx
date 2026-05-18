  import React, { useMemo, useState, useEffect, useContext } from "react";
  import Calendar from "react-calendar";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import "react-calendar/dist/Calendar.css";
  import {
    PieChart,
    Cell,
    Pie,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
  } from "recharts";
  import {
    FaUsers,
    FaBell,
    FaMoneyBillWave,
    FaBirthdayCake,
    FaSearch,
    FaEllipsisH,
    FaMapMarkerAlt,
    FaCalendarCheck,
    FaUserCheck,
  } from "react-icons/fa";
  import { AuthContext } from "../Context/Authcontext";
  import { fetchHomeData } from "../api/homeApi";
  import { getAllEmployees } from "../api/employeeApi";
  import { getMyAttendance } from "../api/attendanceApi";
  import { getMyLeaves } from "../api/leaveApi";
  import { getEmployeePayroll } from "../api/payrollApi";
  import "./Home.css";

  /* ================= DUMMY USERS ================= */

 




  export default function Home() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [search, setSearch] = useState("");
    const [dept, setDept] = useState("All");
    const [location, setLocation] = useState("Fetching...");
    const [employees, setEmployees] = useState([]);
    const [attendanceChartData, setAttendanceChartData] = useState([]);
    const [leaveChartData, setLeaveChartData] = useState([]);
    const [homeData, setHomeData] = useState(null);
    
    // Enhanced state for role-based KPIs
    const [myAttendancePercentage, setMyAttendancePercentage] = useState(0);
    const [myLeaveNotifications, setMyLeaveNotifications] = useState(0);
    const [myPayrollAmount, setMyPayrollAmount] = useState(0);
    const [teamAttendancePercentage, setTeamAttendancePercentage] = useState(0);
    const [teamLeaveNotifications, setTeamLeaveNotifications] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [last3MonthsPayroll, setLast3MonthsPayroll] = useState([]);
    const [systemNotifications, setSystemNotifications] = useState([]);
    
    // 🔄 LIVE ATTENDANCE AUTO REFRESH (30 sec)
useEffect(() => {
  const interval = setInterval(() => {
    if (user?.email) {
      refreshAttendanceStatus();
    }
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [user]);
    const refreshAttendanceStatus = async () => {
  try {
    const data = await fetchHomeData(user.email);
    setHomeData(data);
  } catch (err) {
    console.error("Refresh failed", err);
  }
};
    const [showEventsPopup, setShowEventsPopup] = useState(false);
    const [events, setEvents] = useState(0);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
     const currentMonth = new Date().getMonth();
     const currentMonthEvents = useMemo(() => {
  return (homeData?.events || []).filter(e => {
    if (!e.date) return false;
    return new Date(e.date).getMonth() === currentMonth;
  });
}, [homeData]);

    const eventDates = useMemo(() => {
  return employees
    .filter(emp => emp.dob)
    .map(emp => {
      const d = new Date(emp.dob);
      return new Date(new Date().getFullYear(), d.getMonth(), d.getDate());
    });
}, [employees]);

const currentMonthBirthdays = useMemo(() => {
  return employees.filter(emp => {
    if (!emp.dob) return false;
    return new Date(emp.dob).getMonth() === currentMonth;
  });
}, [employees]);

    const [notifications, setNotifications] = useState([]);
    const [payrollData, setPayrollData] = useState([]);
    // ✅ Weekly off days from company settings (loaded via homeData)
    const [weeklyOffDays, setWeeklyOffDays] = useState(["SATURDAY", "SUNDAY"]);

    // Enhanced calendar events for May 2026
    const mayEvents = {
      1: ["International Labour Day", "May Day", "Maharashtra Day", "Buddha Purnima"],
      3: ["World Press Freedom Day", "World Laughter Day"],
      4: ["Star Wars Day"],
      5: ["World Asthma Day"],
      8: ["World Red Cross Day", "Rabindra Jayanti"],
      10: ["Mother's Day", "World Lupus Day"],
      12: ["International Nurses Day"],
      15: ["International Day of Families"],
      18: ["International Museum Day"],
      21: ["World Day for Cultural Diversity for Dialogue and Development"],
      22: ["International Day for Biological Diversity"],
      23: ["World Turtle Day"],
      28: ["Menstrual Hygiene Day"],
      31: ["World No Tobacco Day"]
    };

    // Get events for selected date
    const getEventsForDate = (date) => {
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      
      // Only show events for May 2026 and from current date onwards
      if (year === 2026 && month === 4) { // May is month 4 (0-indexed)
        const today = new Date();
        if (date >= today) {
          return mayEvents[day] || [];
        }
      }
      return [];
    };

    // Load role-based KPI data
    const loadRoleBasedData = async () => {
      if (!user?.email) return;

      try {
        const userRole = user.role?.toLowerCase();
        
        // ✅ Attendance % now comes from homeData.stats for ALL roles
        // homeData is loaded by the loadHomeData useEffect which sets myAttendancePercentage
        
        if (userRole === 'employee' || userRole === 'manager') {
          await loadEmployeeKPIData();
        }
        
        // Load last 3 months payroll for all roles
        await loadLast3MonthsPayroll();
        
        // Load system notifications
        await loadSystemNotifications();
        
      } catch (error) {
        console.error('Error loading role-based data:', error);
      }
    };

    const loadEmployeeKPIData = async () => {
      try {
        // ✅ Attendance % is now set from homeData.stats in the loadHomeData useEffect
        // No need to recalculate here

        // Get employee leave notifications
        const leaveData = await getMyLeaves(user.employeeId || user.id);
        if (leaveData && leaveData.data) {
          const notifications = leaveData.data.filter(leave => 
            leave.status === 'Approved' || leave.status === 'Rejected'
          ).length;
          setMyLeaveNotifications(notifications);
        }

        // Get employee payroll amount
        const payrollData = await getEmployeePayroll(user.employeeCode || user.employeeId);
        if (payrollData && payrollData.data) {
          const latestPayroll = payrollData.data[0];
          if (latestPayroll) {
            const amount = latestPayroll.netPay || latestPayroll.net || latestPayroll.salary || 0;
            setMyPayrollAmount(amount);
          }
        }
      } catch (error) {
        console.error('Error loading employee KPI data:', error);
      }
    };

    const loadManagerKPIData = async () => {
      try {
        // ✅ Manager attendance % now comes from homeData.stats (same as employee)
        // Team leave notifications from leaveGraph
        if (homeData) {
          if (homeData.leaveGraph && homeData.leaveGraph.length > 0) {
            const latestMonth = homeData.leaveGraph[homeData.leaveGraph.length - 1];
            setTeamLeaveNotifications(latestMonth.pending || 0);
          }
        }
      } catch (error) {
        console.error('Error loading manager KPI data:', error);
      }
    };

    const loadLast3MonthsPayroll = async () => {
      try {
        // Mock data for last 3 months payroll - replace with actual API call
        const mockPayrollData = [
          { employee: user.name || 'Current User', month: 'Mar 2026', gross: 5000, deductions: 500, net: 4500 },
          { employee: user.name || 'Current User', month: 'Apr 2026', gross: 5000, deductions: 450, net: 4550 },
          { employee: user.name || 'Current User', month: 'May 2026', gross: 5200, deductions: 520, net: 4680 },
        ];
        setLast3MonthsPayroll(mockPayrollData);
      } catch (error) {
        console.error('Error loading payroll data:', error);
      }
    };

    const loadSystemNotifications = async () => {
      try {
        const userRole = user.role?.toLowerCase();
        let notifications = [];

        if (userRole === 'admin') {
          // Admin notifications: missed check-ins, forgot checkouts
          notifications = [
            { id: 1, type: 'warning', message: 'John Doe missed check-in yesterday', badge: 1, link: '/attendance' },
            { id: 2, type: 'info', message: 'Payroll processed for April 2026', badge: 0, link: '/payroll' },
            { id: 3, type: 'warning', message: '3 employees forgot to checkout', badge: 3, link: '/attendance' },
          ];
        } else {
          // Employee/Manager notifications: payroll, insurance, reimbursements
          notifications = [
            { id: 1, type: 'success', message: 'Payroll credited for April 2026', badge: 0, link: '/payroll' },
            { id: 2, type: 'info', message: 'Insurance claim approved', badge: 0, link: '/insurance-claim' },
            { id: 3, type: 'pending', message: 'Reimbursement request pending', badge: 1, link: '/reimbursement' },
          ];
        }

        setSystemNotifications(notifications);
      } catch (error) {
        console.error('Error loading system notifications:', error);
      }
    };

    // Load role-based data when user changes
    useEffect(() => {
      if (user?.email) {
        loadRoleBasedData();
      }
    }, [user, homeData]);

    // Fetch employees
    useEffect(() => {
      const fetchEmployees = async () => {
        try {
          const employees = await getAllEmployees();

          if (Array.isArray(employees)) {
            setEmployees(employees);
          } else {
            setEmployees([]);
          }
        } catch (err) {
          console.error("Home fetch employees error:", err);
          setEmployees([]);
        }
      };

      fetchEmployees();
    }, []);


    const loadHomeData = async () => {
  if (!user?.email) return;

  try {
    const data = await fetchHomeData(user.email);

    setHomeData(data);

    if (data.attendanceGraph) {
      setAttendanceChartData(data.attendanceGraph);
    }

    if (data.leaveGraph) {
      const totals = data.leaveGraph.reduce(
        (acc, item) => ({
          approved: acc.approved + (item.approved || 0),
          pending: acc.pending + (item.pending || 0),
          rejected: acc.rejected + (item.rejected || 0),
        }),
        { approved: 0, pending: 0, rejected: 0 }
      );

      setLeaveChartData([
        { name: "Approved", value: totals.approved },
        { name: "Pending", value: totals.pending },
        { name: "Rejected", value: totals.rejected },
      ]);
    }

  } catch (err) {
    console.error(err);
  }
};




    useEffect(() => {
  const fetchPayroll = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/payroll`
      );

      setPayrollData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Payroll fetch error:", err);
      setPayrollData([]);
    }
  };

  fetchPayroll();
}, []);
    // Fetch home data (includes attendance and leave graphs)
    useEffect(() => {
      const loadHomeData = async () => {
        if (!user?.email) return;

        try {
          const data = await fetchHomeData(user.email);
          console.log("✅ Home data loaded:", data);
          console.log("📊 Leave users count:", data.leaveUsers?.length || 0);
          console.log("📋 Leave users data:", data.leaveUsers);
          setHomeData(data);

          // ✅ Set attendance percentage from backend stats (works for ALL roles)
          if (data.stats && data.stats.attendancePercentage !== undefined) {
            setMyAttendancePercentage(data.stats.attendancePercentage);
            console.log("📊 Attendance %:", data.stats.attendancePercentage, 
              "| Working days:", data.stats.workingDays,
              "| Checked in:", data.stats.checkedInDays,
              "| Leaves:", data.stats.approvedLeaveDays,
              "| Absent:", data.stats.absentDays);
          }

          // ✅ Set weekly off days from company settings
          if (data.weeklyOffDays && Array.isArray(data.weeklyOffDays)) {
            setWeeklyOffDays(data.weeklyOffDays);
          }

          // Set attendance graph data
          if (data.attendanceGraph && Array.isArray(data.attendanceGraph)) {
            const formatted = data.attendanceGraph.map((item) => ({
              month: item.month || "N/A",
              present: item.present || 0,
              leave: item.leave || 0,
              absent: item.absent || 0,
            }));
            setAttendanceChartData(formatted);
          }

          // Set leave graph data
          if (data.leaveGraph && Array.isArray(data.leaveGraph)) {
            // Sum up all months for pie chart
            const totals = data.leaveGraph.reduce(
              (acc, item) => ({
                approved: acc.approved + (item.approved || 0),
                pending: acc.pending + (item.pending || 0),
                rejected: acc.rejected + (item.rejected || 0),
              }),
              { approved: 0, pending: 0, rejected: 0 }
            );

            setLeaveChartData([
              { name: "Approved", value: totals.approved },
              { name: "Pending", value: totals.pending },
              { name: "Rejected", value: totals.rejected },
            ]);
          }

          // Extract upcoming holidays from events
          if (data.events && Array.isArray(data.events)) {
            const todayStr = new Date().toISOString().split('T')[0];
           

const holidays = data.events
  .filter(event => {
    if (event.type !== "Holiday") return false;
    const d = new Date(event.date);
    return d.getMonth() === currentMonth;
  })
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 5);
            setUpcomingHolidays(holidays);
          }

          // Fallback: if no holidays found in homeData, fetch directly from /api/events
          // This ensures employees and managers also see holidays
          if (!data.events || data.events.filter(e => e.type === "Holiday").length === 0) {
            try {
              const eventsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
              if (Array.isArray(eventsRes.data)) {
                const todayStr = new Date().toISOString().split('T')[0];
                const holidays = eventsRes.data
                  .filter(event => event.type === "Holiday" && event.date >= todayStr)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 5);
                setUpcomingHolidays(holidays);
              }
            } catch (e) {
              console.error("Fallback holiday fetch failed:", e);
            }
          }
        } catch (err) {
          console.error("Home data fetch error:", err);
        }
      };

      loadHomeData();
    }, [user]);

    // Fetch events (birthdays)
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const employees = await getAllEmployees();
          const currentMonth = new Date().getMonth();
         
          const filtered = employees.filter((emp) => {
            if (!emp.dob) return false;
            return new Date(emp.dob).getMonth() === currentMonth;
          });

          setEvents(filtered.length);
        } catch (err) {
          console.error("Events fetch error:", err);
        }
      };

      fetchEvents();
    }, []);

    // Fetch notifications
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
         
          
          // Transform notifications to include proper structure
          const notifs = Array.isArray(res.data) 
            ? res.data.map((n, index) => ({
                id: n.id || index,
                message: n.message || n.text || "New notification",
                time: n.time || n.createdAt || new Date().toLocaleTimeString(),
                read: n.read || false,
                type: n.type || "info",
                link: n.link || null, // Link to navigate when clicked
              }))
            : [];
          
          setNotifications(notifs);
        } catch (err) {
          console.error("Notifications fetch error:", err);
          setNotifications([]);
        }
      };

      fetchNotifications();
      
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }, []);

    const totalEmployees = employees.length;

    const pendingLeaves = homeData?.stats?.leavePending || 0;
    const payrollTotal = Array.isArray(payrollData)
  ? payrollData.reduce(
      (sum, emp) =>
        sum +
        (
          emp.net || 
          emp.netPay || 
          emp.gross || 
          emp.grossPay || 
          emp.salary || 
          0
        ),
      0
    )
  : 0;

    const KpiCard = ({ icon, title, value, color, onClick }) => (
  <div className={`kpi-card ${color}`} onClick={onClick}>
    <div className="kpi-content">
      <h1 className="kpi-title">{title}</h1>
      <div className="kpi-value">{value}</div>
    </div>
    <div className="kpi-icon">{icon}</div>
  </div>
);

    const usersData = useMemo(() => {
      return employees.filter(
        (u) =>
          (u.fullName || u.name || "").toLowerCase().includes(search.toLowerCase()) &&
          (dept === "All" || u.department === dept)
      );
    }, [search, dept, employees]);

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setLocation(`Lat: ${latitude.toFixed(3)}, Lon: ${longitude.toFixed(3)}`);
          },
          () => setLocation("Location not available")
        );
      }
    }, []);

    return (
      <div className="dashboard">

        {/* KPI ROW - ROLE BASED */}
        <div className="kpi-row">
          {user?.role === "employee" && (
            <>
              <KpiCard 
                title="My Attendance" 
                value={`${myAttendancePercentage}%`} 
                icon={<FaCalendarCheck />} 
                color="blue" 
                onClick={() => navigate("/attendance")}
              />
              <KpiCard 
                title="Leave Notifications" 
                value={myLeaveNotifications} 
                icon={<FaBell />} 
                color="red" 
                onClick={() => navigate("/leave")}
              />
              <KpiCard 
                title="My Payroll" 
                value={`$${myPayrollAmount.toLocaleString()}`} 
                icon={<FaMoneyBillWave />} 
                color="green" 
                onClick={() => navigate("/payroll")}
              />
              <KpiCard 
                title="Events" 
                value={events} 
                icon={<FaBirthdayCake />} 
                color="blue" 
                onClick={() => setShowEventsPopup(true)}
              />
            </>
          )}

          {user?.role === "manager" && (
            <>
              <KpiCard 
                title="Team Attendance" 
                value={`${teamAttendancePercentage}%`} 
                icon={<FaUserCheck />} 
                color="blue" 
                onClick={() => navigate("/attendance")}
              />
              <KpiCard 
                title="Team Leave Notifications" 
                value={teamLeaveNotifications} 
                icon={<FaBell />} 
                color="red" 
                onClick={() => navigate("/leave")}
              />
              <KpiCard 
                title="My Payroll" 
                value={`$${myPayrollAmount.toLocaleString()}`} 
                icon={<FaMoneyBillWave />} 
                color="green" 
                onClick={() => navigate("/payroll")}
              />
              <KpiCard 
                title="Events" 
                value={events} 
                icon={<FaBirthdayCake />} 
                color="blue" 
                onClick={() => setShowEventsPopup(true)}
              />
            </>
          )}

          {(user?.role === "hr" || user?.role === "admin") && (
            <>
             <KpiCard
  title="Total Employees"
  value={totalEmployees}
  icon={<FaUsers />}
  color="blue"
  onClick={() => navigate("/employees")}
/>
<KpiCard 
  title="Pending Leaves" 
  value={pendingLeaves} 
  icon={<FaBell />}
  color="red"
   onClick={() => navigate("/leave", { state: { focus: "pending" } })}
/>

<KpiCard 
  title="Org Payroll" 
  value={`$${(payrollTotal || 0).toLocaleString()}`}
  icon={<FaMoneyBillWave />}
  color="orange"
   onClick={() => navigate("/payroll")} 
/>

<KpiCard
  title="Events"
  value={events}
  icon={<FaBirthdayCake />}
  color="yellow"
  onClick={() => setShowEventsPopup(true)}
/>
            </>
          )}
        </div>

    {showEventsPopup && (
  <div className="popup-overlay" onClick={() => setShowEventsPopup(false)}>
    <div className="popup-box" onClick={(e) => e.stopPropagation()}>
      
      <h2>📅 Events & Birthdays</h2>

      {/* 🎉 HOLIDAYS */}
      <h3>Upcoming Holidays</h3>
     {currentMonthEvents.length > 0 ? (
  currentMonthEvents.map((event, i) => (
    <div key={i} className="popup-item">
      📅 <strong>{event.title}</strong> - {event.date}
    </div>
  ))
) : (
  <p>No events this month</p>
)}

      {/* 🎂 BIRTHDAYS */}
      {/* 🎂 BIRTHDAYS */}
<h3 style={{ marginTop: "15px" }}>Birthdays</h3>

{currentMonthBirthdays.length > 0 ? (
  currentMonthBirthdays.map((emp, i) => {
    const d = new Date(emp.dob);

    return (
      <div key={i} className="popup-item">
        🎂 {emp.fullName || emp.name} -{" "}
        {d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        })}
      </div>
    );
  })
) : (
  <p>No birthdays this month</p>
)}
      

      <button className="close-btn" onClick={() => setShowEventsPopup(false)}>
        Close
      </button>
    </div>
  </div>
)}
        {/* WHO'S ON LEAVE TODAY + UPCOMING HOLIDAYS - KEKA STYLE */}
        {(() => {
          const todayLeaves = homeData?.leaveUsers || [];

          return (
            <div style={{display:'flex', gap:'12px', marginBottom:'12px', flexWrap:'wrap'}}>
              
              {/* WHO'S ON LEAVE TODAY */}
              <div className="panel" style={{flex:'1', minWidth:'260px', borderLeft:'4px solid #3b82f6', padding:'10px 14px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                  <h3 style={{margin:0, fontSize:'13px', fontWeight:'600', color:'#1f2937'}}>🏖️ On Leave Today</h3>
                  {todayLeaves.length > 0 && (
                    <span style={{background:'#dbeafe', color:'#1e40af', padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'600'}}>
                      {todayLeaves.length} {todayLeaves.length === 1 ? 'person' : 'people'}
                    </span>
                  )}
                </div>

                {todayLeaves.length === 0 ? (
                  <div style={{textAlign:'center', padding:'10px 0', color:'#6b7280'}}>
                    <span style={{fontSize:'18px'}}>✅</span>
                    <p style={{margin:'4px 0 0', fontSize:'12px', fontWeight:'600', color:'#374151'}}>Everyone is present today!</p>
                  </div>
                ) : (
                  <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                    {todayLeaves.slice(0, 6).map((leave, i) => (
                      <div key={i} style={{display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leave.name || 'User')}&background=random&color=fff&size=32`}
                          alt={leave.name}
                          style={{width:'32px', height:'32px', borderRadius:'50%', border:'2px solid #3b82f6', flexShrink:0}}
                        />
                        <div>
                          <div style={{fontWeight:'600', fontSize:'12px', color:'#1f2937'}}>{leave.name || 'Unknown'}</div>
                          <div style={{fontSize:'10px', color:'#64748b'}}>
                            {leave.startDate ? new Date(leave.startDate + 'T00:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''} - {leave.endDate ? new Date(leave.endDate + 'T00:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''}
                          </div>
                          {leave.leaveType && (
                            <span style={{display:'inline-block', padding:'1px 5px', background:'#e0f2fe', color:'#0369a1', borderRadius:'3px', fontSize:'9px', fontWeight:'600'}}>
                              {leave.leaveType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPCOMING HOLIDAYS */}
              <div className="panel" style={{flex:'1', minWidth:'260px', borderLeft:'4px solid #f59e0b', padding:'10px 14px'}}>
                <div style={{marginBottom:'8px'}}>
                  <h3 style={{margin:0, fontSize:'13px', fontWeight:'600', color:'#1f2937'}}>🎉 Upcoming Holidays</h3>
                </div>

                {upcomingHolidays.length === 0 ? (
                  <div style={{textAlign:'center', padding:'10px 0', color:'#6b7280'}}>
                    <span style={{fontSize:'18px'}}>📅</span>
                    <p style={{margin:'4px 0 0', fontSize:'12px', fontWeight:'600', color:'#374151'}}>No upcoming holidays</p>
                  </div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                    {upcomingHolidays.map((holiday, i) => (
                      <div key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'6px 10px', background:'linear-gradient(135deg, #fef9c3, #fef08a)', borderRadius:'8px', border:'1px solid #fde047'}}>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:'36px', height:'36px', background:'#fff', borderRadius:'6px', border:'1.5px solid #f59e0b', flexShrink:0}}>
                          <div style={{fontSize:'14px', fontWeight:'700', color:'#b45309', lineHeight:'1'}}>{new Date(holiday.date + 'T00:00:00').getDate()}</div>
                          <div style={{fontSize:'8px', fontWeight:'600', color:'#92400e', textTransform:'uppercase'}}>{new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', {month:'short'})}</div>
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontWeight:'600', fontSize:'12px', color:'#78350f', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{holiday.title}</div>
                          <div style={{fontSize:'10px', color:'#92400e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{holiday.description || 'Public Holiday'}</div>
                        </div>
                        <div style={{fontSize:'10px', fontWeight:'600', color:'#b45309', padding:'2px 6px', background:'#fff', borderRadius:'4px', whiteSpace:'nowrap', flexShrink:0}}>
                          {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', {weekday:'short'})}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })()}
        {/* MAIN GRID */}
        <div className="main-grid">

          {/* LEFT */}
          <div>
            {/* EMP DIRECTORY */}
            <div className="panel emp-panel">
              <div className="panel-header">
                <h3>Employee Directory</h3>
              </div>

              <div className="emp-filters">
                <div className="emp-search">
                  <FaSearch className="emp-search-icon" />
                  <input
                    className="emp-search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employee..."
                  />
                </div>

                <select
                  className="emp-select"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option>All</option>
                  <option>HR</option>
                  <option>IT</option>
                  <option>Sales</option>
                </select>
              </div>

              <div className="scrollable-box emp-scroll">
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {employees.length === 0 ? (
  <tr>
    <td colSpan="4">No employees</td>
  </tr>
) : (
  employees
    .filter(emp => (emp.status || "").toUpperCase() === "ACTIVE")
    .slice(0, 5)
    .map((emp, index) => (
      <tr key={emp.employeeId || index}>
        <td className="emp-cell">
          <img
            src={
              emp.image && emp.image !== ""
                ? emp.image
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}`
            }
            alt=""
          />
          {emp.fullName}
        </td>

        <td>{emp.department}</td>
        <td>{emp.designation}</td>

        <td>
          <span className="status active">{emp.status}</span>
        </td>
      </tr>
    ))
)}

                  </tbody>
                </table>
              </div>
            </div>

            {/* CHARTS */}
            <div className="chart-row">

              {/* ATTENDANCE */}
              <div className="panel chart-box attendance-panel">
                <h2>Attendance</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={Array.isArray(attendanceChartData) && attendanceChartData.length > 0 ? attendanceChartData : []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leave" fill="#facc15" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="attendance-legend">
                  <span className="legend present">● Present</span>
                  <span className="legend leave">● Leave</span>
                  <span className="legend absent">● Absent</span>
                </div>
              </div>

              {/* LEAVE */}
              <div className="panel chart-box">
                <h2>Leave Summary</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Array.isArray(leaveChartData) && leaveChartData.length > 0 ? leaveChartData : []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={0}
                      paddingAngle={2}
                      label={({ name, value }) => value > 0 ? `${value}` : ''}
                      labelLine={false}
                    >
                      {leaveChartData.map((entry, index) => {
                        const colors = ['#22c55e', '#facc15', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="leave-legend">
                  <span className="approved">● Approved</span>
                  <span className="pending">● Pending</span>
                  <span className="rejected">● Rejected</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="panel right-panel">
            <div className="check-card">
              <div className="check-header">
                <FaMapMarkerAlt className="gps-icon" />
                <span>{location}</span>
              </div>

              <div className="check-buttons">
                <div>
                  <p>Check-In</p>
                  <h2>Not checked in</h2>
                 <button
  className="check-btn"
 onClick={async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: String(
  user?.employeeId ||
  user?.empId ||
  user?.id ||
  ""
).trim(),

empId:
  user?.employeeId ||
  user?.empId ||
  user?.id ||
  "",
        name:
  user?.name ||
  user?.fullName ||
  user?.email ||
  "N/A",
        department: user?.department,
         message: `${user?.name} checked in`,
    type: "success",
    link: "/attendance"
      }),
    });

 if (res.ok) {
  alert("Check-in successful");
  await refreshAttendanceStatus(); // 🔄 LIVE UPDATE
} else {
  alert("Check-in failed");
}
  } catch (err) {
    console.error(err);
    alert("Error during check-in");
  }
}}
>
  Check In
</button>
                </div>
         
                <div>
                  <p>Check-Out</p>
                  <h2>Not checked out</h2>
                 <button
  className="check-btn red-btn"
onClick={async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/attendance/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
    
         message: `${user?.name} checked out`,
    type: "info",
    link: "/attendance"
      }),
    });

  if (res.ok) {
  alert("Check-out successful");
  await refreshAttendanceStatus(); // 🔄 LIVE UPDATE
} else {
  alert("Check-out failed");
}
  } catch (err) {
    console.error(err);
    alert("Error during check-out");
  }
}}
>
  Check Out
</button>
                </div>
              </div>
            </div>

            <Calendar 
              className="styled-calendar" 
              value={selectedDate}
              onChange={setSelectedDate}
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const events = getEventsForDate(date);
                  if (events.length > 0) {
                    return <div className="calendar-event-indicator">•</div>;
                  }
                }
                return null;
              }}
              tileClassName={({ date, view }) => {
                if (view !== 'month') return null;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                const dateStr = date.toISOString().split('T')[0];
                const isWeeklyOff = weeklyOffDays.includes(dayName);
                const isHoliday = (homeData?.events || []).some(
                  e => e.type === 'Holiday' && e.date === dateStr
                );
                if (isHoliday) return 'calendar-holiday';
                if (isWeeklyOff) return 'calendar-weekly-off';
                return null;
              }}
            />

            {/* ── Holiday & Weekly Off Info Panel (below calendar) ── */}
            <div style={{
              marginTop: 10,
              background: "#f8fafc",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              overflow: "hidden"
            }}>
              {/* Weekly Off Row */}
              <div style={{
                padding: "8px 12px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ fontSize: 14 }}>📅</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Weekly Off:</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {weeklyOffDays.length > 0 ? weeklyOffDays.map(day => (
                    <span key={day} style={{
                      padding: "2px 8px", borderRadius: 10,
                      background: "#dbeafe", color: "#1e40af",
                      fontSize: 11, fontWeight: 600
                    }}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                  )) : (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>None configured</span>
                  )}
                </div>
              </div>

              {/* Upcoming Holidays List */}
              <div style={{ padding: "8px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                  🎉 Upcoming Holidays
                </div>
                {upcomingHolidays.length === 0 ? (
                  <div style={{ fontSize: 11, color: "#6b7280" }}>No upcoming holidays</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {upcomingHolidays.slice(0, 4).map((h, i) => {
                      const d = new Date(h.date + 'T00:00:00');
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "4px 8px",
                          background: "linear-gradient(135deg, #fef9c3, #fef08a)",
                          borderRadius: 6, border: "1px solid #fde047"
                        }}>
                          <div style={{
                            minWidth: 28, height: 28,
                            background: "#fff", borderRadius: 4,
                            border: "1.5px solid #f59e0b",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", lineHeight: 1 }}>
                              {d.getDate()}
                            </div>
                            <div style={{ fontSize: 8, color: "#92400e", textTransform: "uppercase" }}>
                              {d.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 11, fontWeight: 600, color: "#78350f",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                            }}>{h.title}</div>
                            <div style={{ fontSize: 10, color: "#92400e" }}>
                              {d.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="calendar-event-box">
              <h4>Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</h4>
              
              {(() => {
                const events = getEventsForDate(selectedDate);
                if (events.length > 0) {
                  return (
                    <div className="events-list">
                      {events.map((event, index) => (
                        <div key={index} className="event-item">
                          🎉 {event}
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return <p>No events for this date</p>;
                }
              })()}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="bottom-grid">
          <div className="panel small-panel">
            <h3>Last 3 Months Payroll</h3>
            <div className="scrollable-box payroll-scroll">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Gross</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {last3MonthsPayroll.map((payroll, index) => (
                    <tr key={index}>
                      <td>{payroll.employee}</td>
                      <td>{payroll.month}</td>
                      <td>${payroll.gross}</td>
                      <td>${payroll.deductions}</td>
                      <td>${payroll.net}</td>
                      <td><button className="btn-primary" onClick={() => navigate("/payroll")}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel small-panel">
            <div className="panel-header">
              <h3>Notifications</h3>
              <FaEllipsisH />
            </div>
            <div className="scrollable-box notif-scroll">
              {systemNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`notify ${notification.type}`}
                  onClick={() => {
                    if (notification.link) navigate(notification.link);
                  }}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  {notification.message}
                  {notification.badge > 0 && (
                    <span className="notification-badge">{notification.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  }