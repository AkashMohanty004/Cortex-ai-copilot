import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export interface Customer {
  id: string;
  name: string;
  location: string;
  role: string;
  created_at?: string;
}

interface CustomerContextType {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedCustomer: Customer | null;
  customers: Customer[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (id: string) => Promise<boolean>;
  logout: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load customers on mount to validate login keys
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<Customer[]>('/customers');
        setCustomers(res.data);
        
        // Check if there is an active session
        const savedAuth = localStorage.getItem('cortex_auth_customer_id');
        if (savedAuth && res.data.some(c => c.id === savedAuth)) {
          setSelectedCustomerId(savedAuth);
          setIsAuthenticated(true);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error loading customers:', err);
        setError(err.message || 'Failed to connect to backend server');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const cust = customers.find(c => c.id === selectedCustomerId) || null;
      setSelectedCustomer(cust);
    }
  }, [selectedCustomerId, customers]);

  const login = async (id: string): Promise<boolean> => {
    // Check if customer ID is valid against the database loaded customers list
    const matched = customers.find(c => c.id.toLowerCase() === id.trim().toLowerCase());
    if (matched) {
      setSelectedCustomerId(matched.id);
      setIsAuthenticated(true);
      localStorage.setItem('cortex_auth_customer_id', matched.id);
      localStorage.setItem('cortex_selected_customer_id', matched.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setSelectedCustomerId('');
    setSelectedCustomer(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cortex_auth_customer_id');
    localStorage.removeItem('cortex_selected_customer_id');
  };

  return (
    <CustomerContext.Provider value={{
      selectedCustomerId,
      setSelectedCustomerId,
      selectedCustomer,
      customers,
      loading,
      error,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
