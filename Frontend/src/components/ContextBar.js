import React, { useMemo } from "react";
import { useAppData } from "../state/AppContext";
import { customerName, vehicleName } from "../utils/formatters";
import Icon from "./Icon";

export default function ContextBar({ onNavigate }) {
  const {
    customers,
    cars,
    orders,
    activeCustomerId,
    activeCarId,
    activeOrderId,
    selectCustomer,
    selectCar,
    selectOrder,
  } = useAppData();

  const customerCars = useMemo(
    () => cars.filter((car) => !activeCustomerId || car.customerId === activeCustomerId),
    [cars, activeCustomerId],
  );
  const vehicleOrders = useMemo(
    () => orders.filter((order) =>
      activeCarId ? order.carId === activeCarId :
      activeCustomerId ? order.customerId === activeCustomerId :
      true
    ),
    [orders, activeCustomerId, activeCarId],
  );

  return (
    <section className="context-bar" aria-label="Current workflow selection">
      <div className="context-heading">
        <span className="context-mark"><Icon name="wrench" size={17} /></span>
        <div><strong>Current workflow</strong><small>Your selections carry across every workspace.</small></div>
      </div>

      <label className="context-select">
        <span>Customer</span>
        <select
          value={activeCustomerId || ""}
          onChange={(event) => selectCustomer(event.target.value || null)}
        >
          <option value="">Choose customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customerName(customer)}</option>
          ))}
        </select>
      </label>

      <Icon name="chevron" className="context-chevron" />

      <label className="context-select">
        <span>Vehicle</span>
        <select
          value={activeCarId || ""}
          disabled={!activeCustomerId}
          onChange={(event) => selectCar(event.target.value || null)}
        >
          <option value="">{activeCustomerId ? "Choose vehicle" : "Select customer first"}</option>
          {customerCars.map((car) => (
            <option key={car.id} value={car.id}>{vehicleName(car)}</option>
          ))}
        </select>
      </label>

      <Icon name="chevron" className="context-chevron" />

      <label className="context-select">
        <span>Repair order</span>
        <select
          value={activeOrderId || ""}
          disabled={!activeCarId}
          onChange={(event) => selectOrder(event.target.value || null)}
        >
          <option value="">{activeCarId ? "Choose order" : "Select vehicle first"}</option>
          {vehicleOrders.map((order) => (
            <option key={order.id} value={order.id}>RO-{order.id}</option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="button button-secondary context-open"
        disabled={!activeOrderId}
        onClick={() => onNavigate("orders")}
      >
        Open order
        <Icon name="chevron" size={15} />
      </button>
    </section>
  );
}
