import React from "react";

const SensorGauge = ({
  value,
  min = 0,
  max = 100,
  label = "Sensor",
  unit = "",
  thresholds = [
    { from: 0, to: 40, color: "#4ecca3", status: "Normal" },
    { from: 40, to: 70, color: "#f9a826", status: "Warning" },
    { from: 70, to: 100, color: "#e84545", status: "Danger" }
  ]
}) => {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;
  const needleAngle = (percentage / 100) * 180 - 90;

  const currentThreshold = thresholds.find(t => percentage >= t.from && percentage <= t.to);
  const status = currentThreshold?.status || "Normal";

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'danger': return '#e84545';
      case 'warning': return '#f9a826';
      case 'normal': return '#4ecca3';
      default: return '#8f8f8f';
    }
  };

  // Build dynamic conic gradient based on thresholds
  const buildGaugeGradient = () => {
    let gradientString = "conic-gradient(from 0.25turn at 50% 100%, ";

    thresholds.forEach((threshold, index) => {
      const startPercent = threshold.from;
      const endPercent = threshold.to;
      gradientString += `${threshold.color} ${startPercent}% ${endPercent}%`;

      if (index < thresholds.length - 1) {
        gradientString += ", ";
      }
    });

    gradientString += ")";
    return gradientString;
  };

  return (
    <div style={{
      width: "220px",
      height: "160px",
      textAlign: "center",
      padding: "15px",
      background: "#16213e",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }}>
      {/* Gauge Label */}
      <div style={{
        fontSize: "1rem",
        fontWeight: "600",
        marginBottom: "8px",
        color: "#4ecca3"
      }}>
        {label}
      </div>

      {/* Pure CSS Gauge */}
      <div style={{
        width: "160px",
        height: "80px",
        position: "relative",
        marginBottom: "10px",
        overflow: "hidden"
      }}>
        {/* Gauge Background with dynamic gradient */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: buildGaugeGradient(),
          borderRadius: "80px 80px 0 0",
          zIndex: 1
        }} />

        {/* Gauge Cover */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "120px",
          height: "60px",
          background: "#16213e",
          borderRadius: "60px 60px 0 0",
          zIndex: 2
        }} />

        {/* Needle */}
        <div style={{
          position: "absolute",
          bottom: "0px",
          left: "50%",
          width: "4px",
          height: "70px",
          backgroundColor: "#ffffff",
          border: "1px solid #000000",
          borderRadius: "2px",
          transform: `translateX(-50%) rotate(${needleAngle}deg)`,
          transformOrigin: "bottom center",
          boxShadow: "0 0 6px rgba(0,0,0,0.8)",
          transition: "transform 0.5s ease",
          zIndex: 3
        }} />

        {/* Center Pivot */}
        <div style={{
          position: "absolute",
          bottom: "0px",
          left: "50%",
          width: "16px",
          height: "16px",
          backgroundColor: "#2a2a2a",
          border: "3px solid #ffffff",
          borderRadius: "50%",
          transform: "translate(-50%, 50%)",
          boxShadow: "0 0 6px rgba(0,0,0,0.5)",
          zIndex: 4
        }} />
      </div>

      {/* Value Display */}
      <div style={{
        textAlign: "center",
        marginBottom: "5px"
      }}>
        <div style={{
          fontSize: "1.3rem",
          fontWeight: "bold",
          color: "#ffffff",
          lineHeight: "1.2"
        }}>
          {value.toFixed(2)} <span style={{ fontSize: "0.8rem", color: "#8f8f8f" }}>{unit}</span>
        </div>
      </div>

      {/* Status indicator */}
      <div style={{
        fontSize: "0.75rem",
        color: getStatusColor(status),
        fontWeight: "500",
        padding: "2px 10px",
        borderRadius: "8px",
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${getStatusColor(status)}40`
      }}>
        {status}
      </div>

      {/* Min/Max labels */}
      <div style={{
        position: "absolute",
        bottom: "55px",
        left: "15px",
        fontSize: "0.65rem",
        color: "#8f8f8f",
        fontWeight: "500"
      }}>
        {min}
      </div>
      <div style={{
        position: "absolute",
        bottom: "55px",
        right: "15px",
        fontSize: "0.65rem",
        color: "#8f8f8f",
        fontWeight: "500"
      }}>
        {max}
      </div>
    </div>
  );
};

export default SensorGauge;