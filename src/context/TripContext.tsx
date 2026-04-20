import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trip, Activity, Expense, Document } from '../types';
import { getTrips, saveTrips, getActivities, saveActivities, getExpenses, saveExpenses, getDocuments, saveDocuments } from '../services/storage';
import { useAuth } from './AuthContext';

interface TripContextType {
  trips: Trip[];
  activities: Activity[];
  expenses: Expense[];
  documents: Document[];
  loading: boolean;
  refreshTrips: () => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Trip>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addDocument: (document: Omit<Document, 'id' | 'createdAt'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setActivities([]);
      setExpenses([]);
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const allTrips = await getTrips();
    const userTrips = allTrips.filter(t => t.userId === user.id);
    setTrips(userTrips);

    const tripIds = userTrips.map(t => t.id);
    
    const allActs = await getActivities();
    setActivities(allActs.filter(a => tripIds.includes(a.tripId)));
    
    const allExps = await getExpenses();
    setExpenses(allExps.filter(e => tripIds.includes(e.tripId)));
    
    const allDocs = await getDocuments();
    setDocuments(allDocs.filter(d => tripIds.includes(d.tripId)));
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshTrips();
  }, [refreshTrips]);

  const addTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error("Not authenticated");
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      userId: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const allTrips = await getTrips();
    await saveTrips([...allTrips, newTrip]);
    await refreshTrips();
    return newTrip;
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    const allTrips = await getTrips();
    const updatedTrips = allTrips.map(t => t.id === id ? { ...t, ...tripData, updatedAt: Date.now() } : t);
    await saveTrips(updatedTrips);
    await refreshTrips();
  };

  const deleteTrip = async (id: string) => {
    const allTrips = await getTrips();
    await saveTrips(allTrips.filter(t => t.id !== id));
    await refreshTrips();
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    const newAct: Activity = { ...activityData, id: `act-${Date.now()}`, createdAt: Date.now() };
    const allActs = await getActivities();
    await saveActivities([...allActs, newAct]);
    await refreshTrips();
  };

  const updateActivity = async (id: string, activityData: Partial<Activity>) => {
    const allActs = await getActivities();
    const updatedActs = allActs.map(a => a.id === id ? { ...a, ...activityData } : a);
    await saveActivities(updatedActs);
    await refreshTrips();
  };

  const deleteActivity = async (id: string) => {
    const allActs = await getActivities();
    await saveActivities(allActs.filter(a => a.id !== id));
    await refreshTrips();
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = { ...expenseData, id: `exp-${Date.now()}`, createdAt: Date.now() };
    const allExps = await getExpenses();
    await saveExpenses([...allExps, newExp]);
    await refreshTrips();
  };

  const deleteExpense = async (id: string) => {
    const allExps = await getExpenses();
    await saveExpenses(allExps.filter(e => e.id !== id));
    await refreshTrips();
  };

  const addDocument = async (documentData: Omit<Document, 'id' | 'createdAt'>) => {
    const newDoc: Document = { ...documentData, id: `doc-${Date.now()}`, createdAt: Date.now() };
    const allDocs = await getDocuments();
    await saveDocuments([...allDocs, newDoc]);
    await refreshTrips();
  };

  const deleteDocument = async (id: string) => {
    const allDocs = await getDocuments();
    await saveDocuments(allDocs.filter(d => d.id !== id));
    await refreshTrips();
  };

  return (
    <TripContext.Provider value={{
      trips, activities, expenses, documents, loading, refreshTrips,
      addTrip, updateTrip, deleteTrip,
      addActivity, updateActivity, deleteActivity,
      addExpense, deleteExpense,
      addDocument, deleteDocument
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
