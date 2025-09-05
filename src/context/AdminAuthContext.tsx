import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiFetch } from "../services/api";

export type AdminRole = "admin" | "host" | "guest";
export interface AdminUser {
  id?: string;
  name: string;
  FullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isVerified?: boolean;
  isActive?: boolean;
  email: string;
  avatar: string;
  role: AdminRole;
  preferences?: []; // Adjust based on your preferences structure
  createdAt?: string;
  updatedAt?: string;
  // Allow additional properties
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("adminToken") || null
  );
  const [loading, setLoading] = useState(true);

  // On mount, try to fetch user if token exists

  const fetchProfile = async (token?: string) => {
    setLoading(true);
    try {
      const res = await apiFetch<{ profile: AdminUser }>(
        "/admin/profile",
        {},
        token
      );

      setUser({
        id: res.profile.id,
        email: res.profile.email,
        firstName: res.profile.firstName,
        lastName: res.profile.lastName,
        avatar: res.profile.avatar || "",
        role: res.profile.role,
        isVerified: res.profile.isVerified,
        isActive: res.profile.isActive,
        preferences: res.profile.preferences,
        createdAt: res.profile.createdAt,
        updatedAt: res.profile.updatedAt,
      } as AdminUser);
    } catch (err: any) {
      // Only log out if 401/403 (token invalid/expired)
      if (
        err.message &&
        (err.message.includes("401") ||
          err.message.toLowerCase().includes("unauthorized") ||
          err.message.includes("403"))
      ) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("adminToken");
      }
      // Otherwise, keep the token and user (could be a network error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // 1. Make an API call to your backend login endpoint
      const res = await apiFetch<any>("/adminauth/adminLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // 2. If the request is successful, the backend should return a token and user data.
      // Store the token and user data in your state and local storage.
      if (res.data.token && res.data.user) {
        const { user, token } = res.data;
        setUser({
          ...user,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          avatar: user.avatar || user.profile_image_url,
          email: user.email,
          role: user.role,
          isVerified: user.is_verified,
          isActive: user.is_active,
        });
        setToken(token);
        // Store token in local storage for persistence
        localStorage.setItem("adminToken", token);
        setUser(user);
        return true;
      } else {
        // Handle cases where the API returns a success status but no token
        console.error(
          "Login failed: Token or user data missing from response."
        );

        return false;
      }
    } catch (err: any) {
      // 3. Handle errors from the API call (e.g., 401 Unauthorized, network errors)
      console.error("Login API error:", err);
      // This error will be caught by the login page component and an error message will be shown.
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading: loading,
        isAuthenticated: Boolean(user) && Boolean(token),
        login,
        logout,
      }}
    >
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
