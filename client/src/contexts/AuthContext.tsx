import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserType = 'none' | 'attendee' | 'admin';

interface AuthContextType {
  userType: UserType;
  login: (type: UserType) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userType, setUserType] = useState<UserType>('none');

  // Load auth state from sessionStorage on mount
  useEffect(() => {
    const savedUserType = sessionStorage.getItem('userType') as UserType | null;
    if (savedUserType && ['attendee', 'admin'].includes(savedUserType)) {
      setUserType(savedUserType);
    }
  }, []);

  const login = (type: UserType) => {
    setUserType(type);
    sessionStorage.setItem('userType', type);
  };

  const logout = () => {
    setUserType('none');
    sessionStorage.removeItem('userType');
  };

  const isAuthenticated = userType !== 'none';
  const isAdmin = userType === 'admin';

  return (
    <AuthContext.Provider value={{
      userType,
      login,
      logout,
      isAuthenticated,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}