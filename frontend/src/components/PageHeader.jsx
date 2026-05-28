import React from "react";

const PageHeader = ({ title, subtitle, breadcrumbs }) => {
  return (
    <div className="page-header breadcrumb-header">
      <div className="row align-items-end">
        <div className="col-lg-8">
          <div className="page-header-title text-left-rtl">
            <div className="d-inline">
              <h3 className="lite-text">{title}</h3>
              <span className="lite-text">{subtitle}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <ol className="breadcrumb float-sm-right">
            <li className="breadcrumb-item">
              <a href="#"><i className="fas fa-home"></i></a>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li
                key={index}
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
              >
                {crumb}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;