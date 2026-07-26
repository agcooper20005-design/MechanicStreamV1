import React from "react";

export default function SafeForm({ children, className = "", onEnterBlocked, ...props }) {
  const blockSubmit = (event) => event.preventDefault();
  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (event.target.tagName === "TEXTAREA") return;
    event.preventDefault();
    onEnterBlocked?.();
  };

  return (
    <form
      {...props}
      className={className}
      onSubmit={blockSubmit}
      onKeyDown={handleKeyDown}
    >
      {children}
    </form>
  );
}
