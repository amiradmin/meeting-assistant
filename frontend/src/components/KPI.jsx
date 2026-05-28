import React from "react";

const KPI = ({ kpis }) => {

  return (
    <div className="row m-2">
      {kpis && kpis.length > 0 ? (
        kpis.map((kpi, index) => (
          <div className="col-md-3 col-sm-6 p-2" key={index}>
            <div className={`card text-center shadow-sm border-${kpi.color || "primary"}`}>
              <div className="card-body">
                <h5 className={`card-title text-${kpi.color || "primary"}`}>{kpi.title}</h5>
                <p className="card-text display-5">{kpi.value}</p>
                {kpi.subtitle && <small className="text-muted">{kpi.subtitle}</small>}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-12">
          <div className="alert alert-secondary text-center">هیچ KPIی موجود نیست</div>
        </div>
      )}
    </div>
  );
};

export default KPI;
