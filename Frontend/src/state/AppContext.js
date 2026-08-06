import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";
import { useUI } from "./UIContext";

const AppContext = createContext(null);

function mergeRecord(records, record) {
  const exists = records.some((item) => item.id === record.id);
  return exists
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}

function savedNumber(key) {
  const value = localStorage.getItem(key);
  return value ? Number(value) : null;
}

export function AppProvider({ children }) {
  const { notify } = useUI();
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [laborItems, setLaborItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCustomerId, setActiveCustomerIdState] = useState(() => savedNumber("mechanicstream-active-customer"));
  const [activeCarId, setActiveCarIdState] = useState(() => savedNumber("mechanicstream-active-car"));
  const [activeOrderId, setActiveOrderIdState] = useState(() => savedNumber("mechanicstream-active-order"));

  const loadCore = useCallback(async (quiet = false) => {
    quiet ? setSyncing(true) : setLoading(true);
    if (!quiet) setError(null);
    try {
      const [customerData, addressData, carData, orderData, laborData] = await Promise.all([
        api.customers.list(),
        api.addresses.list(),
        api.cars.list(),
        api.orders.list(),
        api.labor.list(),
      ]);
      setCustomers(customerData || []);
      setAddresses(addressData || []);
      setCars(carData || []);
      setOrders(orderData || []);
      setLaborItems(laborData || []);
    } catch (caught) {
      if (!quiet) setError(caught);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (activeCustomerId && !customers.some((item) => item.id === activeCustomerId)) {
      setActiveCustomerIdState(null);
      setActiveCarIdState(null);
      setActiveOrderIdState(null);
    }
  }, [customers, activeCustomerId]);

  useEffect(() => {
    if (activeCarId && !cars.some((item) => item.id === activeCarId)) {
      setActiveCarIdState(null);
      setActiveOrderIdState(null);
    }
  }, [cars, activeCarId]);

  useEffect(() => {
    if (activeOrderId && !orders.some((item) => item.id === activeOrderId)) {
      setActiveOrderIdState(null);
    }
  }, [orders, activeOrderId]);

  useEffect(() => {
    const values = [
      ["mechanicstream-active-customer", activeCustomerId],
      ["mechanicstream-active-car", activeCarId],
      ["mechanicstream-active-order", activeOrderId],
    ];
    values.forEach(([key, value]) => {
      if (value) localStorage.setItem(key, String(value));
      else localStorage.removeItem(key);
    });
  }, [activeCustomerId, activeCarId, activeOrderId]);

  const selectCustomer = useCallback((customerId) => {
    const id = customerId ? Number(customerId) : null;
    setActiveCustomerIdState(id);
    setActiveCarIdState((current) => {
      const currentCar = cars.find((car) => car.id === current);
      return currentCar?.customerId === id ? current : null;
    });
    setActiveOrderIdState(null);
  }, [cars]);

  const selectCar = useCallback((carId) => {
    const id = carId ? Number(carId) : null;
    const car = cars.find((item) => item.id === id);
    setActiveCarIdState(id);
    if (car) setActiveCustomerIdState(car.customerId);
    setActiveOrderIdState(null);
  }, [cars]);

  const selectOrder = useCallback((orderId) => {
    const id = orderId ? Number(orderId) : null;
    const order = orders.find((item) => item.id === id);
    setActiveOrderIdState(id);
    if (order) {
      setActiveCustomerIdState(order.customerId);
      setActiveCarIdState(order.carId);
    }
  }, [orders]);

  const createCustomer = useCallback(async (payload) => {
    const created = await api.customers.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    let finalRecord = created;
    if (payload.phoneNumber || payload.email) {
      finalRecord = await api.customers.update(created.id, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber || "",
        email: payload.email || "",
      });
    }
    const createdAddress = await api.addresses.create({
      customerId: finalRecord.id,
      street: payload.street,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
    });
    setCustomers((current) => mergeRecord(current, finalRecord));
    setAddresses((current) => mergeRecord(current, createdAddress));
    selectCustomer(finalRecord.id);
    notify("Customer created and selected.");
    loadCore(true);
    return finalRecord;
  }, [loadCore, notify, selectCustomer]);

  const updateCustomer = useCallback(async (id, payload) => {
    const updated = await api.customers.update(id, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
    });
    const addressPayload = {
      street: payload.street,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
    };
    const existingAddress = addresses.find((address) => address.customerId === id);
    const savedAddress = existingAddress
      ? await api.addresses.update(existingAddress.id, addressPayload)
      : await api.addresses.create({ customerId: id, ...addressPayload });
    setCustomers((current) => mergeRecord(current, updated));
    setAddresses((current) => mergeRecord(current, savedAddress));
    notify("Customer changes saved.");
    loadCore(true);
    return updated;
  }, [addresses, loadCore, notify]);

  const deleteCustomer = useCallback(async (id) => {
    await api.customers.remove(id);
    setCustomers((current) => current.filter((item) => item.id !== id));
    setAddresses((current) => current.filter((item) => item.customerId !== id));
    setCars((current) => current.filter((item) => item.customerId !== id));
    setOrders((current) => current.filter((item) => item.customerId !== id));
    if (activeCustomerId === id) selectCustomer(null);
    notify("Customer deleted.");
    loadCore(true);
  }, [activeCustomerId, loadCore, notify, selectCustomer]);

  const createCar = useCallback(async (payload) => {
    const created = await api.cars.create(payload);
    setCars((current) => mergeRecord(current, created));
    selectCar(created.id);
    notify("Vehicle added and selected.");
    loadCore(true);
    return created;
  }, [loadCore, notify, selectCar]);

  const updateCar = useCallback(async (id, payload) => {
    const updated = await api.cars.update(id, payload);
    setCars((current) => mergeRecord(current, updated));
    notify("Vehicle changes saved.");
    loadCore(true);
    return updated;
  }, [loadCore, notify]);

  const deleteCar = useCallback(async (id) => {
    await api.cars.remove(id);
    setCars((current) => current.filter((item) => item.id !== id));
    setOrders((current) => current.filter((item) => item.carId !== id));
    if (activeCarId === id) selectCar(null);
    notify("Vehicle deleted.");
    loadCore(true);
  }, [activeCarId, loadCore, notify, selectCar]);

  const createOrder = useCallback(async (payload) => {
    const created = await api.orders.create(payload);
    setOrders((current) => mergeRecord(current, created));
    selectOrder(created.id);
    notify("Repair order created and opened.");
    loadCore(true);
    return created;
  }, [loadCore, notify, selectOrder]);

  const updateOrder = useCallback(async (id, payload) => {
    const updated = await api.orders.update(id, payload);
    setOrders((current) => mergeRecord(current, updated));
    notify("Repair order updated.");
    loadCore(true);
    return updated;
  }, [loadCore, notify]);

  const changeOrderStatus = useCallback(async (id, action) => {
    const updated = await api.orders.changeStatus(id, action);
    setOrders((current) => mergeRecord(current, updated));
    notify("Repair-order status updated.");
    loadCore(true);
    return updated;
  }, [loadCore, notify]);

  const deleteOrder = useCallback(async (id) => {
    await api.orders.remove(id);
    setOrders((current) => current.filter((item) => item.id !== id));
    if (activeOrderId === id) setActiveOrderIdState(null);
    notify("Repair order deleted.");
    loadCore(true);
  }, [activeOrderId, loadCore, notify]);

  const activeCustomer = customers.find((item) => item.id === activeCustomerId) || null;
  const activeCar = cars.find((item) => item.id === activeCarId) || null;
  const activeOrder = orders.find((item) => item.id === activeOrderId) || null;

  const value = useMemo(() => ({
    customers,
    addresses,
    cars,
    orders,
    laborItems,
    loading,
    syncing,
    error,
    reload: () => loadCore(false),
    refreshQuietly: () => loadCore(true),
    activeCustomerId,
    activeCarId,
    activeOrderId,
    activeCustomer,
    activeCar,
    activeOrder,
    selectCustomer,
    selectCar,
    selectOrder,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createCar,
    updateCar,
    deleteCar,
    createOrder,
    updateOrder,
    changeOrderStatus,
    deleteOrder,
    setLaborItems,
  }), [
    customers, addresses, cars, orders, laborItems, loading, syncing, error, loadCore,
    activeCustomerId, activeCarId, activeOrderId, activeCustomer, activeCar, activeOrder,
    selectCustomer, selectCar, selectOrder, createCustomer, updateCustomer,
    deleteCustomer, createCar, updateCar, deleteCar, createOrder, updateOrder,
    changeOrderStatus, deleteOrder,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppData must be used inside AppProvider.");
  return context;
}
