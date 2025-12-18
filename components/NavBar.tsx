"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiPulseAiLine } from "react-icons/ri";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <RiPulseAiLine className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                ProjectPulse
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link
              href="/"
              className={`inline-flex items-center px-3 py-2 text-xs font-medium transition-all duration-200 ease-in-out
                ${
                  pathname === "/"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-400"
                }`}
            >
              <span>Home</span>
            </Link>

            <Link
              href="/user/dashboard"
              className={`inline-flex items-center px-3 py-2 text-xs font-medium transition-all duration-200 ease-in-out
                ${
                  pathname === "/user/dashboard"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-400"
                }`}
            >
              <span>Dashboard</span>
            </Link>
            <Link
              href="/login"
              className={`inline-flex items-center px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 ease-in-out
                ${
                  pathname === "/login"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                }`}
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};
export default NavBar;
