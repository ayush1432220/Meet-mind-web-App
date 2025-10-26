"use client";
import { useAuthStore } from "@/store/user.store";
import { useRouter } from "next/navigation"; // Use next/router for Pages Router
import { useEffect } from "react";
import Loader from "../common/Loader";

// This component wraps pages that require authentication
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loader text="Checking session..." />;
  }

  if (user) {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
}
