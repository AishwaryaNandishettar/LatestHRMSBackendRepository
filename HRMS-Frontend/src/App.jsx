import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CallProvider } from "./Context/CallContext";
import GlobalCallNotification from "./Components/GlobalCallNotification";

import { AuthContext } from "./Context/Authcontext";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import { AttendanceProvider } from "./Context/AttendanceContext";
import { TaskProvider } from "./Context/TaskContext";
/* Recruitment */
import RecruitmentDashboard from "./Pages/Recruitment/Recruitment";
import PipelineTable from "./Pages/Recruitment/PipelineTable";
import ATSTable from "./Pages/Recruitment/ATSTable";

/* Pages */
import Login from "./Pages/Login";
import DebugLogin from "./Pages/DebugLogin";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import EmployeeProfile from "./Pages/EmployeeProfile";
import Timesheet from "./Pages/Timesheet";
import Attendance from "./Pages/Attendance";
import Leave from "./Pages/Leave";
import InsuranceClaim from "./Pages/InsuranceClaim";
import EmployeeCard from "./Pages/Emplyeecard";
import Payroll from "./Pages/Payroll";
import Helpdesk from "./Pages/Helpdesk"; // ✅ adjust path if different

import UpdatePayroll from "./Pages/Payroll/UpdatePayroll";
import ReimbursementForm from "./Pages/ReimbursementForm";
import FinancialAssessment from "./Pages/financialAssesment";
import ProtectedRoute from "./Pages/ProtectedRoute";
import CibilCheck from "./Pages/CibilCheck";
import Onboarding from "./Pages/Onboarding";
import OtpVerification from "./Pages/OtpVerification";
import BGV from "./Pages/BGV";
import TasksModule from "./Pages/TaskProfessional";
import InvitePage from "./Pages/InvitePage";
import InviteAccept from "./Pages/InviteAccept";
import PersonalInsurance from "./Pages/PersonalInsurance";
import LoanApplication from "./Pages/LoanApplication";
import Report from "./Pages/Report";
import Settings from "./Pages/Settings";
import RevenueExpense from "./Pages/Financial/RevenueExpense";
import BudgetDetails from "./Pages/Financial/BudgetDetails";
import PayrollDetails from "./Pages/Financial/PayrollDetails";
import CashFlowDetails from "./Pages/Financial/CashFlowDetails";
import { PayrollProvider } from "./Context/PayrollContext";


/* ✅ NEW PERFORMANCE PAGE */
import Performance from "./Pages/Performance";

/* ✅ REPORT DETAIL PAGES */
import HiringAttritionDetails from "./Pages/Reports/HiringAttritionDetails";
import EmployeeGrowthDetails from "./Pages/Reports/EmployeeGrowthDetails";
import DepartmentDetails from "./Pages/Reports/DepartmentDetails";
import EmployeeCostDetails from "./Pages/Reports/EmployeeCostDetails";

/* Work Chat */
import WorkChat from "./Pages/WorkChat/WorkChat";
import JoinMeetingPage from "./Pages/WorkChat/Compo/Meetings/JoinMeetingPage";

/* Event Detail */
import EventDetail from "./Pages/EventDetail";


/* Sticky Notes */
import StickyNotesProvider from "./Components/StickyNotes/StickyNotesProvider";

import "./App.css";


/* ================= APP LAYOUT ================= */
function AppLayout() {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ default closed on mobile
  
const [notifications, setNotifications] = useState([]);
const [showNotif, setShowNotif] = useState(false);
  if (!user) return <Navigate to="/" replace />;

  // ✅ Detect mobile to auto-close sidebar after nav
  const isMobile = () => window.innerWidth <= 768;

  const handleMenuToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <StickyNotesProvider>
      <div className="app-container">
        {/* ✅ Mobile overlay — closes sidebar when tapped */}
        {isSidebarOpen && isMobile() && (
          <div className="sidebar-overlay" onClick={handleOverlayClick} />
        )}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="content-area">
         <Navbar
  notifications={notifications}
  setNotifications={setNotifications}
  showNotif={showNotif}
  setShowNotif={setShowNotif}
  onMenuToggle={handleMenuToggle}
/>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                  <Home
  notifications={notifications}
  setNotifications={setNotifications}
/>
                  </ProtectedRoute>
                }
              />

  {/* 👇 ADD EMPLOYEE ROUTE HERE */}
  <Route
    path="/employees"
    element={
      <ProtectedRoute roles={["admin", "manager", "hr"]}>
        <EmployeeCard />
      </ProtectedRoute>
    }
  />

              {/* ✅ PERFORMANCE ROUTE */}
              <Route
                path="/performance"
                element={
                  <ProtectedRoute>
                    <Performance />
                  </ProtectedRoute>
                }
              />

              {/* RECRUITMENT */}
             <Route
  path="/Recruitment"
  element={
    <ProtectedRoute roles={["admin", "manager"]}>
      <RecruitmentDashboard />
    </ProtectedRoute>
  }
