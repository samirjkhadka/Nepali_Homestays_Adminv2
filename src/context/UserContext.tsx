import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organisation_id?: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('UserContext: Token exists:', !!token);
        
        if (token) {
          try {
            console.log('UserContext: Fetching profile...');
            const response = await apiFetch<any>('/auth/profile', {}, token);
            console.log('UserContext: Profile response:', response);
            
            const backendUser = response.user;
            const frontendUser: User = {
              id: backendUser.id,
              name: `${backendUser.first_name} ${backendUser.last_name}`.trim(),
              email: backendUser.email,
              role: backendUser.role,
              organisation_id: backendUser.organisation_id
            };
            
            console.log('UserContext: Setting user:', frontendUser);
            setUser(frontendUser);
          } catch (error) {
            console.error('UserContext: Failed to fetch profile:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('UserContext: Auth check failed:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    console.log('UserContext: Logging out');
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    setUser,
    logout,
    loading
  };

  console.log('UserContext: Current user:', user);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
