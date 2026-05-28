// components/RUL/PriorityIndicator.jsx
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PriorityIndicator = ({ priority }) => {
  const map = {
    high: "#e74c3c",
    medium: "#f39c12",
    low: "#2ecc71"
  };

  const label = priority === "high"
    ? "اولویت بالا"
    : priority === "medium"
    ? "اولویت متوسط"
    : "اولویت پایین";

  return (
    <OverlayTrigger overlay={<Tooltip>{label}</Tooltip>} placement="top">
      <div style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: map[priority]
      }} />
    </OverlayTrigger>
  );
};

export default PriorityIndicator;