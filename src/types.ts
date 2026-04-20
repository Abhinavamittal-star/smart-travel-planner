export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  notes: string;
  coverEmoji: string;
  status: 'planning' | 'active' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export interface Activity {
  id: string;
  tripId: string;
  title: string;
  day: number;
  time: string;
  location: string;
  notes: string;
  category: 'accommodation' | 'transport' | 'food' | 'attraction' | 'other';
  createdAt: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping' | 'other';
  date: string;
  notes: string;
  createdAt: number;
}

export interface Document {
  id: string;
  tripId: string;
  title: string;
  type: 'passport' | 'visa' | 'insurance' | 'ticket' | 'hotel' | 'other';
  expiryDate?: string;
  notes: string;
  createdAt: number;
}
