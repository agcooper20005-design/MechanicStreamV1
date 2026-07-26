import React from "react";
import { API_BASE_URL } from "../api/client";
import { useAppData } from "../state/AppContext";
import { useUI } from "../state/UIContext";
import ContextBar from "./ContextBar";
import Icon from "./Icon";

const navigation = [
  { id: "dashboard", label: "Overview", icon: "dashboard" },
  { id: "customers", label: "Customers", icon: "customers" },
  { id: "vehicles", label: "Vehicles", icon: "car" },
  { id: "orders", label: "Repair orders", icon: "orders" },
  { id: "invoices", label: "Invoices", icon: "invoice" },
];

const meta = {
  dashboard: ["Shop overview", "Workload, workflow context, and recent activity."],
  customers: ["Customers", "Profiles, contact information, vehicles, and repair history."],
  vehicles: ["Vehicles", "Customer vehicles and their service relationships."],
  orders: ["Repair orders", "Notes, workflow status, parts, labor, and invoice access."],
  invoices: ["Invoices", "Review and print a complete invoice from a repair order."],
};

export default function AppShell({ page, onNavigate, children }) {
  const { theme, toggleTheme, textSize, toggleTextSize } = useUI();
  const { syncing } = useAppData();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => onNavigate("dashboard")}>
          <span className="brand-icon">MS</span>
          <span><strong>MechanicStream</strong><small>Technician workspace</small></span>
        </button>

        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? "active" : ""}
              onClick={() => onNavigate(item.id)}
              aria-current={page === item.id ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-help">
          <strong>Accessible display</strong>
          <p>Theme and text-size settings stay saved on this device.</p>
        </div>

        <div className="api-status" title={API_BASE_URL}>
          <span className="api-dot" />
          <span><strong>Local API</strong><small>{API_BASE_URL.replace(/^https?:\/\//, "")}</small></span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">MechanicStream</p>
            <h1>{meta[page][0]}</h1>
            <p>{meta[page][1]}</p>
          </div>
          <div className="display-controls">
            {syncing && <span className="sync-label" role="status"><span className="mini-spinner" />Updating</span>}
            <button
              type="button"
              className="display-button"
              onClick={toggleTextSize}
              aria-label={textSize === "normal" ? "Use larger text" : "Use normal text"}
            >
              <Icon name="text" />
              <span>{textSize === "normal" ? "Larger text" : "Normal text"}</span>
            </button>
            <button
              type="button"
              className="display-button"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <Icon name={theme === "light" ? "moon" : "sun"} />
              <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
            </button>
          </div>
        </header>

        <ContextBar onNavigate={onNavigate} />
        <div className="page-content">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={page === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
