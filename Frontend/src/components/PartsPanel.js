import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useUI } from "../state/UIContext";
import { money, PART_CONDITIONS, partLineTotal } from "../utils/formatters";
import Icon from "./Icon";
import Modal from "./Modal";
import SafeForm from "./SafeForm";
import { EmptyState, ErrorState, LoadingState } from "./StateViews";

const blankPart = {
  partName: "",
  partNumber: "",
  partCondition: "NEW",
  quantity: 1,
  unitPrice: "",
};

export default function PartsPanel({ orderId, onDirtyChange, onChanged }) {
  const { confirmAction, notify } = useUI();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankPart);
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
      setParts((await api.orders.parts(orderId)) || []);
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
    setForm(blankPart);
    setDirty(false);
    setFormError("");
  };

  const openEdit = (part) => {
    setEditing(part);
    setForm({
      partName: part.partName || "",
      partNumber: part.partNumber || "",
      partCondition: part.partCondition || "NEW",
      quantity: part.quantity || 1,
      unitPrice: part.unitPrice ?? "",
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
        title: "Discard part changes?",
        message: "The part form contains unsaved changes.",
        confirmLabel: "Discard changes",
        tone: "danger",
      });
      if (!approved) return;
    }
    setDirty(false);
    setEditing(null);
  };

  const save = async () => {
    if (!form.partName.trim() || !form.partNumber.trim() || Number(form.quantity) < 1 || Number(form.unitPrice) < 0) {
      setFormError("Part name, number, positive quantity, and non-negative price are required.");
      return;
    }
    const creating = editing === "create";
    const approved = await confirmAction({
      title: creating ? "Add this part?" : "Update this part?",
      message: `${creating ? "Add" : "Save changes to"} ${form.partName.trim()} on RO-${orderId}?`,
      details: `${form.quantity} × ${money(form.unitPrice)} · ${form.partCondition}`,
      confirmLabel: creating ? "Add part" : "Save part",
    });
    if (!approved) return;

    setSaving(true);
    try {
      const payload = {
        partName: form.partName.trim(),
        partNumber: form.partNumber.trim(),
        partCondition: form.partCondition,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        ...(creating ? { repairOrderId: Number(orderId) } : {}),
      };
      if (creating) await api.parts.create(payload);
      else await api.parts.update(editing.id, payload);
      setDirty(false);
      setEditing(null);
      notify(creating ? "Part added." : "Part updated.");
      await load();
      onChanged?.();
    } catch (caught) {
      setFormError(caught.message);
      notify("Part request failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (part) => {
    const approved = await confirmAction({
      title: "Delete this part?",
      message: `${part.partName} will be removed from RO-${orderId}.`,
      details: "This changes the invoice total and cannot be undone.",
      confirmLabel: "Delete part",
      tone: "danger",
    });
    if (!approved) return;
    try {
      await api.parts.remove(part.id);
      setParts((current) => current.filter((item) => item.id !== part.id));
      notify("Part deleted.");
      onChanged?.();
    } catch (caught) {
      notify(caught.message, "error");
    }
  };

  if (loading) return <LoadingState label="Loading parts…" />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <>
      <div className="subsection-toolbar">
        <div><p className="eyebrow">Parts and materials</p><h3>{parts.length} line item{parts.length === 1 ? "" : "s"}</h3></div>
        <button className="button button-primary" type="button" onClick={openCreate}><Icon name="plus" size={16} />Add part</button>
      </div>
      {!parts.length ? (
        <EmptyState icon="parts" title="No parts added" message="Add parts to calculate the parts subtotal and include them on the invoice." actionLabel="Add first part" onAction={openCreate} />
      ) : (
        <div className="line-items">
          <div className="line-head parts-columns"><span>Part</span><span>Condition</span><span>Qty.</span><span>Unit price</span><span>Total</span><span>Actions</span></div>
          {parts.map((part) => (
            <div className="line-row parts-columns" key={part.id}>
              <span><strong>{part.partName}</strong><small>{part.partNumber}</small></span>
              <span>{part.partCondition}</span>
              <span>{part.quantity}</span>
              <span>{money(part.unitPrice)}</span>
              <span><strong>{money(partLineTotal(part))}</strong></span>
              <span className="row-actions"><button type="button" onClick={() => openEdit(part)} aria-label={`Edit ${part.partName}`}><Icon name="edit" size={15} /></button><button type="button" onClick={() => remove(part)} aria-label={`Delete ${part.partName}`}><Icon name="trash" size={15} /></button></span>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === "create" ? "Add repair part" : "Update repair part"} eyebrow={`Repair order RO-${orderId}`} onClose={close}>
          <SafeForm className="form-stack">
            <p className="form-note">Enter will not send this part request.</p>
            <div className="form-grid">
              <label>Part name<input autoFocus value={form.partName} onChange={(event) => change("partName", event.target.value)} /></label>
              <label>Part number<input value={form.partNumber} onChange={(event) => change("partNumber", event.target.value)} /></label>
            </div>
            <div className="form-grid form-grid-three">
              <label>Condition<select value={form.partCondition} onChange={(event) => change("partCondition", event.target.value)}>{PART_CONDITIONS.map((condition) => <option key={condition}>{condition}</option>)}</select></label>
              <label>Quantity<input type="number" min="1" value={form.quantity} onChange={(event) => change("quantity", event.target.value)} /></label>
              <label>Unit price<input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(event) => change("unitPrice", event.target.value)} /></label>
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-actions"><button className="button button-secondary" type="button" onClick={close}>Cancel</button><button className="button button-primary" type="button" disabled={saving} onClick={save}>{saving ? "Working…" : "Review and save"}</button></div>
          </SafeForm>
        </Modal>
      )}
    </>
  );
}
