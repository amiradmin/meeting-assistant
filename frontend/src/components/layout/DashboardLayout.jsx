import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "../ThemeToggle";  // اضافه کنید

const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  return (
    <div
      className={`bmd-layout-container bmd-drawer-f-l avam-container animated ${
        drawerOpen ? "bmd-drawer-in" : "bmd-drawer-out"
      }`}
    >
      {/* دکمه همبرگر برای موبایل */}
      <button
        className="drawer-toggle-btn"
        onClick={toggleDrawer}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          background: '#3b82f6',
          border: 'none',
          borderRadius: '8px',
          width: '40px',
          height: '40px',
          color: 'white',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <i className="fas fa-bars"></i>
      </button>

      <div
        id="dw-s1"
        className={`bmd-layout-drawer bg-faded ${
          drawerOpen ? "bmd-drawer-in" : "bmd-drawer-out"
        }`}
      >
        <Sidebar />
      </div>

      <main className="bmd-layout-content" style={{ minHeight: "100vh" }}>
        {/* هدر با دکمه تم */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '12px 24px',


          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <ThemeToggle />
        </div>

        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;