import React, { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import InvoicePanel from "../components/InvoicePanel";
import LaborPanel from "../components/LaborPanel";
import Modal from "../components/Modal";
import PartsPanel from "../components/PartsPanel";
import SafeForm from "../components/SafeForm";
import StatusBadge from "../components/StatusBadge";
import { EmptyState } from "../components/StateViews";
import { useAppData } from "../state/AppContext";
import { useUI } from "../state/UIContext";
import {
  customerName,
  dateTime,
  normalizeText,
  STATUS_ACTIONS,
  STATUS_LABELS,
  vehicleName,
} from "../utils/formatters";

const blankOrder = {
  customerId: "",
  carId: "",
  mileageIn: "",
  mileageOut: "",
  customerComplaint: "",
  diagnosis: "",
  recommendations: "",
  mechanicNotes: "",
};

export default function RepairOrdersPage({ onDirtyChange, onNavigate }) {
  const {
    customers,
    cars,
    orders,
    activeCustomerId,
    activeCarId,
    activeOrder,
    selectOrder,
    createOrder,
    updateOrder,
    changeOrderStatus,
    deleteOrder,
  } = useAppData();
  const { confirmAction, notify } = useUI();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tab, setTab] = useState("summary");
  const [editorMode, setEditorMode] = useState(null);
  const [form, setForm] = useState(blankOrder);
  const [dirty, setDirty] = useState(false);
  const [childDirty, setChildDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [invoiceVersion, setInvoiceVersion] = useState(0);

  useEffect(() => {
    onDirtyChange(dirty || childDirty);
    return () => onDirtyChange(false);
  }, [dirty, childDirty, onDirtyChange]);

  useEffect(() => {
    setTab("summary");
  }, [activeOrder?.id]);

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );
  const carMap = useMemo(
    () => new Map(cars.map((car) => [car.id, car])),
    [cars],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(search);
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      if (!term) return true;
      return normalizeText(
        `ro-${order.id} ${customerName(customerMap.get(order.customerId))} ${vehicleName(carMap.get(order.carId))} ${order.customerComplaint} ${order.diagnosis} ${order.recommendations} ${order.mechanicNotes}`,
      ).includes(term);
    });
  }, [orders, search, statusFilter, customerMap, carMap]);

  const eligibleCars = cars.filter((car) => car.customerId === Number(form.customerId));

  useEffect(() => {
    if (!editorMode) return;
    if (!eligibleCars.some((car) => car.id === Number(form.carId))) {
      setForm((current) => ({ ...current, carId: eligibleCars[0]?.id || "" }));
    }
  }, [editorMode, form.customerId, form.carId, eligibleCars]);

  const openCreate = () => {
    const customerId = activeCustomerId || customers[0]?.id || "";
    const firstCar = cars.find((car) => car.customerId === customerId);
    setForm({
      customerId,
      carId: activeCarId || firstCar?.id || "",
      mileageIn: "",
      mileageOut: "",
      customerComplaint: "",
      diagnosis: "",
      recommendations: "",
      mechanicNotes: "",
    });
    setDirty(false);
    setFormError("");
    setEditorMode("create");
  };

  const openDetails = () => {
    if (!activeOrder) return;
    setForm({
      customerId: activeOrder.customerId,
      carId: activeOrder.carId,
      mileageIn: activeOrder.mileageIn ?? "",
      mileageOut: activeOrder.mileageOut ?? "",
      customerComplaint: activeOrder.customerComplaint || "",
      diagnosis: activeOrder.diagnosis || "",
      recommendations: activeOrder.recommendations || "",
      mechanicNotes: activeOrder.mechanicNotes || "",
    });
    setDirty(false);
    setFormError("");
    setEditorMode("details");
  };

  const changeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setFormError("");
  };

  const closeEditor = async () => {
    if (dirty) {
      const approved = await confirmAction({
        title: "Discard repair-order changes?",
        message: "The repair-order form contains changes that have not been saved.",
        confirmLabel: "Discard changes",
        tone: "danger",
      });
      if (!approved) return;
    }
    setDirty(false);
    setEditorMode(null);
  };

  const saveOrder = async () => {
    const creating = editorMode === "create";
    if (creating && (!form.customerId || !form.carId)) {
      setFormError("A customer and one of that customer's vehicles are required.");
      return;
    }
    const mileageIn = form.mileageIn === "" ? null : Number(form.mileageIn);
    const mileageOut = form.mileageOut === "" ? null : Number(form.mileageOut);
    if (mileageIn !== null && (!Number.isInteger(mileageIn) || mileageIn < 0)) {
      setFormError("Mileage in must be a whole number of zero or greater.");
      return;
    }
    if (mileageOut !== null && (!Number.isInteger(mileageOut) || mileageOut < 0)) {
      setFormError("Mileage out must be a whole number of zero or greater.");
      return;
    }
    if (mileageIn !== null && mileageOut !== null && mileageOut < mileageIn) {
      setFormError("Mileage out cannot be lower than mileage in.");
      return;
    }
    const approved = await confirmAction({
      title: creating ? "Create this repair order?" : "Update repair-order details?",
      message: creating
        ? `Create a repair order for ${customerName(customerMap.get(Number(form.customerId)))} and ${vehicleName(carMap.get(Number(form.carId)))}?`
        : `Save the work details on RO-${activeOrder.id}?`,
      details: "This API request is sent only after confirmation.",
      confirmLabel: creating ? "Create repair order" : "Save details",
    });
    if (!approved) return;

    setSaving(true);
    try {
      if (creating) {
        await createOrder({
          customerId: Number(form.customerId),
          carId: Number(form.carId),
          mileageIn,
          customerComplaint: form.customerComplaint.trim(),
          mechanicNotes: form.mechanicNotes.trim(),
        });
      } else {
        await updateOrder(activeOrder.id, {
          mileageIn,
          mileageOut,
          customerComplaint: form.customerComplaint.trim(),
          diagnosis: form.diagnosis.trim(),
          recommendations: form.recommendations.trim(),
          mechanicNotes: form.mechanicNotes.trim(),
        });
      }
      setDirty(false);
      setEditorMode(null);
    } catch (error) {
      setFormError(error.message);
      notify("Repair-order request failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (item) => {
    if (!activeOrder || activeOrder.status === item.status) return;
    const approved = await confirmAction({
      title: "Change repair-order status?",
      message: `Change RO-${activeOrder.id} from ${STATUS_LABELS[activeOrder.status]} to ${STATUS_LABELS[item.status]}?`,
      confirmLabel: `Change to ${STATUS_LABELS[item.status]}`,
      tone: item.status === "CANCELLED" ? "danger" : "primary",
    });
    if (!approved) return;
    try {
      await changeOrderStatus(activeOrder.id, item.action);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const remove = async () => {
    if (!activeOrder) return;
    const approved = await confirmAction({
      title: "Delete this repair order?",
      message: `RO-${activeOrder.id} will be permanently deleted.`,
      details: "Parts, labor, and invoice relationships may prevent deletion or be affected by it.",
      confirmLabel: "Delete repair order",
      tone: "danger",
    });
    if (!approved) return;
    try {
      await deleteOrder(activeOrder.id);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const tabs = [
    ["summary", "Summary", "orders"],
    ["parts", "Parts", "parts"],
    ["labor", "Labor", "labor"],
    ["invoice", "Invoice", "invoice"],
  ];

  return (
    <>
      <div className="orders-layout">
        <section className="panel orders-list-panel">
          <div className="panel-heading panel-heading-action">
            <div><p className="eyebrow">Work queue</p><h2>Repair orders</h2></div>
            <button className="button button-primary" type="button" onClick={openCreate} disabled={!customers.length || !cars.length}><Icon name="plus" size={16} />New order</button>
          </div>
          <div className="filter-stack">
            <label className="search-box"><Icon name="search" size={17} /><span className="sr-only">Search repair orders</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, vehicle, or work details" /></label>
            <label className="select-filter"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <div className="order-record-list">
            {filtered.length === 0 ? (
              <EmptyState icon="orders" title="No repair orders found" message={orders.length ? "Change the search or status filter." : "Create the first repair order."} />
            ) : filtered.map((order) => (
              <button key={order.id} type="button" className={`order-record ${activeOrder?.id === order.id ? "selected" : ""}`} onClick={() => selectOrder(order.id)}>
                <span><small>Repair order</small><strong>RO-{order.id}</strong></span>
                <span><strong>{customerName(customerMap.get(order.customerId))}</strong><small>{vehicleName(carMap.get(order.carId))}</small></span>
                <StatusBadge status={order.status} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel order-workspace">
          {!activeOrder ? (
            <EmptyState icon="orders" title="Select a repair order" message="Choose an order to manage notes, workflow, parts, labor, and invoice from one workspace." actionLabel="Create repair order" onAction={openCreate} />
          ) : (
            <>
              <div className="order-hero">
                <div><p className="eyebrow">Repair order RO-{activeOrder.id}</p><h2>{vehicleName(carMap.get(activeOrder.carId))}</h2><p>{customerName(customerMap.get(activeOrder.customerId))} · Updated {dateTime(activeOrder.updatedAt || activeOrder.createdAt)}</p></div>
                <div><StatusBadge status={activeOrder.status} /><button className="button button-danger-ghost" type="button" onClick={remove}><Icon name="trash" size={15} />Delete</button></div>
              </div>

              <nav className="workspace-tabs" aria-label="Repair-order workspace">
                {tabs.map(([id, label, icon]) => <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon name={icon} size={16} />{label}</button>)}
              </nav>

              <div className="workspace-tab-content">
                {tab === "summary" && (
                  <div className="summary-tab">
                    <div className="order-facts">
                      <div><small>Customer</small><strong>{customerName(customerMap.get(activeOrder.customerId))}</strong><span>#{activeOrder.customerId}</span></div>
                      <div><small>Vehicle</small><strong>{vehicleName(carMap.get(activeOrder.carId))}</strong><span>#{activeOrder.carId}</span></div>
                      <div><small>Created</small><strong>{dateTime(activeOrder.createdAt)}</strong><span>{activeOrder.completedAt ? `Completed ${dateTime(activeOrder.completedAt)}` : "Not completed"}</span></div>
                      <div><small>Mileage in</small><strong>{activeOrder.mileageIn != null ? activeOrder.mileageIn.toLocaleString() : "Not recorded"}</strong><span>miles</span></div>
                      <div><small>Mileage out</small><strong>{activeOrder.mileageOut != null ? activeOrder.mileageOut.toLocaleString() : "Not recorded"}</strong><span>miles</span></div>
                    </div>

                    <section className="notes-section">
                      <div className="section-heading"><h3>Customer complaint</h3><button className="button button-secondary button-small" type="button" onClick={openDetails}><Icon name="edit" size={14} />Edit work details</button></div>
                      <p>{activeOrder.customerComplaint || "No customer complaint has been recorded."}</p>
                    </section>

                    <section className="notes-section">
                      <div className="section-heading"><h3>Diagnosis</h3></div>
                      <p>{activeOrder.diagnosis || "No diagnosis has been recorded."}</p>
                    </section>

                    <section className="notes-section">
                      <div className="section-heading"><h3>Mechanic notes</h3></div>
                      <p>{activeOrder.mechanicNotes || "No mechanic notes have been recorded."}</p>
                    </section>

                    <section className="notes-section">
                      <div className="section-heading"><h3>Recommendations</h3></div>
                      <p>{activeOrder.recommendations || "No recommendations have been recorded."}</p>
                    </section>

                    <section>
                      <div className="section-heading"><h3>Workflow status</h3><small>Every status change requires confirmation.</small></div>
                      <div className="status-workflow">
                        {STATUS_ACTIONS.map((item) => (
                          <button
                            key={item.action}
                            type="button"
                            className={`${activeOrder.status === item.status ? "current" : ""} ${item.status === "CANCELLED" ? "danger-status" : ""}`}
                            disabled={activeOrder.status === item.status}
                            onClick={() => changeStatus(item)}
                          >
                            <span>{activeOrder.status === item.status ? <Icon name="check" size={16} /> : null}</span>
                            <strong>{STATUS_LABELS[item.status]}</strong>
                            <small>{item.label}</small>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
                {tab === "parts" && <PartsPanel orderId={activeOrder.id} onDirtyChange={setChildDirty} onChanged={() => setInvoiceVersion((value) => value + 1)} />}
                {tab === "labor" && <LaborPanel orderId={activeOrder.id} onDirtyChange={setChildDirty} onChanged={() => setInvoiceVersion((value) => value + 1)} />}
                {tab === "invoice" && <InvoicePanel key={`${activeOrder.id}-${invoiceVersion}`} orderId={activeOrder.id} />}
              </div>
            </>
          )}
        </section>
      </div>

      {editorMode && (
        <Modal title={editorMode === "create" ? "Create repair order" : "Update work details"} eyebrow={editorMode === "create" ? "New work order" : `Repair order RO-${activeOrder?.id}`} onClose={closeEditor} width="large">
          <SafeForm className="form-stack">
            <p className="form-note">Pressing Enter cannot send this request. Use the review button after checking all information.</p>
            {editorMode === "create" && (
              <div className="form-grid">
                <label>Customer<select value={form.customerId} onChange={(event) => changeField("customerId", event.target.value)}><option value="">Choose customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}</option>)}</select></label>
                <label>Vehicle<select value={form.carId} onChange={(event) => changeField("carId", event.target.value)}><option value="">{form.customerId ? "Choose vehicle" : "Select customer first"}</option>{eligibleCars.map((car) => <option key={car.id} value={car.id}>{vehicleName(car)}</option>)}</select></label>
              </div>
            )}
            <div className="form-grid">
              <label>Mileage in<input type="number" min="0" step="1" value={form.mileageIn} onChange={(event) => changeField("mileageIn", event.target.value)} placeholder="Current mileage" /></label>
              {editorMode !== "create" && <label>Mileage out<input type="number" min="0" step="1" value={form.mileageOut} onChange={(event) => changeField("mileageOut", event.target.value)} placeholder="Completion mileage" /></label>}
            </div>
            <label>Customer complaint<textarea rows="4" value={form.customerComplaint} onChange={(event) => changeField("customerComplaint", event.target.value)} placeholder="Describe the customer's concern in their own words…" /></label>
            {editorMode !== "create" && <label>Diagnosis<textarea rows="4" value={form.diagnosis} onChange={(event) => changeField("diagnosis", event.target.value)} placeholder="Record the technician's diagnosis…" /></label>}
            <label>Mechanic notes<textarea rows="5" value={form.mechanicNotes} onChange={(event) => changeField("mechanicNotes", event.target.value)} placeholder="Work performed, observations, parts needed, or next steps…" /></label>
            {editorMode !== "create" && <label>Recommendations<textarea rows="4" value={form.recommendations} onChange={(event) => changeField("recommendations", event.target.value)} placeholder="Recommended maintenance or future repairs…" /></label>}
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-actions"><button className="button button-secondary" type="button" onClick={closeEditor}>Cancel</button><button className="button button-primary" type="button" disabled={saving} onClick={saveOrder}>{saving ? "Working…" : editorMode === "create" ? "Review and create" : "Review and save"}</button></div>
          </SafeForm>
        </Modal>
      )}
    </>
  );
}
