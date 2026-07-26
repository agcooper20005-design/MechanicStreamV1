import React from "react";
import { dateTime, laborLineTotal, money, partLineTotal, vehicleName, customerName } from "../utils/formatters";

export default function InvoiceDocument({ invoice }) {
  if (!invoice) return null;
  const {
    customer,
    car,
    repairOrder,
    repairParts = [],
    laborItems = [],
    partsSubtotal,
    laborSubtotal,
    subtotal,
    tax,
    total,
  } = invoice;

  return (
    <article id="invoice-print-region" className="invoice-document">
      <header className="invoice-header">
        <div>
          <span className="invoice-logo">MS</span>
          <div><h2>MechanicStream</h2><p>Professional automotive service</p></div>
        </div>
        <div className="invoice-title"><span>Invoice</span><strong>RO-{repairOrder?.id}</strong></div>
      </header>

      <section className="invoice-meta">
        <div><small>Customer</small><strong>{customerName(customer)}</strong><span>{customer?.phoneNumber || "No phone number"}</span><span>{customer?.email || "No email address"}</span></div>
        <div><small>Vehicle</small><strong>{vehicleName(car)}</strong><span>{car?.vin ? `VIN: ${car.vin}` : "VIN not recorded"}</span><span>{car?.licensePlate ? `Plate: ${car.licensePlate}` : "Plate not recorded"}</span></div>
        <div><small>Repair order</small><strong>RO-{repairOrder?.id}</strong><span>Opened: {dateTime(repairOrder?.createdAt)}</span><span>Completed: {dateTime(repairOrder?.completedAt)}</span></div>
      </section>

      <section className="invoice-notes">
        <small>Mechanic notes</small>
        <p>{repairOrder?.mechanicNotes || "No mechanic notes were recorded."}</p>
      </section>

      <section className="invoice-lines">
        <h3>Parts</h3>
        <div className="invoice-table">
          <div className="invoice-row invoice-row-head"><span>Description</span><span>Condition</span><span>Quantity</span><span>Unit price</span><span>Amount</span></div>
          {repairParts.length ? repairParts.map((part) => (
            <div className="invoice-row" key={part.id}>
              <span><strong>{part.partName}</strong><small>{part.partNumber}</small></span>
              <span>{part.partCondition}</span>
              <span>{part.quantity}</span>
              <span>{money(part.unitPrice)}</span>
              <span>{money(partLineTotal(part))}</span>
            </div>
          )) : <p className="invoice-empty">No parts billed.</p>}
        </div>
      </section>

      <section className="invoice-lines">
        <h3>Labor</h3>
        <div className="invoice-table">
          <div className="invoice-row labor-row invoice-row-head"><span>Technician</span><span>Hours</span><span>Rate</span><span>Amount</span></div>
          {laborItems.length ? laborItems.map((item) => (
            <div className="invoice-row labor-row" key={item.id}>
              <span><strong>{item.technician}</strong></span>
              <span>{Number(item.hours || 0).toFixed(2)}</span>
              <span>{money(item.laborRate)}</span>
              <span>{money(laborLineTotal(item))}</span>
            </div>
          )) : <p className="invoice-empty">No labor billed.</p>}
        </div>
      </section>

      <footer className="invoice-footer">
        <p>Thank you for choosing MechanicStream.</p>
        <div className="invoice-totals">
          <span>Parts subtotal<strong>{money(partsSubtotal)}</strong></span>
          <span>Labor subtotal<strong>{money(laborSubtotal)}</strong></span>
          <span>Subtotal<strong>{money(subtotal)}</strong></span>
          <span>Tax<strong>{money(tax)}</strong></span>
          <span className="invoice-grand-total">Total<strong>{money(total)}</strong></span>
        </div>
      </footer>
    </article>
  );
}
