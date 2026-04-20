import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, saveUserWithPassword, getUserPassword, initStorage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    const checkAuth = async () => {
      const storedUserId = sessionStorage.getItem('smart_travel_session');
      if (storedUserId) {
        const users = await getUsers();
        const foundUser = users.find(u => u.id === storedUserId);
        if (foundUser) {
          setUser(foundUser);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = await getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) return false;

    const storedPassword = getUserPassword(foundUser.id);
    if (storedPassword !== password) return false;

    setUser(foundUser);
    sessionStorage.setItem('smart_travel_session', foundUser.id);
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = await getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: Date.now(),
    };
    
    await saveUserWithPassword(newUser, password);
    setUser(newUser);
    sessionStorage.setItem('smart_travel_session', newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('smart_travel_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
