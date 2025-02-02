"use client";
import React, { useState } from "react";
import { ChevronDown, DollarSign, Clock } from "lucide-react";
import PaymentNavBar from "@/components/PaymentNavBar";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-navy-900">Payments</h1>
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              More Actions
              <ChevronDown size={20} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-4 hover:bg-gray-10 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        View payment reports
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-10 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Accept online payments
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-10 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Payment settings
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentNavBar />

      {/* Main Content */}
      <main className="bg-gray-100">{children}</main>
    </div>
  );
}
