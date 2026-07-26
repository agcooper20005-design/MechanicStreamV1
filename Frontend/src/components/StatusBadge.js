import React from "react";
import { STATUS_LABELS } from "../utils/formatters";

export default function StatusBadge({ status = "OPEN" }) {
  const className = status.toLowerCase().replaceAll("_", "-");
  return (
    <span className={`status-badge status-${className}`}>
      <span aria-hidden="true" className="status-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
