import React from "react";
import Icon from "./Icon";

export function LoadingState({ label = "Loading information…" }) {
  return (
    <div className="state-view" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon = "orders", title, message, actionLabel, onAction }) {
  return (
    <div className="state-view empty-state">
      <span className="state-icon"><Icon name={icon} size={25} /></span>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && (
        <button className="button button-primary" type="button" onClick={onAction}>
          <Icon name="plus" size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-view error-state" role="alert">
      <span className="state-icon"><Icon name="warning" size={25} /></span>
      <h3>We could not load this information</h3>
      <p>{error?.message || "Check that the Spring Boot API is running and try again."}</p>
      {onRetry && (
        <button className="button button-secondary" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
