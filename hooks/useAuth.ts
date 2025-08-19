"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    logout,
  };
}
