import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

useEffect(() => {
  setIsOpen(false);   // 👈 AUTO CLOSE on page change
}, [location.pathname]);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={styles.main}>
        <Navbar onMenuToggle={() => setIsOpen(!isOpen)} />
        {children}
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}