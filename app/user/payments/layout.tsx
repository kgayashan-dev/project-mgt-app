"use client";
import React from "react";

import PaymentNavBar from "@/components/PaymentNavBar";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-navy-900">Payments</h1>
        <div className="flex items-center gap-4 relative"></div>
      </div>

      <PaymentNavBar />

      {/* Main Content */}
      <main className="bg-gray-100">{children}</main>
    </div>
  );
}
