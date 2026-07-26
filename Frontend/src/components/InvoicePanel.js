import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import Icon from "./Icon";
import InvoiceDocument from "./InvoiceDocument";
import { ErrorState, LoadingState } from "./StateViews";

export default function InvoicePanel({ orderId, showHeading = true }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      setInvoice(await api.invoices.byOrder(orderId));
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const print = () => {
    document.body.classList.add("printing-invoice");
    const cleanup = () => {
      document.body.classList.remove("printing-invoice");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  if (loading) return <LoadingState label="Preparing invoice…" />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <div className="invoice-panel">
      {showHeading && (
        <div className="invoice-toolbar no-print">
          <div><p className="eyebrow">Invoice preview</p><h3>Repair order RO-{orderId}</h3></div>
          <button className="button button-primary" type="button" onClick={print}>
            <Icon name="print" size={16} />
            Print invoice
          </button>
        </div>
      )}
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