/>

            <Route
  path="/recruitment/pipeline"
  element={
    <ProtectedRoute roles={["admin", "manager"]}>
      <PipelineTable />
    </ProtectedRoute>
  }
/>
<Route
  path="/recruitment/ats/:type"
  element={
    <ProtectedRoute roles={["admin", "manager"]}>
      <ATSTable />
    </ProtectedRoute>
  }
/>



           <Route
  path="/financial-assessment"
  element={
    <ProtectedRoute roles={["admin", "manager"]}>
      <FinancialAssessment />
    </ProtectedRoute>
  }
/> 
<Route path="/financial/revenue-expense" element={<RevenueExpense />} />
<Route path="/financial/budget" element={<BudgetDetails />} />
<Route path="/financial/payroll" element={<PayrollDetails />} />

<Route path="/update-payroll" element={<UpdatePayroll />} />
<Route path="/financial/cashflow" element={<CashFlowDetails />} />
              {/* EMPLOYEE */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

    <Route path="/employee-profile" element={<EmployeeProfile />} />
              <Route
                path="/timesheet"
                element={
                  <ProtectedRoute>
                    <Timesheet />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leave"
                element={
                  <ProtectedRoute>
                    <Leave />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/workchat"
                element={
                  <ProtectedRoute>
                    <WorkChat />
                  </ProtectedRoute>
                }
              />

<Route path="/join-meeting/:id" element={<JoinMeetingPage />} /> 
              {/* MANAGER / ADMIN */}
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute roles={["employee","manager", "admin"]}>
                    <Payroll />
                  </ProtectedRoute>
                }
              />

         

              <Route
                path="/report"
                element={
                  <ProtectedRoute roles={["manager", "admin"]}>
                    <Report />
                  </ProtectedRoute>
                }
              />

              {/* ✅ REPORT DETAIL ROUTES */}
              <Route
                path="/reports/hiring-attrition"
                element={
                  <ProtectedRoute roles={["manager", "admin"]}>
                    <HiringAttritionDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports/employee-growth"
                element={
                  <ProtectedRoute roles={["manager", "admin"]}>
                    <EmployeeGrowthDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports/department-distribution"
                element={
                  <ProtectedRoute roles={["manager", "admin"]}>
                    <DepartmentDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports/employee-cost"
                element={
                  <ProtectedRoute roles={["manager", "admin"]}>
                    <EmployeeCostDetails />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN ONLY */}
              <Route
                path="/insurance-claim"
                element={
                  <ProtectedRoute roles={["employee","manager","admin"]}>
                    <InsuranceClaim />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/personal-insurance"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <PersonalInsurance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reimbursement"
                element={
                  <ProtectedRoute roles={["employee","manager","admin"]}>
                    <ReimbursementForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employee-card"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <EmployeeCard />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/bgv"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <BGV />
                  </ProtectedRoute>
                }
              />


         <Route
  path="/invite"
  element={
    <ProtectedRoute roles={["admin"]}>
      <InvitePage />
    </ProtectedRoute>
  }
/>
 {/* ✅ EMPLOYEE INVITE LINK PAGE (NO PROTECTED ROUTE) */}
  <Route
    path="/invite-accept"
    element={<InviteAccept />}
  />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/cibil-check"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <CibilCheck />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/loan-application"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <LoanApplication />
                  </ProtectedRoute>
                }
              />

             <Route
  path="/tasks"
  element={
    <ProtectedRoute>
      <TasksModule />
    </ProtectedRoute>
  }
/>
<Route
  path="/helpdesk"
  element={
    <ProtectedRoute>
      <Helpdesk />
    </ProtectedRoute>
  }
/>
              {/* Event Detail — accessible by all roles */}
              <Route
                path="/events/:id"
                element={
                  <ProtectedRoute>
                    <EventDetail />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>

        {/* Global Call Notification - Shows on all pages */}
        <GlobalCallNotification />
      </div>
    </StickyNotesProvider>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Router>
      <PayrollProvider>
        <AttendanceProvider>
          <TaskProvider>
          
          <CallProvider>   {/* ✅ Global Call Provider */}
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/debug-login" element={<DebugLogin />} />

              <Route
                path="/onboarding"
                element={
                  isLoggedIn ? <Onboarding /> : <Navigate to="/" />
                }
              />

              <Route path="/otp" element={<OtpVerification />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
            
             </CallProvider>
          </TaskProvider>
        </AttendanceProvider>
      </PayrollProvider>
    </Router>
  );
}