// src/contexts/authContext.ts
import { createContext, useContext } from 'react';
import { SocialLoginCredentials } from '../services/auth_service';

export interface User {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, avatar?: string) => Promise<void>;
  socialLogin: (credentials: SocialLoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
