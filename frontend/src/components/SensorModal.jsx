import React, { useEffect, useState } from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import { FaSync, FaPlay, FaStop } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import SensorGauge from "./SensorGauge";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorModal = ({
  show,
  onHide,
  sensorAsset,
  sensorData,
  sensorLoading,
  realTimeLoading,
  connectionStatus,
  lastUpdate,
  onRefresh,
  onStartRealTime,
  onStopRealTime
}) => {
  // Local state for real-time toggle (controlled by parent functions)
  const [localRealTime, setLocalRealTime] = useState(false);

  // Sync local real-time state with modal open
  useEffect(() => {
    if (show) {
      // When modal opens, start real-time
      setLocalRealTime(true);
      if (onStartRealTime) onStartRealTime();
    } else {
      // When modal closes, stop real-time
      if (localRealTime && onStopRealTime) onStopRealTime();
      setLocalRealTime(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const latestData = sensorData[sensorData.length - 1];

  const chartData = {
    labels: sensorData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "دمای موتور (°C)",
        data: sensorData.map(d => d.temperature),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        tension: 0.3
      },
      {
        label: "جریان موتور (A)",
        data: sensorData.map(d => d.motor_current),
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(54,162,235,0.2)",
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "تغییرات داده‌ها در طول زمان" }
    },
    scales: {
      x: { type: "category", display: true, title: { display: true, text: "زمان" } },
      y: { display: true, title: { display: true, text: "مقدار" } }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered dir="rtl">
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>نمودار سنسور - {sensorAsset?.name}</span>
            <div className="d-flex align-items-center gap-2">
              <div className={`status-indicator ${
                connectionStatus === 'connected' ? 'text-success' :
                connectionStatus === 'error' ? 'text-danger' : 'text-warning'
              }`}>
                <small>
                  {connectionStatus === 'connected' && 'متصل'}
                  {connectionStatus === 'connecting' && 'در حال اتصال...'}
                  {connectionStatus === 'error' && 'خطا در اتصال'}
                  {connectionStatus === 'disconnected' && 'قطع'}
                </small>
              </div>
              {lastUpdate && <small className="text-muted">آخرین بروزرسانی: {lastUpdate.toLocaleTimeString()}</small>}
              <div className="d-flex gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={onRefresh}
                  disabled={realTimeLoading || localRealTime}
                >
                  <FaSync className={realTimeLoading ? "spinning" : ""} />
                </Button>
                {!localRealTime ? (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => {
                      setLocalRealTime(true);
                      if (onStartRealTime) onStartRealTime();
                    }}
                    disabled={realTimeLoading}
                  >
                    <FaPlay /> لحظه‌ای
                  </Button>
                ) : (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setLocalRealTime(false);
                      if (onStopRealTime) onStopRealTime();
                    }}
                  >
                    <FaStop /> توقف
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {sensorLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted">در حال بارگذاری داده‌ها...</div>
          </div>
        ) : sensorData.length === 0 ? (
          <div className="text-center text-muted py-4">داده‌ای برای این دارایی موجود نیست</div>
        ) : (
          <>
            {localRealTime && (
              <Alert variant="info" className="d-flex align-items-center py-2">
                <FaSync className="spinning me-2" />
                <small className="mb-0">
                  دریافت داده‌ها به صورت لحظه‌ای فعال است - آخرین بروزرسانی: {lastUpdate?.toLocaleTimeString()}
                </small>
              </Alert>
            )}

            {latestData && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                padding: "20px",
                background: "#1a1a2e",
                borderRadius: "10px",
                marginBottom: "20px"
              }}>
                {/* Gauges */}
                <SensorGauge value={latestData.temperature || 0} min={0} max={100} label="دما" unit="°C"
                  thresholds={[
                    { from: 0, to: 40, color: "#4ecca3", status: "Normal" },
                    { from: 40, to: 70, color: "#f9a826", status: "Warning" },
                    { from: 70, to: 100, color: "#e84545", status: "Danger" }
                  ]}
                />
                <SensorGauge value={latestData.motor_current || 0} min={0} max={50} label="جریان موتور" unit="A"
                  thresholds={[
                    { from: 0, to: 20, color: "#4ecca3", status: "Normal" },
                    { from: 20, to: 35, color: "#f9a826", status: "Warning" },
                    { from: 35, to: 50, color: "#e84545", status: "Danger" }
                  ]}
                />
                <SensorGauge value={latestData.motor_voltage || 0} min={0} max={500} label="ولتاژ موتور" unit="V"
                  thresholds={[
                    { from: 350, to: 400, color: "#4ecca3", status: "Normal" },
                    { from: 300, to: 350, color: "#f9a826", status: "Warning" },
                    { from: 400, to: 450, color: "#f9a826", status: "Warning" },
                    { from: 0, to: 300, color: "#e84545", status: "Danger" },
                    { from: 450, to: 500, color: "#e84545", status: "Danger" }
                  ]}
                />
                <SensorGauge value={latestData.vibration_x || 0} min={0} max={5} label="ارتعاش X" unit="g"
                  thresholds={[
                    { from: 0, to: 1, color: "#4ecca3", status: "Normal" },
                    { from: 1, to: 2, color: "#f9a826", status: "Warning" },
                    { from: 2, to: 5, color: "#e84545", status: "Danger" }
                  ]}
                />
                <SensorGauge value={latestData.vibration_y || 0} min={0} max={5} label="ارتعاش Y" unit="g"
                  thresholds={[
                    { from: 0, to: 1, color: "#4ecca3", status: "Normal" },
                    { from: 1, to: 2, color: "#f9a826", status: "Warning" },
                    { from: 2, to: 5, color: "#e84545", status: "Danger" }
                  ]}
                />
                <SensorGauge value={latestData.vibration_z || 0} min={0} max={5} label="ارتعاش Z" unit="g"
                  thresholds={[
                    { from: 0, to: 1, color: "#4ecca3", status: "Normal" },
                    { from: 1, to: 2, color: "#f9a826", status: "Warning" },
                    { from: 2, to: 5, color: "#e84545", status: "Danger" }
                  ]}
                />
              </div>
            )}

            <Line key={sensorAsset?.id} data={chartData} options={chartOptions} />
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SensorModal;
