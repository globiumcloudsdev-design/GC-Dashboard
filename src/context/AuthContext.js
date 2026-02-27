//src/context/AuthContext.js

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.getCurrentUser();

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Ensure token is in localStorage if returned
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("Auth check: User is not authenticated.");
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        // Save token to localStorage for api interceptor
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/login");
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const hasPermission = useCallback((module, action = 'view') => {
    if (!user) return false;

    // 1. Get role name and normalize it for wide matching
    const roleObj = user.role;
    const roleName = (typeof roleObj === 'object' ? roleObj?.name : roleObj) || '';
    const normalizedRole = roleName.toLowerCase().replace(/[\s_-]/g, '');

    // 2. Super Admin / Admin bypass - Very broad matching
    const adminTerms = ['superadmin', 'admin', 'administrator', 'root', 'super_admin'];
    if (adminTerms.some(term => normalizedRole.includes(term))) {
      return true;
    }

    // 3. Robust nested permission check
    const checkPerm = (perms) => {
      if (!perms) return false;
      // Standard: perms.module.action
      if (perms[module] && typeof perms[module] === 'object' && perms[module][action]) return true;
      // Flattened: perms["module_action"]
      if (perms[`${module}_${action}`] === true) return true;
      return false;
    };

    // 4. Try all possible permission paths
    if (checkPerm(user.permissions)) return true;
    if (checkPerm(user.role?.permissions)) return true;

    // 5. Default visible modules
    if (['dashboard', 'overview', 'profile'].includes(module)) return true;

    return false;
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasPermission,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};