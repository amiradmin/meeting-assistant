import React, { useEffect } from "react";

const WeatherWidget = () => {
  useEffect(() => {
    const weatherScript = document.createElement("script");
    weatherScript.id = "weatherwidget-io-js";
    weatherScript.src = "https://weatherwidget.io/js/widget.min.js";
    document.body.appendChild(weatherScript);

    return () => weatherScript.remove();
  }, []);

  return (
    <div className="row m-1">
      <div className="col-md-4 p-2">
        <div className="card flat f-first h-100">
          <div className="card-body">
            <h5 className="card-title">افزونه آب و هوا</h5>
            <hr />
            <a
              className="weatherwidget-io"
              href="https://forecast7.com/en/37d5545d08/urmia/"
              data-label_1="URMIA"
              data-label_2="WEATHER"
              data-icons="Climacons Animated"
              data-days="5"
              data-textcolor="#fafafaad"
            ></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
