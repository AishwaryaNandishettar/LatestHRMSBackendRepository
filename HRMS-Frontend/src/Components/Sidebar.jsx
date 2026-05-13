// src/Components/Sidebar.jsx

import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserTie } from "react-icons/fa";
import {
  FaHome,
  FaUserCircle,
  FaClock,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaShieldAlt,
  FaWallet,
  FaIdBadge,
  FaChartBar,
  FaSignOutAlt,
  FaUmbrellaBeach,
  FaCreditCard,
  FaHandHoldingUsd,
  FaComments,
  FaChevronLeft,
  FaChevronRight,
  FaTasks,          // ✅ ADDED
  FaChartLine       // ✅ ADDED
} from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import styles from "./Sidebar.module.css"; // ✅ KEEP THIS
import { AuthContext } from "../Context/Authcontext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ SAFE ROLE HANDLING
  const role = user?.role?.toLowerCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
const handleMenuClick = () => {
  if (window.innerWidth <= 768) {
    setIsOpen(false);
  }
};
  return (
    <div
      className={`${styles.sidebarContainer} ${
        isOpen ? styles.open : styles.closed
      }`}
    >
      {/* TOGGLE */}
      <div
        className={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </div>

      <h2 className={styles.sidebarTitle}>
        {isOpen && "Employee Portal"}
      </h2>

     <ul className={styles.sidebarMenu} onClick={handleMenuClick}>
       

        {/* BASIC */}
        <li>
          <NavLink to="/home">
            <FaHome />
            {isOpen && <span>Home</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/profile">
            <FaUserCircle />
            {isOpen && <span>Profile</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/timesheet">
            <FaClock />
            {isOpen && <span>Timesheet Management</span>}
          </NavLink>
        </li>

       <li>
  <NavLink to="/attendance">
    <FaCalendarCheck />
    {isOpen && <span>Attendance Management</span>}
  </NavLink>
</li>

 
      {/* RECRUITMENT */}
{(role === "admin" || role === "manager") && (
  <li>
    <NavLink to="/recruitment">
      <FaUserTie />
      {isOpen && <span>Recruitment</span>}
    </NavLink>
  </li>
)}

        <li>
  <NavLink to="/leave">
    <FaUmbrellaBeach />
    {isOpen && <span>Leave Management</span>}
  </NavLink>
</li>

        <li>
          <NavLink to="/workchat">
            <FaComments />
            {isOpen && <span>Work Chat</span>}
          </NavLink>
        </li>

        {/* ✅ NEW: TASKS */}
        <li>
          <NavLink to="/tasks">
            <FaTasks />
            {isOpen && <span>Tasks</span>}
          </NavLink>
        </li>

<li>
  <NavLink to="/helpdesk">
    <FaComments />
    {isOpen && <span>Helpdesk</span>}
  </NavLink>
</li>
        {/* ✅ PERFORMANCE (All users can view performance) */}
        <li>
          <NavLink to="/performance">
            <FaChartLine />
            {isOpen && <span>Performance</span>}
          </NavLink>
        </li>

        {/* PAYROLL */}
        {(role === "employee" || role === "manager" || role === "admin") && (
          <li>
            <NavLink to="/payroll">
              <FaMoneyBillWave />
              {isOpen && <span>Payroll</span>}
            </NavLink>
          </li>
        )}



       {/* ✅ FINANCIAL ASSESSMENT (Admin / Manager) */}
{(role === "admin" || role === "manager") && (
  <li>
    <NavLink to="/financial-assessment">
      <FaChartBar />
      {isOpen && <span>Financial Assessment</span>}
    </NavLink>
  </li>
)}
        {/* COMMON */}
        <li>
          <NavLink to="/insurance-claim">
            <FaShieldAlt />
            {isOpen && <span>Insurance Claim</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/reimbursement">
            <FaWallet />
            {isOpen && <span>Reimbursement</span>}
          </NavLink>
        </li>

        {/* ADMIN ONLY */}
        {role === "admin" && (
          <>
            <li>
              <NavLink to="/employee-card">
                <FaIdBadge />
                {isOpen && <span>Employee Directory</span>}
              </NavLink>
            </li>

            <li>
              <NavLink to="/report">
                <FaChartBar />
                {isOpen && <span>Report</span>}
              </NavLink>
            </li>

            <li>
              <NavLink to="/settings">
                <FiSettings />
                {isOpen && <span>Settings</span>}
              </NavLink>
            </li>

            <li>
              <NavLink to="/cibil-check">
                <FaCreditCard />
                {isOpen && <span>CIBIL Check</span>}
              </NavLink>
            </li>

            <li>
              <NavLink to="/loan-application">
                <FaHandHoldingUsd />
                {isOpen && <span>Loan Application</span>}
              </NavLink>
            </li>

            <li>
              <NavLink to="/bgv">
                <FaShieldAlt />
                {isOpen && <span>BGV</span>}
              </NavLink>
            </li>
            <li>
  <NavLink to="/invite">
    <FaUserTie />
    {isOpen && <span>Invite Employee</span>}
  </NavLink>
</li>
          </>
          
        )}

        {/* LOGOUT */}
        <li onClick={handleLogout} style={{ cursor: "pointer" }}>
          <FaSignOutAlt />
          {isOpen && <span>Logout</span>}
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;