// components/RUL/StatusBadge.jsx
import React from "react";
import { Badge } from "react-bootstrap";
import { FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";
import { getRULStatus } from "../../utils/rulHelpers";

const StatusBadge = ({ percent }) => {
  const status = getRULStatus(percent);

  // Map icon names to actual components
  const iconMap = {
    critical: <FaExclamationTriangle />,
    warning: <FaClock />,
    safe: <FaCheckCircle />
  };

  const iconComponent = iconMap[status.icon] || <FaCheckCircle />;

  return (
    <Badge
      bg="transparent"
      className="d-flex align-items-center gap-1"
      style={{
        color: status.color,
        border: `1px solid ${status.color}`,
        fontSize: ".8rem",
        padding: ".35rem .6rem"
      }}
    >
      {iconComponent}
      {status.label}
    </Badge>
  );
};

export default StatusBadge;