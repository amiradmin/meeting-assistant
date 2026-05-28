import React from "react";

const PdMWidgets = () => {
  return (
    <div className="row m-1 mb-2">
      <div className="col-xl-3 col-md-6 col-sm-6 p-2">
        <div className="box-card text-right mini animate__animated animate__flipInY">
          <i className="fas fa-heartbeat b-first" aria-hidden="true"></i>
          <span className="mb-1 c-first">ماشین های سالم</span>
          <span>85%</span>
          <p className="mt-3 mb-1 text-right">
            <i className="fas fa-check mr-1 c-first"></i> بدون خطا
          </p>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 col-sm-6 p-2">
        <div className="box-card text-right mini animate__animated animate__flipInY">
          <i className="fas fa-exclamation-triangle b-second" aria-hidden="true"></i>
          <span className="mb-1 c-second">هشدارها</span>
          <span>5</span>
          <p className="mt-3 mb-1 text-right">
            <i className="fas fa-bolt mr-1 c-second"></i> فوری
          </p>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 col-sm-6 p-2">
        <div className="box-card text-right mini animate__animated animate__flipInY">
          <i className="fas fa-calendar-alt b-third" aria-hidden="true"></i>
          <span className="mb-1 c-third">سرویس برنامه ریزی شده</span>
          <span>12</span>
          <p className="mt-3 mb-1 text-right">
            <i className="fas fa-tools mr-1 c-third"></i> آماده اجرا
          </p>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 col-sm-6 p-2">
        <div className="box-card text-right mini animate__animated animate__flipInY">
          <i className="fas fa-clock b-forth" aria-hidden="true"></i>
          <span className="mb-1 c-forth">زمان توقف</span>
          <span>3h</span>
          <p className="mt-3 mb-1 text-right">
            <i className="fas fa-hourglass-half mr-1 c-forth"></i> در 24 ساعت
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdMWidgets;
