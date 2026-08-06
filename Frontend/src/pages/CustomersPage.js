import React, { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import SafeForm from "../components/SafeForm";
import StatusBadge from "../components/StatusBadge";
import { EmptyState } from "../components/StateViews";
import { useAppData } from "../state/AppContext";
import { useUI } from "../state/UIContext";
import { customerName, dateTime, normalizeText, vehicleName } from "../utils/formatters";

const blankCustomer = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zip: "",
};

export default function CustomersPage({ onDirtyChange, onNavigate }) {
  const {
    customers,
    addresses,
    cars,
    orders,
    activeCustomer,
    selectCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useAppData();
  const { confirmAction, notify } = useUI();
  const [search, setSearch] = useState("");
  const [editorMode, setEditorMode] = useState(null);
  const [form, setForm] = useState(blankCustomer);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const filtered = useMemo(() => {
    const term = normalizeText(search);
    if (!term) return customers;
    return customers.filter((customer) => {
      const address = addresses.find((item) => item.customerId === customer.id);
      return normalizeText(
        `${customerName(customer)} ${customer.phoneNumber} ${customer.email} ${customer.id} ${address?.street} ${address?.city} ${address?.state} ${address?.zip}`,
      ).includes(term);
    });
  }, [customers, addresses, search]);

  const customerCars = cars.filter((car) => car.customerId === activeCustomer?.id);
  const customerOrders = orders.filter((order) => order.customerId === activeCustomer?.id);
  const activeAddress = addresses.find((address) => address.customerId === activeCustomer?.id) || null;

  const changeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setFormError("");
  };

  const openCreate = () => {
    setForm(blankCustomer);
    setDirty(false);
    setFormError("");
    setEditorMode("create");
  };

  const openEdit = () => {
    if (!activeCustomer) return;
    setForm({
      firstName: activeCustomer.firstName || "",
      lastName: activeCustomer.lastName || "",
      phoneNumber: activeCustomer.phoneNumber || "",
      email: activeCustomer.email || "",
      street: activeAddress?.street || "",
      city: activeAddress?.city || "",
      state: activeAddress?.state || "",
      zip: activeAddress?.zip || "",
    });
    setDirty(false);
    setFormError("");
    setEditorMode("edit");
  };

  const closeEditor = async () => {
    if (dirty) {
      const discard = await confirmAction({
        title: "Discard customer form?",
        message: "You changed customer information but have not saved it.",
        confirmLabel: "Discard changes",
        tone: "danger",
      });
      if (!discard) return;
    }
    setDirty(false);
    setEditorMode(null);
  };

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("First and last name are required.");
      return;
    }
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) {
      setFormError("Street, city, state, and ZIP code are required.");
      return;
    }
    if (form.state.trim().length !== 2) {
      setFormError("State must use a two-letter abbreviation, such as GA.");
      return;
    }
    const isCreate = editorMode === "create";
    const approved = await confirmAction({
      title: isCreate ? "Create this customer?" : "Update this customer?",
      message: isCreate
        ? `Create a customer profile for ${form.firstName.trim()} ${form.lastName.trim()}?`
        : `Save these changes to ${customerName(activeCustomer)}?`,
      details: "This request is sent only after you choose the confirmation button.",
      confirmLabel: isCreate ? "Create customer" : "Save customer",
    });
    if (!approved) return;

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        zip: form.zip.trim(),
      };
      if (isCreate) await createCustomer(payload);
      else await updateCustomer(activeCustomer.id, payload);
      setDirty(false);
      setEditorMode(null);
    } catch (error) {
      setFormError(error.message);
      notify("Customer request failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!activeCustomer) return;
    const approved = await confirmAction({
      title: "Delete this customer?",
      message: `${customerName(activeCustomer)} will be permanently deleted.`,
      details: "Related vehicle or repair-order constraints may cause the backend to reject this request.",
      confirmLabel: "Delete customer",
      tone: "danger",
    });
    if (!approved) return;
    try {
      await deleteCustomer(activeCustomer.id);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  return (
    <>
      <div className="master-detail">
        <section className="panel master-panel">
          <div className="panel-heading panel-heading-action">
            <div><p className="eyebrow">Profiles</p><h2>Customer directory</h2></div>
            <button className="button button-primary" type="button" onClick={openCreate}>
              <Icon name="plus" size={16} />New customer
            </button>
          </div>
          <label className="search-box">
            <Icon name="search" size={17} />
            <span className="sr-only">Search customers</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, contact, address, or ID" />
          </label>
          <div className="record-list">
            {filtered.length === 0 ? (
              <EmptyState icon="customers" title="No customers found" message={customers.length ? "Try a different search." : "Create the first customer profile."} />
            ) : filtered.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className={`record-card ${activeCustomer?.id === customer.id ? "selected" : ""}`}
                onClick={() => selectCustomer(customer.id)}
              >
                <span className="avatar">{customer.firstName?.[0]}{customer.lastName?.[0]}</span>
                <span><strong>{customerName(customer)}</strong><small>{customer.phoneNumber || "No phone"} · {customer.email || "No email"}</small></span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel detail-panel">
          {!activeCustomer ? (
            <EmptyState icon="customers" title="Select a customer" message="Choose a customer to see contact details, vehicles, and repair history." actionLabel="Create customer" onAction={openCreate} />
          ) : (
            <>
              <div className="detail-hero">
                <span className="large-avatar">{activeCustomer.firstName?.[0]}{activeCustomer.lastName?.[0]}</span>
                <div>
                  <p className="eyebrow">Customer #{activeCustomer.id}</p>
                  <h2>{customerName(activeCustomer)}</h2>
                  <p>{activeCustomer.phoneNumber || "No phone number"} · {activeCustomer.email || "No email address"}</p>
                  <p>
                    {activeAddress
                      ? `${activeAddress.street}, ${activeAddress.city}, ${activeAddress.state} ${activeAddress.zip}`
                      : "No address recorded"}
                  </p>
                </div>
                <div className="detail-actions">
                  <button className="button button-secondary" type="button" onClick={openEdit}><Icon name="edit" size={15} />Edit</button>
                  <button className="button button-danger-ghost" type="button" onClick={remove}><Icon name="trash" size={15} />Delete</button>
                </div>
              </div>

              <div className="summary-grid">
                <div><small>Vehicles</small><strong>{customerCars.length}</strong></div>
                <div><small>Repair orders</small><strong>{customerOrders.length}</strong></div>
                <div><small>Active jobs</small><strong>{customerOrders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)).length}</strong></div>
              </div>

              <section className="detail-section">
                <div className="section-heading"><h3>Vehicles</h3><button className="text-button" type="button" onClick={() => onNavigate("vehicles")}>Manage vehicles <Icon name="chevron" size={14} /></button></div>
                {customerCars.length ? (
                  <div className="compact-list">
                    {customerCars.map((car) => <div key={car.id}><Icon name="car" /><span><strong>{vehicleName(car)}</strong><small>{car.licensePlate || "No plate"} · {car.mileage ? `${car.mileage.toLocaleString()} miles` : "No mileage"}</small></span></div>)}
                  </div>
                ) : <p className="inline-empty">No vehicles belong to this customer yet.</p>}
              </section>

              <section className="detail-section">
                <div className="section-heading"><h3>Recent repair orders</h3><button className="text-button" type="button" onClick={() => onNavigate("orders")}>Open workspace <Icon name="chevron" size={14} /></button></div>
                {customerOrders.length ? (
                  <div className="compact-list">
                    {customerOrders.slice(0, 5).map((order) => <div key={order.id}><Icon name="orders" /><span><strong>RO-{order.id}</strong><small>{dateTime(order.updatedAt || order.createdAt)}</small></span><StatusBadge status={order.status} /></div>)}
                  </div>
                ) : <p className="inline-empty">No repair orders belong to this customer.</p>}
              </section>
            </>
          )}
        </section>
      </div>

      {editorMode && (
        <Modal
          title={editorMode === "create" ? "Create customer" : "Update customer"}
          eyebrow={editorMode === "create" ? "New profile" : `Customer #${activeCustomer?.id}`}
          onClose={closeEditor}
        >
          <SafeForm className="form-stack">
            <p className="form-note">Pressing Enter will not send this form. Review the information and use the button below.</p>
            <div className="form-grid">
              <label>First name<input autoFocus value={form.firstName} onChange={(event) => changeField("firstName", event.target.value)} /></label>
              <label>Last name<input value={form.lastName} onChange={(event) => changeField("lastName", event.target.value)} /></label>
            </div>
            <label>Phone number<input type="tel" value={form.phoneNumber} onChange={(event) => changeField("phoneNumber", event.target.value)} /></label>
            <label>Email address<input type="email" value={form.email} onChange={(event) => changeField("email", event.target.value)} /></label>
            <label>Street address<input value={form.street} onChange={(event) => changeField("street", event.target.value)} autoComplete="street-address" /></label>
            <div className="form-grid">
              <label>City<input value={form.city} onChange={(event) => changeField("city", event.target.value)} autoComplete="address-level2" /></label>
              <label>State<input value={form.state} maxLength={2} onChange={(event) => changeField("state", event.target.value.toUpperCase())} autoComplete="address-level1" placeholder="GA" /></label>
            </div>
            <label>ZIP code<input value={form.zip} onChange={(event) => changeField("zip", event.target.value)} inputMode="numeric" autoComplete="postal-code" placeholder="30000" /></label>
            {editorMode === "create" && <p className="field-help">The customer is created first so the returned customer ID can be attached to the address.</p>}
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-actions">
              <button className="button button-secondary" type="button" onClick={closeEditor}>Cancel</button>
              <button className="button button-primary" type="button" disabled={saving} onClick={save}>{saving ? "Working…" : editorMode === "create" ? "Review and create" : "Review and save"}</button>
            </div>
          </SafeForm>
        </Modal>
      )}
    </>
  );
}
