import React from "react";

const DashboardWidgets = () => {
  return (
    <div className="row m-1 mb-2">

      {/* Example widget */}
      <div className="col-xl-3 col-md-6 col-sm-6 p-2">
        <div className="box-card text-right mini animate__animated animate__flipInY">
          <i className="fab far fa-chart-bar b-first" aria-hidden="true"></i>
          <span className="mb-1 c-first">امتیاز</span>
          <span>30%</span>
          <p className="mt-3 mb-1 text-right">
            <i className="far fas fa-wallet mr-1 c-first"></i> در حال پیشرفت
          </p>
        </div>
      </div>
      {/* Repeat other widgets */}
       <div className="col-xl-3 col-md-6 col-sm-6 p-2">
                <div className="box-card text-right mini animate__animated animate__flipInY">
                  <i className="fab far fa-clock b-second" aria-hidden="true"></i>
                  <span className="mb-1 c-second">بازدید</span>
                  <span>27</span>
                  <p className="mt-3 mb-1 text-right">
                    <i className="far fas fa-wifi mr-1 c-second"></i> در حال پیشرفت
                  </p>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 col-sm-6 p-2">
                <div className="box-card text-right mini animate__animated animate__flipInY">
                  <i className="fab far fa-comments b-third" aria-hidden="true"></i>
                  <span className="mb-1 c-third">پیام ها</span>
                  <span>5</span>
                  <p className="mt-3 mb-1 text-right">
                    <i className="fab fa-whatsapp mr-1 c-third"></i> در حال پیشرفت
                  </p>
                </div>
              </div>


                            <div className="col-xl-3 col-md-6 col-sm-6 p-2">
                <div className="box-card text-right mini animate__animated animate__flipInY">
                  <i className="fab far fa-gem b-forth" aria-hidden="true"></i>
                  <span className="mb-1 c-forth">منابع</span>
                  <span>55,223</span>
                  <p className="mt-3 mb-1 text-right">
                    <i className="fab fa-bluetooth mr-1 c-forth"></i> در حال پیشرفت
                  </p>
                </div>
              </div>

    </div>
  );
};

export default DashboardWidgets;
