import { User, Trip, Activity, Expense, Document } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const USERS_KEY = 'smart_travel_users';
const PASSWORDS_KEY = 'smart_travel_passwords';
const TRIPS_KEY = 'smart_travel_trips';
const ACTIVITIES_KEY = 'smart_travel_activities';
const EXPENSES_KEY = 'smart_travel_expenses';
const DOCUMENTS_KEY = 'smart_travel_documents';

// Seed Data
const SEED_USER: User = {
  id: 'demo-user-id',
  name: 'Demo User',
  email: 'demo@travel.com',
  createdAt: Date.now(),
};

const SEED_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    userId: 'demo-user-id',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 37).toISOString().split('T')[0],
    budget: 200000,
    currency: 'JPY',
    notes: 'Excited for ramen, temples, and all things Tokyo!',
    coverEmoji: '🗼',
    status: 'planning',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'trip-2',
    userId: 'demo-user-id',
    title: 'Bali Retreat',
    destination: 'Bali, Indonesia',
    startDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 86400000 * 55).toISOString().split('T')[0],
    budget: 1500,
    currency: 'USD',
    notes: 'Relaxing by the beach with yoga and good food.',
    coverEmoji: '🏖️',
    status: 'completed',
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
  }
];

const SEED_ACTIVITIES: Activity[] = [
  { id: 'act-1', tripId: 'trip-1', title: 'Arrive at Narita Airport', day: 1, time: '14:00', location: 'Narita International Airport', notes: 'Pick up JR pass at airport desk', category: 'transport', createdAt: Date.now() },
  { id: 'act-2', tripId: 'trip-1', title: 'Check in to Hotel Gracery', day: 1, time: '16:00', location: 'Shinjuku, Tokyo', notes: 'Hotel is next to Godzilla head billboard', category: 'accommodation', createdAt: Date.now() },
  { id: 'act-3', tripId: 'trip-1', title: 'Sensoji Temple', day: 2, time: '10:00', location: 'Asakusa, Tokyo', notes: 'Buy omamori souvenirs at stalls', category: 'attraction', createdAt: Date.now() },
  { id: 'act-4', tripId: 'trip-2', title: 'Morning yoga class', day: 1, time: '08:00', location: 'Ubud Yoga House', notes: 'Bring water and mat', category: 'other', createdAt: Date.now() },
  { id: 'act-5', tripId: 'trip-2', title: 'Seminyak beach club', day: 2, time: '15:00', location: 'Seminyak Beach', notes: 'Cabana booked in advance', category: 'other', createdAt: Date.now() },
];

const SEED_EXPENSES: Expense[] = [
  { id: 'exp-1', tripId: 'trip-1', title: 'Return flights ANA', amount: 100000, category: 'transport', date: new Date().toISOString().split('T')[0], notes: 'ANA NH206', createdAt: Date.now() },
  { id: 'exp-2', tripId: 'trip-1', title: 'Hotel Gracery deposit', amount: 20000, category: 'accommodation', date: new Date().toISOString().split('T')[0], notes: '7 nights', createdAt: Date.now() },
  { id: 'exp-3', tripId: 'trip-1', title: 'JR Pass 14-day', amount: 30000, category: 'transport', date: new Date().toISOString().split('T')[0], notes: 'Unlimited Shinkansen', createdAt: Date.now() },
  { id: 'exp-4', tripId: 'trip-1', title: 'Pocket WiFi rental', amount: 5000, category: 'other', date: new Date().toISOString().split('T')[0], notes: '7 days', createdAt: Date.now() },
  { id: 'exp-5', tripId: 'trip-2', title: 'Airbnb villa 5 nights', amount: 800, category: 'accommodation', date: new Date(Date.now() - 86400000 * 65).toISOString().split('T')[0], notes: 'Wayan Guesthouse, Ubud', createdAt: Date.now() },
  { id: 'exp-6', tripId: 'trip-2', title: 'Scooter rental 5 days', amount: 50, category: 'transport', date: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0], notes: 'From local shop near villa', createdAt: Date.now() },
  { id: 'exp-7', tripId: 'trip-2', title: 'Restaurant bills', amount: 200, category: 'food', date: new Date(Date.now() - 86400000 * 58).toISOString().split('T')[0], notes: 'Warung meals and cafes', createdAt: Date.now() },
];

const SEED_DOCUMENTS: Document[] = [
  { id: 'doc-1', tripId: 'trip-1', title: 'ANA E-Ticket', type: 'ticket', notes: 'Confirmation #ABCNH123', createdAt: Date.now() },
  { id: 'doc-2', tripId: 'trip-1', title: 'Travel Insurance Policy', type: 'insurance', expiryDate: '2026-12-31', notes: 'Policy #987654 - World Nomads', createdAt: Date.now() },
  { id: 'doc-3', tripId: 'trip-2', title: 'Wayan Guesthouse Booking', type: 'hotel', notes: 'Host: Wayan Sudarma, +62 812 345 678', createdAt: Date.now() },
];

export const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([SEED_USER]));
    // Store demo user password
    const passwords: Record<string, string> = { 'demo-user-id': 'demo123' };
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  }
  if (!localStorage.getItem(TRIPS_KEY)) {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(SEED_TRIPS));
  }
  if (!localStorage.getItem(ACTIVITIES_KEY)) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(SEED_ACTIVITIES));
  }
  if (!localStorage.getItem(EXPENSES_KEY)) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(SEED_EXPENSES));
  }
  if (!localStorage.getItem(DOCUMENTS_KEY)) {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(SEED_DOCUMENTS));
  }
};

// Password helpers (plain text for demo - not for production)
export const getUserPassword = (userId: string): string | null => {
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
  return passwords[userId] || null;
};

const savePassword = (userId: string, password: string): void => {
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
  passwords[userId] = password;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
};

// Users
export const getUsers = async (): Promise<User[]> => {
  await delay(150);
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const saveUser = async (user: User): Promise<void> => {
  await delay(150);
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
};

export const saveUserWithPassword = async (user: User, password: string): Promise<void> => {
  await delay(150);
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  savePassword(user.id, password);
};

// Trips
export const getTrips = async (): Promise<Trip[]> => {
  await delay(150);
  return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
};

export const saveTrips = async (trips: Trip[]): Promise<void> => {
  await delay(150);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

// Activities
export const getActivities = async (): Promise<Activity[]> => {
  await delay(150);
  return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
};

export const saveActivities = async (activities: Activity[]): Promise<void> => {
  await delay(150);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

// Expenses
export const getExpenses = async (): Promise<Expense[]> => {
  await delay(150);
  return JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  await delay(150);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

// Documents
export const getDocuments = async (): Promise<Document[]> => {
  await delay(150);
  return JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || '[]');
};

export const saveDocuments = async (documents: Document[]): Promise<void> => {
  await delay(150);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
};
