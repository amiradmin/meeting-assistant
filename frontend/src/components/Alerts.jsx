import React from "react";

const Alerts = () => {
  return (
    <div className="row m-2 mb-1">
      <div className="col-12 p-2">
        <div
          className="alert text-dir-rtl text-right alert-third alert-shade alert-dismissible fade show"
          role="alert"
        >
          <strong>هشدار!</strong> هیچ هشداری وجود ندارد
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>


    </div>
  );
};

export default Alerts;
