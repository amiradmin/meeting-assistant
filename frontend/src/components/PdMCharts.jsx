import React, { useRef, useEffect, useState } from "react";

const PdMCharts = () => {
  const healthRef = useRef(null);
  const downtimeRef = useRef(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    // Wait for Chart.js to be available
    if (!window.Chart) {
      console.warn('Chart.js not loaded yet');
      return;
    }

    let healthChart = null;
    let downtimeChart = null;

    const initializeCharts = () => {
      // Destroy previous charts if they exist
      if (healthChart) {
        healthChart.destroy();
      }
      if (downtimeChart) {
        downtimeChart.destroy();
      }

      // Create health chart
      if (healthRef.current) {
        const ctx = healthRef.current.getContext('2d');
        if (ctx) {
          healthChart = new window.Chart(ctx, {
            type: "line",
            data: {
              labels: ["Jan", "Feb", "Mar", "Apr", "May"],
              datasets: [
                {
                  label: "شاخص سلامت ماشین",
                  data: [90, 88, 85, 87, 86],
                  borderColor: "#36A2EB",
                  backgroundColor: "rgba(54, 162, 235, 0.1)",
                  fill: true,
                  tension: 0.4
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          });
        }
      }

      // Create downtime chart
      if (downtimeRef.current) {
        const ctx = downtimeRef.current.getContext('2d');
        if (ctx) {
          downtimeChart = new window.Chart(ctx, {
            type: "bar",
            data: {
              labels: ["Machine 1", "Machine 2", "Machine 3", "Machine 4"],
              datasets: [
                {
                  label: "ساعت توقف",
                  data: [2, 3, 1.5, 4],
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          });
        }
      }

      setChartsReady(true);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeCharts, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (healthChart) {
        healthChart.destroy();
      }
      if (downtimeChart) {
        downtimeChart.destroy();
      }
    };
  }, []);

  return (
    <div className="row m-1">
      <div className="col-md-8 p-2">
        <div className="card shade h-100">
          <div className="card-body">
            <h5 className="card-title">شاخص سلامت ماشین</h5>
            <div style={{ height: '300px', position: 'relative' }}>
              <canvas ref={healthRef}></canvas>
              {!chartsReady && (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading chart...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-4 p-2">
        <div className="card shade h-100">
          <div className="card-body">
            <h5 className="card-title">زمان توقف ماشین‌ها</h5>
            <div style={{ height: '300px', position: 'relative' }}>
              <canvas ref={downtimeRef}></canvas>
              {!chartsReady && (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading chart...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdMCharts;