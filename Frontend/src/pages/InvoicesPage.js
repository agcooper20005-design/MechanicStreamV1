import React, { useMemo, useState } from "react";
import Icon from "../components/Icon";
import InvoicePanel from "../components/InvoicePanel";
import StatusBadge from "../components/StatusBadge";
import { EmptyState } from "../components/StateViews";
import { useAppData } from "../state/AppContext";
import { customerName, normalizeText, vehicleName } from "../utils/formatters";

export default function InvoicesPage() {
  const {
    customers,
    cars,
    orders,
    activeOrder,
    selectOrder,
  } = useAppData();
  const [search, setSearch] = useState("");

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
    if (!term) return orders;
    return orders.filter((order) =>
      normalizeText(
        `ro-${order.id} ${customerName(customerMap.get(order.customerId))} ${vehicleName(carMap.get(order.carId))}`,
      ).includes(term)
    );
  }, [orders, search, customerMap, carMap]);

  return (
    <div className="invoice-workspace">
      <section className="panel invoice-picker no-print">
        <div className="panel-heading">
          <div><p className="eyebrow">Invoice source</p><h2>Choose repair order</h2></div>
        </div>
        <label className="search-box">
          <Icon name="search" size={17} />
          <span className="sr-only">Search invoices</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, or vehicle" />
        </label>
        <div className="invoice-order-list">
          {filtered.map((order) => (
            <button
              key={order.id}
              type="button"
              className={activeOrder?.id === order.id ? "selected" : ""}
              onClick={() => selectOrder(order.id)}
            >
              <span><strong>RO-{order.id}</strong><small>{customerName(customerMap.get(order.customerId))}</small><small>{vehicleName(carMap.get(order.carId))}</small></span>
              <StatusBadge status={order.status} />
            </button>
          ))}
        </div>
      </section>

      <section className="panel invoice-preview-panel">
        {!activeOrder ? (
          <EmptyState icon="invoice" title="Select a repair order" message="Choose a repair order to request its calculated invoice from the backend." />
        ) : (
          <InvoicePanel orderId={activeOrder.id} />
        )}
      </section>
    </div>
  );
}
