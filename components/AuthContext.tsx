import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  setLoggedIn: (value: boolean) => void;
  setGuest: (value: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const setLoggedIn = (value: boolean) => {
    setIsLoggedIn(value);
    if (value) setIsGuest(false); // Si se loguea, ya no es invitado
  };

  const setGuest = (value: boolean) => {
    setIsGuest(value);
    if (value) setIsLoggedIn(false); // Si es invitado, no está logueado
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isGuest, setLoggedIn, setGuest, logout }}>
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
