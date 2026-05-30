import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    lf: false,
    eaf: false,
    productionPlan: false,
    ccm: false,
    quality: false,
    reports: false,
    settings: false,
    plc: false,
    meetings: false  // اضافه کردن منوی جلسات
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Helper function to check if any submenu item is active (to keep menu open)
  const isMenuActive = (paths) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  return (
    <div className="container-fluid side-bar-container">
      <header className="pb-0">
        <Link className="navbar-brand" to="/">
          <img
            style={{
              maxWidth: "210px",
              height: "auto"
            }}
            src="/images/logo_111.png"
            alt="MITE Logo"
          />
        </Link>
      </header>

      {/* Dashboard */}
      <li className="side a-collapse short m-2 pr-1 pl-1">
        <Link to="/" className={`side-item ${isActive('/') ? 'selected' : ''} c-dark`}>
          <i className="fas fa-tachometer-alt mr-1"></i>Dashboard
        </Link>
      </li>

      {/* ==================== MEETING ASSISTANT ==================== */}
      <ul className="side a-collapse short">
        <div
          className={`ul-text fnt-mxs ${openMenus.meetings ? 'open' : ''}`}
          title="Meeting Assistant - دستیار جلسات"
          onClick={() => toggleMenu('meetings')}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-microphone-alt mr-1"></i>
          دستیار جلسات
          <i className={`fas fa-chevron-${openMenus.meetings ? 'down' : 'right'} arrow`}></i>
        </div>
        <div className={`side-item-container ${openMenus.meetings || isMenuActive(['/meetings', '/meeting']) ? 'show' : 'hide'} animated`}>
          <li className="side-item">
            <Link to="/meetings/recorder" className={`side-link ${isActive('/meetings/recorder') ? 'active' : ''}`}>
              <i className="fas fa-microphone mr-1"></i>
              ضبط جلسه جدید
            </Link>
          </li>
          <li className="side-item">
            <Link to="/meetings/list" className={`side-link ${isActive('/meetings/list') ? 'active' : ''}`}>
              <i className="fas fa-list mr-1"></i>
              لیست جلسات
            </Link>
          </li>
        </div>
      </ul>


      <ul className="side a-collapse short">
        <div
          className={`ul-text fnt-mxs ${openMenus.plc ? 'open' : ''}`}
          title="Follow Up - پیگیری وظایف"
          onClick={() => toggleMenu('plc')}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-microchip mr-1"></i>
          پیگیری وظایف
          <i className={`fas fa-chevron-${openMenus.plc ? 'down' : 'right'} arrow`}></i>
        </div>
        <div className={`side-item-container ${openMenus.plc || isMenuActive(['/plc']) ? 'show' : 'hide'} animated`}>
{/*           <li className="side-item"> */}
{/*             <Link to="/plc/dashboard" className={`side-link ${isActive('/plc/dashboard') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-tachometer-alt mr-1"></i> */}
{/*               PLC Dashboard */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/plc/connection" className={`side-link ${isActive('/plc/connection') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-plug mr-1"></i> */}
{/*               Connection Status */}
{/*             </Link> */}
{/*           </li> */}

{/*           <li className="side-item"> */}
{/*             <Link to="/plc/tags" className={`side-link ${isActive('/plc/tags') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-tags mr-1"></i> */}
{/*               Tag Monitor */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/plc/data-logger" className={`side-link ${isActive('/plc/data-logger') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-database mr-1"></i> */}
{/*               Data Logger */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/plc/alarms" className={`side-link ${isActive('/plc/alarms') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-bell mr-1"></i> */}
{/*               Alarms & Events */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/plc/history" className={`side-link ${isActive('/plc/history') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-chart-line mr-1"></i> */}
{/*               Historical Data */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/plc/configuration" className={`side-link ${isActive('/plc/configuration') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-cog mr-1"></i> */}
{/*               PLC Configuration */}
{/*             </Link> */}
{/*           </li> */}
        </div>
      </ul>

{/*        */}{/* Production Plan */}
{/*       <ul className="side a-collapse short"> */}
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.productionPlan ? 'open' : ''}`} */}
{/*           title="Production Plan - برنامه تولید" */}
{/*           onClick={() => toggleMenu('productionPlan')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-chart-line mr-1"></i> */}
{/*           Production Plan */}
{/*           <i className={`fas fa-chevron-${openMenus.productionPlan ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
{/*         <div className={`side-item-container ${openMenus.productionPlan || isMenuActive(['/production']) ? 'show' : 'hide'} animated`}> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/production/orders" className={`side-link ${isActive('/production/orders') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-shopping-cart mr-1"></i> */}
{/*               Orders */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/production/buckets" className={`side-link ${isActive('/production/buckets') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-layer-group mr-1"></i> */}
{/*               Buckets */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/production/heats" className={`side-link ${isActive('/production/heats') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-fire mr-1"></i> */}
{/*               Heats */}
{/*             </Link> */}
{/*           </li> */}
{/*         </div> */}
{/*       </ul> */}

{/*        */}{/* Ladle Furnace (LF) */}
{/*       <ul className="side a-collapse short"> */}
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.lf ? 'open' : ''}`} */}
{/*           title="LF Process - فرآیند پاتیل" */}
{/*           onClick={() => toggleMenu('lf')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-tint mr-1"></i> */}
{/*           Ladle Furnace (LF) */}
{/*           <i className={`fas fa-chevron-${openMenus.lf ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
{/*         <div className={`side-item-container ${openMenus.lf || isMenuActive(['/lf']) ? 'show' : 'hide'} animated`}> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/monitoring" className={`side-link ${isActive('/lf/monitoring') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-chart-line mr-1"></i> */}
{/*               Process Monitoring */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/heat-data" className={`side-link ${isActive('/lf/heat-data') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-thermometer-half mr-1"></i> */}
{/*               Heat Data */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/temperature-control" className={`side-link ${isActive('/lf/temperature-control') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-temperature-high mr-1"></i> */}
{/*               Temperature Control */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/alloy-calculation" className={`side-link ${isActive('/lf/alloy-calculation') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-calculator mr-1"></i> */}
{/*               Alloy Calculation */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/analysis" className={`side-link ${isActive('/lf/analysis') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-flask mr-1"></i> */}
{/*               Chemical Analysis */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/process-progress" className={`side-link ${isActive('/lf/process-progress') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-chart-line mr-1"></i> */}
{/*               Process Progress */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/events" className={`side-link ${isActive('/lf/events') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-history mr-1"></i> */}
{/*               Events & Timeline */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/lf/delays" className={`side-link ${isActive('/lf/delays') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-clock mr-1"></i> */}
{/*               Delays & Stoppages */}
{/*             </Link> */}
{/*           </li> */}
{/*         </div> */}
{/*       </ul> */}

{/*        */}{/* Electric Arc Furnace (EAF) */}
{/*       <ul className="side a-collapse short"> */}
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.eaf ? 'open' : ''}`} */}
{/*           title="EAF Process - فرآیند کوره قوس الکتریکی" */}
{/*           onClick={() => toggleMenu('eaf')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-bolt mr-1"></i> */}
{/*           Electric Arc Furnace */}
{/*           <i className={`fas fa-chevron-${openMenus.eaf ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
{/*         <div className={`side-item-container ${openMenus.eaf || isMenuActive(['/eaf']) ? 'show' : 'hide'} animated`}> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/melting-control" className={`side-link ${isActive('/eaf/melting-control') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-fire mr-1"></i> */}
{/*               Melting Control */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/heat-data" className={`side-link ${isActive('/eaf/heat-data') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-info-circle mr-1"></i> */}
{/*               Heat Data */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/charging" className={`side-link ${isActive('/eaf/charging') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-truck mr-1"></i> */}
{/*               Charging */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/energy-monitor" className={`side-link ${isActive('/eaf/energy-monitor') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-plug mr-1"></i> */}
{/*               Energy Monitor */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/electrical-profile" className={`side-link ${isActive('/eaf/electrical-profile') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-chart-line mr-1"></i> */}
{/*               Electrical Profile */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/events" className={`side-link ${isActive('/eaf/events') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-list mr-1"></i> */}
{/*               Events */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/eaf/delays" className={`side-link ${isActive('/eaf/delays') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-clock mr-1"></i> */}
{/*               Delays */}
{/*             </Link> */}
{/*           </li> */}
{/*         </div> */}
{/*       </ul> */}

{/*        */}{/* Continuous Casting Machine (CCM) */}
{/*       <ul className="side a-collapse short"> */}
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.ccm ? 'open' : ''}`} */}
{/*           title="CCM Process - فرآیند ریخته‌گری مداوم" */}
{/*           onClick={() => toggleMenu('ccm')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-industry mr-1"></i> */}
{/*           Continuous Casting */}
{/*           <i className={`fas fa-chevron-${openMenus.ccm ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
{/*         <div className={`side-item-container ${openMenus.ccm || isMenuActive(['/ccm']) ? 'show' : 'hide'} animated`}> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/ccm/dashboard" className={`side-link ${isActive('/ccm/dashboard') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-tachometer-alt mr-1"></i> */}
{/*               CCM Dashboard */}
{/*             </Link> */}
{/*           </li> */}
{/*         </div> */}
{/*       </ul> */}

{/*        */}{/* Quality Control */}
{/*       <ul className="side a-collapse short"> */}
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.quality ? 'open' : ''}`} */}
{/*           title="Quality Control - کنترل کیفیت" */}
{/*           onClick={() => toggleMenu('quality')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-check-circle mr-1"></i> */}
{/*           Quality Control */}
{/*           <i className={`fas fa-chevron-${openMenus.quality ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
{/*         <div className={`side-item-container ${openMenus.quality || isMenuActive(['/quality']) ? 'show' : 'hide'} animated`}> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/quality/dashboard" className={`side-link ${isActive('/quality/dashboard') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-chart-line mr-1"></i> */}
{/*               Quality Dashboard */}
{/*             </Link> */}
{/*           </li> */}
{/*         </div> */}
{/*       </ul> */}

{/*        */}{/* Reports */}
{/*       <ul className="side a-collapse short"> */}
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.reports ? 'open' : ''}`} */}
{/*           title="Reports - گزارشات" */}
{/*           onClick={() => toggleMenu('reports')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-file-alt mr-1"></i> */}
{/*           Reports */}
{/*           <i className={`fas fa-chevron-${openMenus.reports ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
{/*         <div className={`side-item-container ${openMenus.reports || isMenuActive(['/reports']) ? 'show' : 'hide'} animated`}> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/reports/production" className={`side-link ${isActive('/reports/production') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-chart-bar mr-1"></i> */}
{/*               Production Reports */}
{/*             </Link> */}
{/*           </li> */}
{/*         </div> */}
{/*       </ul> */}

      {/* Settings */}
      <ul className="side a-collapse short">
{/*         <div */}
{/*           className={`ul-text fnt-mxs ${openMenus.settings ? 'open' : ''}`} */}
{/*           title="Settings - تنظیمات" */}
{/*           onClick={() => toggleMenu('settings')} */}
{/*           style={{ cursor: 'pointer' }} */}
{/*         > */}
{/*           <i className="fas fa-cog mr-1"></i> */}
{/*           Settings */}
{/*           <i className={`fas fa-chevron-${openMenus.settings ? 'down' : 'right'} arrow`}></i> */}
{/*         </div> */}
        <div className={`side-item-container ${openMenus.settings || isMenuActive(['/admin', '/settings']) ? 'show' : 'hide'} animated`}>
{/*           <li className="side-item"> */}
{/*             <Link to="/admin/users" className={`side-link ${isActive('/admin/users') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-users mr-1"></i> */}
{/*               User Management */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/profile" className={`side-link ${isActive('/profile') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-user mr-1"></i> */}
{/*               User Profile */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/settings/system" className={`side-link ${isActive('/settings/system') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-server mr-1"></i> */}
{/*               System Settings */}
{/*             </Link> */}
{/*           </li> */}
{/*           <li className="side-item"> */}
{/*             <Link to="/settings/plc" className={`side-link ${isActive('/settings/plc') ? 'active' : ''}`}> */}
{/*               <i className="fas fa-microchip mr-1"></i> */}
{/*               PLC Settings */}
{/*             </Link> */}
{/*           </li> */}
        </div>
      </ul>
    </div>
  );
};

export default Sidebar;