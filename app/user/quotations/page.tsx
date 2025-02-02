"use client";
import React, { useState } from "react";
import { QUOTATION } from "@/constraints/index"; // Ensure this path is correct
import { useRouter } from "next/navigation";

const Quotations = () => {
  const router = useRouter();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State to store the search query

  // Filter quotations based on the search query
  const filteredQuotations = QUOTATION.filter((quotation) => {
    return (
      quotation.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.quotationNumber.includes(searchQuery)
    );
  });

  // Handle row click to navigate to the quotation detail page
  const handleRowClick = (quotationId: string) => {
    // Navigate to the quotation detail page
    router.push(`/user/quotations/${quotationId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
        <div>
          <button
            onClick={() => router.push("/user/quotations/new")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            Create Quotation
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Advanced Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl font-bold">Quotation Details</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Client or Quotation Number"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update the search query state
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Advanced Search
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isAdvancedSearchOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Filter by Date
                  </button>
                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Filter by Status
                  </button>
                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Filter by Amount
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display All Quotations */}
      <div className="overflow-x-auto regular-12">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-200 border-b">
              <th className="text-left p-3">Client</th>
              <th className="text-left p-3">Quotation Number</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.length > 0 ? (
              filteredQuotations.map((quotation) => (
                <tr
                  key={quotation.id}
                  onClick={() => handleRowClick(quotation.id)} // Call the function on row click
                  className="border-b hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <td className="p-3">{quotation.client}</td>
                  <td className="p-3">{quotation.quotationNumber}</td>
                  <td className="p-3">
                    {quotation.quotationDate || "Not available"}
                  </td>
                  <td className="p-3">Rs. {quotation.grandTotal}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No quotations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Quotations;
