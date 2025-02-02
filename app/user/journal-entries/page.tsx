"use client";
import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface JournalEntry {
  name: string;
  description: string;
  date: string;
  total: number;
}

const JournalEntries = () => {
  const [showAlert, setShowAlert] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const dummyEntries: JournalEntry[] = [
    {
      name: "Office Equipment Depreciation",
      description: "Monthly depreciation entry",
      date: "2025-01-07",
      total: 1250.0,
    },
    {
      name: "Loan Payment",
      description: "Monthly loan installment",
      date: "2025-01-06",
      total: 2500.0,
    },
    {
      name: "Prepaid Insurance",
      description: "Insurance amortization",
      date: "2025-01-05",
      total: 750.0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy-900">Journal Entries</h1>
        <button className="text-blue-600 hover:text-blue-800">
          View Report
        </button>
      </div>

      {/* Alert Banner */}
      {showAlert && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 relative">
          <div className="flex items-start gap-3">
            <div className="text-amber-400">⚠️</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Heads up!</p>
              <p className="text-gray-600">
                Turn on Advanced Accounting to create Journal Entries. We
                recommend creating Journal Entries only if you have accounting
                experience or in collaboration with an accountant.{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Learn More
                </a>
              </p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-400 font-bold text-2xl">✓</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Ensure your books are up to date with Journal Entries
            </h2>
            <p className="text-gray-600 mb-2">
              Journal Entries allow you to track transactions outside of
              Invoices and Expenses—like depreciation or loans. They give you
              flexibility so you can make sure your books stay up-to-date no
              matter what business activities you&apos;re documenting.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Search and Table Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Journal Entries</h3>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Name / Description
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {dummyEntries.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-10"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-gray-500 text-sm">
                        {entry.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      Rs.{entry.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntries;
