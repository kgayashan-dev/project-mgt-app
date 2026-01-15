/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  username: string;
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

export default function RegisterModal() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  // Form state
  const [username, userName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Password validation
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[^\da-zA-Z]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordErrors(validatePassword(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (passwordErrors.length > 0) {
      setError("Please fix password errors");
      return;
    }
    
    setIsLoading(true);

    try {
      const registerRequest: RegisterRequest = { 
        username, 
        password, 
        confirmPassword,
        firstName, 
        lastName 
      };
      
      const response = await fetch(`${API_URL}/project_pulse/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerRequest),
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || "Registration successful!");
        
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
          handleClose();
        }, 2000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <dialog ref={dialogRef} className="bg-transparent" onClose={handleClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="First name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Last name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                username
              </label>
              <input
                type="username"
                value={username}
                onChange={(e) => userName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter your username"
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${
                  passwordErrors.length > 0 && password.length > 0
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              
              {passwordErrors.length > 0 && (
                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-1">Password must contain:</p>
                  <ul className="text-xs text-red-700 list-disc list-inside">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className={password.includes(error.toLowerCase()) ? "text-green-600" : ""}>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
              
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 6 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (!@#$%^&*, etc.)</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              disabled={isLoading || passwordErrors.length > 0 || (confirmPassword && password !== confirmPassword)}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}