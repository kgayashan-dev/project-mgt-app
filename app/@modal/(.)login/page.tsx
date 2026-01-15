/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";



export interface LoginRequest {
  Username: string;
  password: string;
}

export interface RegisterRequest {
  Username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  Username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
  success: boolean;
}





const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function LoginModal() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [Username, userName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginRequest: LoginRequest = { Username, password };
      
      const response = await fetch(`${API_URL}/project_pulse/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequest),
      });

      const data: AuthResponse = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to dashboard or home page
        router.push("/dashboard");
        handleClose();
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <dialog ref={dialogRef} className="bg-transparent" onClose={handleClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="Username"
                value={Username}
                onChange={(e) => userName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter your Username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Dont have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}