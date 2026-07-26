import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAppData } from "../state/AppContext";
import { useUI } from "../state/UIContext";
import { laborLineTotal, money } from "../utils/formatters";
import Icon from "./Icon";
import Modal from "./Modal";
import SafeForm from "./SafeForm";
import { EmptyState, ErrorState, LoadingState } from "./StateViews";

const blankLabor = {
  technician: "",
  hours: "",
  laborRate: "",
};

export default function LaborPanel({ orderId, onDirtyChange, onChanged }) {
  const { setLaborItems } = useAppData();
  const { confirmAction, notify } = useUI();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankLabor);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems((await api.orders.labor(orderId)) || []);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing("create");
    setForm(blankLabor);
    setDirty(false);
    setFormError("");
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      technician: item.technician || "",
      hours: item.hours ?? "",
      laborRate: item.laborRate ?? "",
    });
    setDirty(false);
    setFormError("");
  };

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setFormError("");
  };

  const close = async () => {
    if (dirty) {
      const approved = await confirmAction({
        title: "Discard labor changes?",
        message: "The labor form contains unsaved changes.",
        confirmLabel: "Discard changes",
        tone: "danger",
      });
      if (!approved) return;
    }
    setDirty(false);
    setEditing(null);
  };

  const syncGlobalLabor = (updater) => setLaborItems((current) => updater(current));

  const save = async () => {
    if (!form.technician.trim() || Number(form.hours) < 0 || Number(form.laborRate) < 0 || form.hours === "" || form.laborRate === "") {
      setFormError("Technician, non-negative hours, and non-negative labor rate are required.");
      return;
    }
    const creating = editing === "create";
    const approved = await confirmAction({
      title: creating ? "Add this labor item?" : "Update this labor item?",
      message: `${creating ? "Add" : "Save"} ${form.hours} hour(s) for ${form.technician.trim()} on RO-${orderId}?`,
      details: `${money(form.laborRate)} per hour · ${money(Number(form.hours) * Number(form.laborRate))} total`,
      confirmLabel: creating ? "Add labor" : "Save labor",
    });
    if (!approved) return;

    setSaving(true);
    try {
      const payload = {
        technician: form.technician.trim(),
        hours: Number(form.hours),
        laborRate: Number(form.laborRate),
        ...(creating ? { repairOrderId: Number(orderId) } : {}),
      };
      const result = creating
        ? await api.labor.create(payload)
        : await api.labor.update(editing.id, payload);
      syncGlobalLabor((current) => {
        const exists = current.some((item) => item.id === result.id);
        return exists ? current.map((item) => item.id === result.id ? result : item) : [result, ...current];
      });
      setDirty(false);
      setEditing(null);
      notify(creating ? "Labor item added." : "Labor item updated.");
      await load();
      onChanged?.();
    } catch (caught) {
      setFormError(caught.message);
      notify("Labor request failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const approved = await confirmAction({
      title: "Delete this labor item?",
      message: `${item.technician}'s labor entry will be removed from RO-${orderId}.`,
      details: "This changes the invoice total and cannot be undone.",
      confirmLabel: "Delete labor",
      tone: "danger",
    });
    if (!approved) return;
    try {
      await api.labor.remove(item.id);
      setItems((current) => current.filter((record) => record.id !== item.id));
      syncGlobalLabor((current) => current.filter((record) => record.id !== item.id));
      notify("Labor item deleted.");
      onChanged?.();
    } catch (caught) {
      notify(caught.message, "error");
    }
  };

  if (loading) return <LoadingState label="Loading labor…" />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <>
      <div className="subsection-toolbar">
        <div><p className="eyebrow">Technician labor</p><h3>{items.length} line item{items.length === 1 ? "" : "s"}</h3></div>
        <button className="button button-primary" type="button" onClick={openCreate}><Icon name="plus" size={16} />Add labor</button>
      </div>
      {!items.length ? (
        <EmptyState icon="labor" title="No labor added" message="Add technician time and rate to calculate labor charges for the invoice." actionLabel="Add first labor item" onAction={openCreate} />
      ) : (
        <div className="line-items">
          <div className="line-head labor-columns"><span>Technician</span><span>Hours</span><span>Rate</span><span>Total</span><span>Actions</span></div>
          {items.map((item) => (
            <div className="line-row labor-columns" key={item.id}>
              <span><strong>{item.technician}</strong><small>Labor item #{item.id}</small></span>
              <span>{Number(item.hours || 0).toFixed(2)}</span>
              <span>{money(item.laborRate)}</span>
              <span><strong>{money(laborLineTotal(item))}</strong></span>
              <span className="row-actions"><button type="button" onClick={() => openEdit(item)} aria-label={`Edit labor for ${item.technician}`}><Icon name="edit" size={15} /></button><button type="button" onClick={() => remove(item)} aria-label={`Delete labor for ${item.technician}`}><Icon name="trash" size={15} /></button></span>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === "create" ? "Add labor item" : "Update labor item"} eyebrow={`Repair order RO-${orderId}`} onClose={close}>
          <SafeForm className="form-stack">
            <p className="form-note">Enter will not send this labor request.</p>
            <label>Technician<input autoFocus value={form.technician} onChange={(event) => change("technician", event.target.value)} /></label>
            <div className="form-grid">
              <label>Hours<input type="number" min="0" step="0.25" value={form.hours} onChange={(event) => change("hours", event.target.value)} /></label>
              <label>Labor rate<input type="number" min="0" step="0.01" value={form.laborRate} onChange={(event) => change("laborRate", event.target.value)} /></label>
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-actions"><button className="button button-secondary" type="button" onClick={close}>Cancel</button><button className="button button-primary" type="button" disabled={saving} onClick={save}>{saving ? "Working…" : "Review and save"}</button></div>
          </SafeForm>
        </Modal>
      )}
    </>
  );
}
