// src/pages/LF/LFLayout.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LFMainDashboard from '../../components/LF/LFMainDashboard';

const LFLayout = () => {
  return (
    <div className="lf-layout-container">
      <Routes>
        {/* مسیر پیش‌فرض برای /lf */}
        <Route index element={<LFMainDashboard furnaceId={1} initialTab="monitoring" />} />

        {/* مسیرهای مختلف برای هر تب */}
        <Route path="monitoring" element={<LFMainDashboard furnaceId={1} initialTab="monitoring" />} />
        <Route path="heat-data" element={<LFMainDashboard furnaceId={1} initialTab="heat-data" />} />
        <Route path="temperature" element={<LFMainDashboard furnaceId={1} initialTab="temperature" />} />
        <Route path="alloys" element={<LFMainDashboard furnaceId={1} initialTab="alloys" />} />
        <Route path="analysis" element={<LFMainDashboard furnaceId={1} initialTab="analysis" />} />
        <Route path="times" element={<LFMainDashboard furnaceId={1} initialTab="times" />} />
        <Route path="events" element={<LFMainDashboard furnaceId={1} initialTab="events" />} />
        <Route path="delays" element={<LFMainDashboard furnaceId={1} initialTab="delays" />} />
        <Route path="progress" element={<LFMainDashboard furnaceId={1} initialTab="progress" />} />

        {/* هر مسیر ناشناخته به monitoring برمی‌گردد */}
        <Route path="*" element={<LFMainDashboard furnaceId={1} initialTab="monitoring" />} />
      </Routes>
    </div>
  );
};

export default LFLayout;