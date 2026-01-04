import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  user_id: number;
  username: string;
  email: string;
  exp: number;
  iat: number;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authUser: null,
      token: null,
      isSigningUp: false,
      isLoggingIn: false,

      setOAuthToken: (token: string) => {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          set({
            token,
            authUser: {
              username: decoded.username,
              email: decoded.email,
            },
          });
          toast.success("Logged in successfully.");
        } catch {
          toast.error("Invalid token received.");
        }
      },

      signup: async (signupData: {
        username: string;
        email: string;
        password: string;
      }) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", signupData, {});
          set({
            token: res.data.token,
            authUser: {
              username: res.data.username,
              email: res.data.email,
            },
          });
          toast.success("Account created successfully.");
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 429) {
              toast.error("Too many failed attempts. Please try again later.");
            } else {
              console.log("Axios error:", error.response?.data.error);
              toast.error("Error signing up: " + error.response?.data.error);
            }
          } else {
            console.log("Unknown error:", error);
            toast.error("Error creating account: " + error);
          }
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (loginData: { email: string; password: string }) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", loginData, {});
          set({
            token: res.data.token,
            authUser: {
              username: res.data.username,
              email: res.data.email,
            },
          });
          toast.success("Logged in successfully.");
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 429) {
              toast.error("Too many failed attempts. Please try again later.");
            } else {
              console.log("Axios error:", error.response?.data.error);
              toast.error("Error logging in: " + error.response?.data.error);
            }
          } else {
            console.log("Unknown error:", error);
            toast.error("Error logging in: " + error);
          }
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: () => {
        set({ token: null, authUser: null });
        toast.success("Successfully logged out")
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

interface AuthStore {
  authUser: {
    username: string;
    email: string;
  } | null;
  token: string | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  setOAuthToken: (token: string) => void;
  signup: (signupData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (loginData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}
