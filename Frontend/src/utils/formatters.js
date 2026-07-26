export const STATUS_LABELS = {
  OPEN: "Open",
  DIAGNOSING: "Diagnosing",
  WAITING_FOR_APPROVAL: "Waiting for approval",
  WAITING_FOR_PARTS: "Waiting for parts",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_ACTIONS = [
  { status: "DIAGNOSING", action: "diagnosing", label: "Begin diagnosis" },
  { status: "WAITING_FOR_APPROVAL", action: "waiting-for-approval", label: "Await approval" },
  { status: "WAITING_FOR_PARTS", action: "waiting-for-parts", label: "Await parts" },
  { status: "IN_PROGRESS", action: "in-progress", label: "Begin repair" },
  { status: "COMPLETED", action: "complete", label: "Mark complete" },
  { status: "CANCELLED", action: "cancel", label: "Cancel order" },
];

export const PART_CONDITIONS = ["NEW", "USED", "REBUILT", "RECONDITIONED"];

export function customerName(customer) {
  if (!customer) return "No customer selected";
  return `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || `Customer #${customer.id}`;
}

export function vehicleName(car) {
  if (!car) return "No vehicle selected";
  return `${car.year || ""} ${car.make || ""} ${car.model || ""}`
    .replace(/\s+/g, " ")
    .trim() || `Vehicle #${car.id}`;
}

export function money(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export function dateTime(value) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function partLineTotal(part) {
  return Number(part?.quantity || 0) * Number(part?.unitPrice || 0);
}

export function laborLineTotal(item) {
  return Number(item?.hours || 0) * Number(item?.laborRate || 0);
}

export function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}
