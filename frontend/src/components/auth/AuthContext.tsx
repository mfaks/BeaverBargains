"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../../types/User";
import type { AuthContext } from "../../types/AuthContext";
import { AuthProviderProps } from "../../types/AuthProviderProps";

const AuthContext = createContext<AuthContext | undefined>(undefined);

const BASE_URL = "http://localhost:8080";
const getFullImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return "";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  return `${BASE_URL}/uploads/${imageUrl}`;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      const userData: User = JSON.parse(storedUser);
      if (userData.profileImageUrl) {
        userData.profileImageUrl = getFullImageUrl(userData.profileImageUrl);
      }
      setIsAuthenticated(true);
      setUser(userData);
      setToken(storedToken);
      setIsEmailVerified(userData.emailVerified);
    }
    setLoading(false);
  }, []);

  const login = (userData: User, newToken: string) => {
    if (userData.profileImageUrl) {
      userData.profileImageUrl = getFullImageUrl(userData.profileImageUrl);
    }
    setIsAuthenticated(true);
    setUser(userData);
    setToken(newToken);
    setIsEmailVerified(userData.emailVerified);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setIsEmailVerified(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateUserProfileImageUrl = (newImageUrl: string) => {
    if (user) {
      const fullImageUrl = getFullImageUrl(newImageUrl);
      const updatedUser = { ...user, profileImageUrl: fullImageUrl };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const contextValue: AuthContext = {
    isAuthenticated,
    user,
    token,
    loading,
    isEmailVerified,
    login,
    logout,
    updateUserProfileImageUrl,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
