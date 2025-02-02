"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      console.log("Login attempt:", { email, password });
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  const handleClose = () => {
    // dialogRef.current?.close();
    router.back();
  };

  return (
    <dialog ref={dialogRef} className="bg-transparent" onClose={handleClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>

            <div className="text-sm text-center">
              <a href="#" className="text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}
