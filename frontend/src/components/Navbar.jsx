import React, { useState } from "react";


function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="bmd-layout-drawer bg-faded sidebar-container">
      <header className="sidebar-header">
        <a className="navbar-brand" href="#">
          <object
            className="side-logo"
            data="./svg/logo-8.svg"
            type="image/svg+xml"
          />
        </a>
      </header>

      <p className="side-comment">Tour</p>
      <li className="side a-collapse short">
        <a href="./fa.html" className="side-item">
          <i className="fas fa-language mr-1"></i> Persian{" "}
          <span className="badge badge-pill badge-success">new</span>
        </a>
      </li>

      {/* Pages Section */}
      <ul className="side a-collapse short">
        <a className="ul-text" onClick={() => toggleMenu("pages")}>
          <i className="fas fa-tachometer-alt mr-1"></i> Pages{" "}
          <i className={`fas fa-chevron-down arrow ${openMenu === "pages" ? "open" : ""}`}></i>
        </a>
        <div className={`side-item-container ${openMenu === "pages" ? "show" : "hide"}`}>
          <li className="side-item selected">
            <a href="./">Dashboard</a>
          </li>
          <li className="side-item">
            <a href="./dark.html">Dark Dashboard</a>
          </li>
          <li className="side-item">
            <a href="./Login.html">Login</a>
          </li>
          <li className="side-item">
            <a href="./glogin.html">Login Colored</a>
          </li>
        </div>
      </ul>

      {/* Add more sections similarly */}
    </div>
  );
}

export default Sidebar;
