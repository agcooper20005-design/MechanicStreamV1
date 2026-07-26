export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || ""
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      `The server returned ${response.status}.`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

const json = (method, body) => ({
  method,
  body: JSON.stringify(body),
});

export const api = {
  customers: {
    list: () => request("/api/customers"),
    get: (id) => request(`/api/customers/${id}`),
    create: (payload) => request("/api/customers", json("POST", payload)),
    update: (id, payload) => request(`/api/customers/${id}`, json("PUT", payload)),
    remove: (id) => request(`/api/customers/${id}`, { method: "DELETE" }),
    cars: (id) => request(`/api/customers/${id}/cars`),
    orders: (id) => request(`/api/customers/${id}/repairOrders`),
  },

  cars: {
    list: () => request("/api/cars"),
    get: (id) => request(`/api/cars/${id}`),
    create: (payload) => request("/api/cars", json("POST", payload)),
    update: (id, payload) => request(`/api/cars/${id}`, json("PUT", payload)),
    remove: (id) => request(`/api/cars/${id}`, { method: "DELETE" }),
    orders: (id) => request(`/api/cars/${id}/repairOrders`),
  },

  orders: {
    list: () => request("/api/repair-orders"),
    get: (id) => request(`/api/repair-orders/${id}`),
    create: (payload) => request("/api/repair-orders", json("POST", payload)),
    update: (id, payload) => request(`/api/repair-orders/${id}`, json("PUT", payload)),
    remove: (id) => request(`/api/repair-orders/${id}`, { method: "DELETE" }),
    changeStatus: (id, action) =>
      request(`/api/repair-orders/${id}/${action}`, { method: "PATCH" }),
    parts: (id) => request(`/api/repair-orders/${id}/parts`),
    labor: (id) => request(`/api/repair-orders/${id}/labor-items`),
  },

  parts: {
    create: (payload) => request("/api/repair-parts", json("POST", payload)),
    update: (id, payload) => request(`/api/repair-part/${id}`, json("PUT", payload)),
    remove: (id) => request(`/api/repair-parts/${id}`, { method: "DELETE" }),
  },

  labor: {
    list: () => request("/api/labor-item"),
    create: (payload) => request("/api/labor-item", json("POST", payload)),
    update: (id, payload) => request(`/api/labor-item/${id}`, json("PUT", payload)),
    remove: (id) => request(`/api/labor-item/${id}`, { method: "DELETE" }),
  },

  invoices: {
    byOrder: (id) => request(`/api/invoices/repair-orders/${id}`),
  },
};
