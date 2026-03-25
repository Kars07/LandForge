import { User, Property, Inquiry, Offer, Transaction } from './types';

const KEYS = {
  USER: 'landforge_user',
  PROPERTIES: 'landforge_properties',
  INQUIRIES: 'landforge_inquiries',
  OFFERS: 'landforge_offers',
  TRANSACTIONS: 'landforge_transactions',
  SAVED: 'landforge_saved',
  USERS: 'landforge_users',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Auth
export const getUser = (): User | null => get<User | null>(KEYS.USER, null);
export const setUser = (user: User | null) => set(KEYS.USER, user);
export const logout = () => localStorage.removeItem(KEYS.USER);

// Users registry
export const getUsers = (): User[] => get<User[]>(KEYS.USERS, []);
export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  set(KEYS.USERS, users);
};
export const findUser = (email: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

// Properties
export const getProperties = (): Property[] => get<Property[]>(KEYS.PROPERTIES, []);
export const setProperties = (props: Property[]) => set(KEYS.PROPERTIES, props);
export const addProperty = (prop: Property) => {
  const props = getProperties();
  props.push(prop);
  setProperties(props);
};
export const updateProperty = (id: string, updates: Partial<Property>) => {
  const props = getProperties().map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
  setProperties(props);
};
export const getPropertyById = (id: string): Property | undefined => getProperties().find(p => p.id === id);

// Inquiries
export const getInquiries = (): Inquiry[] => get<Inquiry[]>(KEYS.INQUIRIES, []);
export const addInquiry = (inq: Inquiry) => {
  const items = getInquiries();
  items.push(inq);
  set(KEYS.INQUIRIES, items);
};

// Offers
export const getOffers = (): Offer[] => get<Offer[]>(KEYS.OFFERS, []);
export const addOffer = (offer: Offer) => {
  const items = getOffers();
  items.push(offer);
  set(KEYS.OFFERS, items);
};
export const updateOffer = (id: string, updates: Partial<Offer>) => {
  const items = getOffers().map(o => o.id === id ? { ...o, ...updates } : o);
  set(KEYS.OFFERS, items);
};

// Transactions
export const getTransactions = (): Transaction[] => get<Transaction[]>(KEYS.TRANSACTIONS, []);
export const addTransaction = (tx: Transaction) => {
  const items = getTransactions();
  items.push(tx);
  set(KEYS.TRANSACTIONS, items);
};
export const updateTransaction = (id: string, updates: Partial<Transaction>) => {
  const items = getTransactions().map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
  set(KEYS.TRANSACTIONS, items);
};

// Saved properties
export const getSavedProperties = (userId: string): string[] => {
  const all = get<Record<string, string[]>>(KEYS.SAVED, {});
  return all[userId] || [];
};
export const toggleSaveProperty = (userId: string, propertyId: string) => {
  const all = get<Record<string, string[]>>(KEYS.SAVED, {});
  const saved = all[userId] || [];
  if (saved.includes(propertyId)) {
    all[userId] = saved.filter(id => id !== propertyId);
  } else {
    all[userId] = [...saved, propertyId];
  }
  set(KEYS.SAVED, all);
  return all[userId];
};

export const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
