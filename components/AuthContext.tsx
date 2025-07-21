import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  setLoggedIn: (value: boolean) => void;
  setGuest: (value: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sincronizar el estado con AsyncStorage al inicializar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setIsLoggedIn(true);
          setIsGuest(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    checkAuthStatus();
  }, []);

  const setLoggedIn = (value: boolean) => {
    setIsLoggedIn(value);
    if (value) setIsGuest(false); // Si se loguea, ya no es invitado
  };

  const setGuest = (value: boolean) => {
    setIsGuest(value);
    if (value) setIsLoggedIn(false); // Si es invitado, no está logueado
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('username'); // Limpiar AsyncStorage
      setIsLoggedIn(false);
      setIsGuest(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así limpiamos el estado local
      setIsLoggedIn(false);
      setIsGuest(false);
    }
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
