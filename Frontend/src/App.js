import React, { useCallback, useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import { ErrorState, LoadingState } from "./components/StateViews";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import VehiclesPage from "./pages/VehiclesPage";
import RepairOrdersPage from "./pages/RepairOrdersPage";
import InvoicesPage from "./pages/InvoicesPage";
import { useAppData } from "./state/AppContext";
import { useUI } from "./state/UIContext";

export default function App() {
  const { loading, error, reload } = useAppData();
  const { confirmAction } = useUI();
  const [page, setPage] = useState(() => localStorage.getItem("mechanicstream-page") || "dashboard");
  const [pageDirty, setPageDirty] = useState(false);

  useEffect(() => {
    localStorage.setItem("mechanicstream-page", page);
  }, [page]);

  useEffect(() => {
    const warn = (event) => {
      if (!pageDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pageDirty]);

  const navigate = useCallback(async (nextPage) => {
    if (nextPage === page) return;
    if (pageDirty) {
      const leave = await confirmAction({
        title: "Leave without saving?",
        message: "The form on this page contains changes that have not been saved.",
        details: "Leaving now will discard those form changes. No API request has been sent.",
        confirmLabel: "Discard and leave",
        tone: "danger",
      });
      if (!leave) return;
    }
    setPageDirty(false);
    setPage(nextPage);
  }, [confirmAction, page, pageDirty]);

  if (loading) return <LoadingState label="Connecting to the MechanicStream API…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <AppShell page={page} onNavigate={navigate}>
      {page === "dashboard" && <DashboardPage onNavigate={navigate} />}
      {page === "customers" && <CustomersPage onDirtyChange={setPageDirty} onNavigate={navigate} />}
      {page === "vehicles" && <VehiclesPage onDirtyChange={setPageDirty} onNavigate={navigate} />}
      {page === "orders" && <RepairOrdersPage onDirtyChange={setPageDirty} onNavigate={navigate} />}
      {page === "invoices" && <InvoicesPage />}
    </AppShell>
  );
}
