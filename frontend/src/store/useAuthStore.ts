import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authUser: null,
      token: null,
      isSigningUp: false,
      isLoggingIn: false,

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
            console.log("Axios error:", error.response?.data.error);
            toast.error("Error signing up: " + error.response?.data.error);
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
          // TODO: success message
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            console.log("Axios error:", error.response?.data.error);
            toast.error("Error logging in: " + error.response?.data.error);
          } else {
            console.log("Unknown error:", error);
            toast.error("Error logging in: " + error);
          }
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        set({ token: null, authUser: null });
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
  signup: (signupData: {
    username: string;
    email: string;
    password: string;
  }) => void;
  login: (loginData: { email: string; password: string }) => void;
  logout: () => Promise<void>;
}
