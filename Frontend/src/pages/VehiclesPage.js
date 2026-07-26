import React, { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import SafeForm from "../components/SafeForm";
import StatusBadge from "../components/StatusBadge";
import { EmptyState } from "../components/StateViews";
import { useAppData } from "../state/AppContext";
import { useUI } from "../state/UIContext";
import { customerName, dateTime, normalizeText, vehicleName } from "../utils/formatters";

const blankCar = {
  customerId: "",
  year: new Date().getFullYear(),
  make: "",
  model: "",
  trim: "",
  vin: "",
  licensePlate: "",
  mileage: "",
  color: "",
};

export default function VehiclesPage({ onDirtyChange, onNavigate }) {
  const {
    customers,
    cars,
    orders,
    activeCustomerId,
    activeCar,
    selectCar,
    selectOrder,
    createCar,
    updateCar,
    deleteCar,
  } = useAppData();
  const { confirmAction, notify } = useUI();
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState(activeCustomerId || "ALL");
  const [editorMode, setEditorMode] = useState(null);
  const [form, setForm] = useState(blankCar);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (activeCustomerId) setOwnerFilter(activeCustomerId);
  }, [activeCustomerId]);

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(search);
    return cars.filter((car) => {
      if (ownerFilter !== "ALL" && car.customerId !== Number(ownerFilter)) return false;
      if (!term) return true;
      return normalizeText(
        `${vehicleName(car)} ${car.trim} ${car.vin} ${car.licensePlate} ${car.color} ${customerName(customerMap.get(car.customerId))} ${car.id}`,
      ).includes(term);
    });
  }, [cars, customerMap, ownerFilter, search]);

  const vehicleOrders = orders.filter((order) => order.carId === activeCar?.id);

  const changeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setFormError("");
  };

  const openCreate = () => {
    setForm({
      ...blankCar,
      customerId: activeCustomerId || customers[0]?.id || "",
    });
    setDirty(false);
    setFormError("");
    setEditorMode("create");
  };

  const openEdit = () => {
    if (!activeCar) return;
    setForm({
      customerId: activeCar.customerId,
      year: activeCar.year || "",
      make: activeCar.make || "",
      model: activeCar.model || "",
      trim: activeCar.trim || "",
      vin: activeCar.vin || "",
      licensePlate: activeCar.licensePlate || "",
      mileage: activeCar.mileage ?? "",
      color: activeCar.color || "",
    });
    setDirty(false);
    setFormError("");
    setEditorMode("edit");
  };

  const closeEditor = async () => {
    if (dirty) {
      const discard = await confirmAction({
        title: "Discard vehicle form?",
        message: "The vehicle form contains changes that have not been saved.",
        confirmLabel: "Discard changes",
        tone: "danger",
      });
      if (!discard) return;
    }
    setDirty(false);
    setEditorMode(null);
  };

  const save = async () => {
    if (!form.customerId || !form.year || !form.make.trim() || !form.model.trim()) {
      setFormError("Customer, year, make, and model are required.");
      return;
    }
    if (Number(form.year) < 1886) {
      setFormError("Vehicle year must be 1886 or newer.");
      return;
    }

    const isCreate = editorMode === "create";
    const owner = customerMap.get(Number(form.customerId));
    const approved = await confirmAction({
      title: isCreate ? "Add this vehicle?" : "Update this vehicle?",
      message: `${isCreate ? "Add" : "Save changes to"} ${form.year} ${form.make.trim()} ${form.model.trim()} for ${customerName(owner)}?`,
      details: "The request will not be sent until you confirm.",
      confirmLabel: isCreate ? "Add vehicle" : "Save vehicle",
    });
    if (!approved) return;

    const payload = {
      year: Number(form.year),
      make: form.make.trim(),
      model: form.model.trim(),
      trim: form.trim.trim(),
      vin: form.vin.trim(),
      licensePlate: form.licensePlate.trim(),
      mileage: form.mileage === "" ? null : Number(form.mileage),
      color: form.color.trim(),
      ...(isCreate ? { customerId: Number(form.customerId) } : {}),
    };

    setSaving(true);
    setFormError("");
    try {
      if (isCreate) await createCar(payload);
      else await updateCar(activeCar.id, payload);
      setDirty(false);
      setEditorMode(null);
    } catch (error) {
      setFormError(error.message);
      notify("Vehicle request failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!activeCar) return;
    const approved = await confirmAction({
      title: "Delete this vehicle?",
      message: `${vehicleName(activeCar)} will be permanently deleted.`,
      details: "The backend may reject deletion if repair orders still reference this vehicle.",
      confirmLabel: "Delete vehicle",
      tone: "danger",
    });
    if (!approved) return;
    try {
      await deleteCar(activeCar.id);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  return (
    <>
      <div className="master-detail">
        <section className="panel master-panel">
          <div className="panel-heading panel-heading-action">
            <div><p className="eyebrow">Garage</p><h2>Vehicle directory</h2></div>
            <button className="button button-primary" type="button" onClick={openCreate} disabled={!customers.length}>
              <Icon name="plus" size={16} />Add vehicle
            </button>
          </div>
          <div className="filter-stack">
            <label className="search-box">
              <Icon name="search" size={17} />
              <span className="sr-only">Search vehicles</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicle, owner, VIN, or plate" />
            </label>
            <label className="select-filter">
              <span>Owner</span>
              <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
                <option value="ALL">All customers</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}</option>)}
              </select>
            </label>
          </div>
          <div className="record-list">
            {filtered.length === 0 ? (
              <EmptyState icon="car" title="No vehicles found" message={cars.length ? "Change the search or owner filter." : "Add the first customer vehicle."} />
            ) : filtered.map((car) => (
              <button
                key={car.id}
                type="button"
                className={`record-card ${activeCar?.id === car.id ? "selected" : ""}`}
                onClick={() => selectCar(car.id)}
              >
                <span className="record-icon"><Icon name="car" /></span>
                <span><strong>{vehicleName(car)}</strong><small>{customerName(customerMap.get(car.customerId))} · {car.licensePlate || "No plate"}</small></span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel detail-panel">
          {!activeCar ? (
            <EmptyState
              icon="car"
              title={customers.length ? "Select a vehicle" : "Create a customer first"}
              message={customers.length ? "Choose a vehicle to view ownership, specifications, and repair history." : "Every vehicle must belong to a customer."}
              actionLabel={customers.length ? "Add vehicle" : "Go to customers"}
              onAction={customers.length ? openCreate : () => onNavigate("customers")}
            />
          ) : (
            <>
              <div className="detail-hero">
                <span className="large-record-icon"><Icon name="car" size={27} /></span>
                <div><p className="eyebrow">Vehicle #{activeCar.id}</p><h2>{vehicleName(activeCar)}</h2><p>{customerName(customerMap.get(activeCar.customerId))}</p></div>
                <div className="detail-actions">
                  <button className="button button-secondary" type="button" onClick={openEdit}><Icon name="edit" size={15} />Edit</button>
                  <button className="button button-danger-ghost" type="button" onClick={remove}><Icon name="trash" size={15} />Delete</button>
                </div>
              </div>

              <div className="vehicle-specs">
                <div><small>Trim</small><strong>{activeCar.trim || "Not recorded"}</strong></div>
                <div><small>Color</small><strong>{activeCar.color || "Not recorded"}</strong></div>
                <div><small>Mileage</small><strong>{activeCar.mileage != null ? `${activeCar.mileage.toLocaleString()} miles` : "Not recorded"}</strong></div>
                <div><small>Plate</small><strong>{activeCar.licensePlate || "Not recorded"}</strong></div>
                <div className="wide-spec"><small>VIN</small><strong>{activeCar.vin || "Not recorded"}</strong></div>
              </div>

              <section className="detail-section">
                <div className="section-heading"><h3>Repair history</h3><button className="text-button" type="button" onClick={() => onNavigate("orders")}>Open repair workspace <Icon name="chevron" size={14} /></button></div>
                {vehicleOrders.length ? (
                  <div className="compact-list">
                    {vehicleOrders.map((order) => (
                      <button key={order.id} type="button" onClick={() => { selectOrder(order.id); onNavigate("orders"); }}>
                        <Icon name="orders" />
                        <span><strong>RO-{order.id}</strong><small>{dateTime(order.updatedAt || order.createdAt)}</small></span>
                        <StatusBadge status={order.status} />
                      </button>
                    ))}
                  </div>
                ) : <p className="inline-empty">This vehicle has no repair orders yet.</p>}
              </section>
            </>
          )}
        </section>
      </div>

      {editorMode && (
        <Modal title={editorMode === "create" ? "Add vehicle" : "Update vehicle"} eyebrow={editorMode === "create" ? "Customer vehicle" : `Vehicle #${activeCar?.id}`} onClose={closeEditor} width="large">
          <SafeForm className="form-stack">
            <p className="form-note">Enter cannot send this form. Use the review button when all vehicle information is ready.</p>
            <label>Customer
              <select value={form.customerId} disabled={editorMode === "edit"} onChange={(event) => changeField("customerId", event.target.value)}>
                <option value="">Choose customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}</option>)}
              </select>
            </label>
            <div className="form-grid form-grid-three">
              <label>Year<input type="number" min="1886" value={form.year} onChange={(event) => changeField("year", event.target.value)} /></label>
              <label>Make<input value={form.make} onChange={(event) => changeField("make", event.target.value)} /></label>
              <label>Model<input value={form.model} onChange={(event) => changeField("model", event.target.value)} /></label>
            </div>
            <div className="form-grid">
              <label>Trim<input value={form.trim} onChange={(event) => changeField("trim", event.target.value)} /></label>
              <label>Color<input value={form.color} onChange={(event) => changeField("color", event.target.value)} /></label>
              <label>License plate<input value={form.licensePlate} onChange={(event) => changeField("licensePlate", event.target.value)} /></label>
              <label>Mileage<input type="number" min="0" value={form.mileage} onChange={(event) => changeField("mileage", event.target.value)} /></label>
            </div>
            <label>VIN<input value={form.vin} onChange={(event) => changeField("vin", event.target.value)} /></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="form-actions">
              <button className="button button-secondary" type="button" onClick={closeEditor}>Cancel</button>
              <button className="button button-primary" type="button" disabled={saving} onClick={save}>{saving ? "Working…" : editorMode === "create" ? "Review and add" : "Review and save"}</button>
            </div>
          </SafeForm>
        </Modal>
      )}
    </>
  );
}
