import React, { useMemo } from "react";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { useAppData } from "../state/AppContext";
import { customerName, dateTime, vehicleName } from "../utils/formatters";

export default function DashboardPage({ onNavigate }) {
  const {
    customers,
    cars,
    orders,
    activeCustomer,
    activeCar,
    activeOrder,
    selectOrder,
  } = useAppData();

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );
  const carMap = useMemo(
    () => new Map(cars.map((car) => [car.id, car])),
    [cars],
  );
  const activeOrders = orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status));
  const recent = [...orders]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 6);

  const openOrder = (orderId) => {
    selectOrder(orderId);
    onNavigate("orders");
  };

  return (
    <div className="page-stack">
      <section className="stats-grid" aria-label="Shop statistics">
        <button className="stat-card" type="button" onClick={() => onNavigate("orders")}>
          <span className="stat-icon"><Icon name="orders" /></span>
          <span><small>Active orders</small><strong>{activeOrders.length}</strong><em>{orders.length} total</em></span>
        </button>
        <button className="stat-card" type="button" onClick={() => onNavigate("customers")}>
          <span className="stat-icon"><Icon name="customers" /></span>
          <span><small>Customers</small><strong>{customers.length}</strong><em>Saved profiles</em></span>
        </button>
        <button className="stat-card" type="button" onClick={() => onNavigate("vehicles")}>
          <span className="stat-icon"><Icon name="car" /></span>
          <span><small>Vehicles</small><strong>{cars.length}</strong><em>Customer vehicles</em></span>
        </button>
        <div className="stat-card">
          <span className="stat-icon"><Icon name="wrench" /></span>
          <span><small>In progress</small><strong>{orders.filter((order) => order.status === "IN_PROGRESS").length}</strong><em>Being repaired</em></span>
        </div>
      </section>

      <section className="dashboard-columns">
        <article className="panel workflow-card">
          <div className="panel-heading">
            <div><p className="eyebrow">Active context</p><h2>Current workflow</h2></div>
          </div>
          <div className="workflow-steps">
            <button type="button" className={activeCustomer ? "complete" : ""} onClick={() => onNavigate("customers")}>
              <span>{activeCustomer ? <Icon name="check" /> : "1"}</span>
              <div><small>Customer</small><strong>{customerName(activeCustomer)}</strong></div>
              <Icon name="chevron" />
            </button>
            <button type="button" className={activeCar ? "complete" : ""} onClick={() => onNavigate("vehicles")}>
              <span>{activeCar ? <Icon name="check" /> : "2"}</span>
              <div><small>Vehicle</small><strong>{vehicleName(activeCar)}</strong></div>
              <Icon name="chevron" />
            </button>
            <button type="button" className={activeOrder ? "complete" : ""} onClick={() => onNavigate("orders")}>
              <span>{activeOrder ? <Icon name="check" /> : "3"}</span>
              <div><small>Repair order</small><strong>{activeOrder ? `RO-${activeOrder.id}` : "Choose or create an order"}</strong></div>
              <Icon name="chevron" />
            </button>
            <button type="button" className={activeOrder ? "available" : ""} disabled={!activeOrder} onClick={() => onNavigate("invoices")}>
              <span>4</span>
              <div><small>Invoice</small><strong>{activeOrder ? "Review and print invoice" : "Repair order required"}</strong></div>
              <Icon name="chevron" />
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Quick start</p><h2>Create records</h2></div>
          </div>
          <div className="quick-actions">
            <button type="button" onClick={() => onNavigate("customers")}><Icon name="customers" /><span><strong>Customer</strong><small>Create or update a profile</small></span><Icon name="chevron" /></button>
            <button type="button" onClick={() => onNavigate("vehicles")}><Icon name="car" /><span><strong>Vehicle</strong><small>Add a customer vehicle</small></span><Icon name="chevron" /></button>
            <button type="button" onClick={() => onNavigate("orders")}><Icon name="orders" /><span><strong>Repair order</strong><small>Open a job and add work</small></span><Icon name="chevron" /></button>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading panel-heading-action">
          <div><p className="eyebrow">Recent activity</p><h2>Repair orders</h2></div>
          <button className="text-button" type="button" onClick={() => onNavigate("orders")}>View all <Icon name="chevron" size={15} /></button>
        </div>
        {recent.length === 0 ? (
          <p className="inline-empty">No repair orders have been created.</p>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Vehicle</th><th>Status</th><th>Updated</th></tr></thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id} className="clickable-row" onClick={() => openOrder(order.id)}>
                    <td><strong>RO-{order.id}</strong></td>
                    <td>{customerName(customerMap.get(order.customerId))}</td>
                    <td>{vehicleName(carMap.get(order.carId))}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{dateTime(order.updatedAt || order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
