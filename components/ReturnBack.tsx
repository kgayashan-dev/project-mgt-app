"use client";
import { useRouter } from "next/navigation";
import React from "react";

const ReturnBack = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => router.back()}
        className="px-6 py-2 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-500 transition duration-300"
      >
        Return
      </button>
    </div>
  );
};

export default ReturnBack;
