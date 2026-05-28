import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LFLayout } from './pages/LF';

// Pages
import Dashboard from "../pages/Dashboard";
import Locations from "../pages/Locations";
import Profile from "../pages/Profile";
import ProductionOrders from "../components/Production/ProductionOrders";
import ProductionBuckets from "../components/Production/ProductionBuckets";

function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Locations */}
      <Route path="/locations" element={<Locations />} />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />

      {/* Production Plan Routes */}
      <Route path="/production/orders" element={<ProductionOrders />} />
      <Route path="/production/buckets" element={<ProductionBuckets />} />

      {/* LF Routes */}
      <Route path="/lf" element={<LFLayout />} />
      <Route path="/lf/:tab" element={<LFLayout />} />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;