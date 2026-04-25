"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'user' | 'admin' | 'superadmin' | null;

interface AuthContextType {
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => {},
  logout: () => {},
  isInitialized: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('atmcore_role') as Role;
    if (storedRole) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(storedRole);
    }
    setIsInitialized(true);
  }, []);

  const login = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('atmcore_role', newRole as string);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('atmcore_role');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
