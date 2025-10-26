"use client";
import { useAuthStore } from "@/store/user.store";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/router
import { useState } from "react";
import Head from 'next/head';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    try {
      await register({ name, email, password });
      router.push("/dashboard"); // Redirect on success
    } catch (err) {
      // Error is handled in the store
      console.error(err);
    }
  };

  return (
    <>
      <Head>
        <title>Register - MeetMind</title>
      </Head>
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Create Account
          </h2>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              Create Account
            </button>
          </form>
          <p className="text-sm text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link href="/Auth/Login" className="text-blue-400 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
