"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface QuotationItem {
  id: number;
  description: string;
  unit: string;
  qty: number;
  rate: number;
  quotationId: string;
  total: number;
}

interface Quotation {
  id: string;
  clientId:string,
  quotationNumber: string;
  quotationDate: string;
  clientName: string;
  discountPercentage: number;
  discountAmount: number;
  emailAddress: string;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  notes: string;
  qItems: QuotationItem[];
}

interface QuotationsProps {
  quotationData: Quotation[];
}

const Quotations = ({ quotationData }: QuotationsProps) => {
  const router = useRouter();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>(quotationData || []);

  // Update local state when prop changes
  useEffect(() => {
    setQuotations(quotationData || []);
  }, [quotationData]);

  // Filter quotations based on the search query
  // const filteredQuotations = quotations.filter((quotation) => {
  //   return (
  //     quotation.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // });

  // console.log(quotationData)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle row click to navigate to the quotation detail page
  const handleRowClick = (quotationId: string) => {
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Advanced Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl font-bold">Quotation Details</h2>
        <div className="flex regular-14 flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Client or Quotation Number"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                className={`w-4 h-4 ml-2 transition-transform ${isAdvancedSearchOpen ? 'rotate-180' : ''}`}
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

      {/* Quotations Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {quotations.length} of {quotations.length} quotations
      </div>

      {/* Display All Quotations */}
      <div className="overflow-x-auto regular-12 bg-white rounded-lg shadow">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-4 font-semibold text-gray-700">Client</th>
              <th className="text-left p-4 font-semibold text-gray-700">Quotation Number</th>
              <th className="text-left p-4 font-semibold text-gray-700">Date</th>
              <th className="text-left p-4 font-semibold text-gray-700">Grand Total</th>
              <th className="text-left p-4 font-semibold text-gray-700">Q_Items</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length > 0 ? (
              quotations.map((quotation) => (
                <tr
                  key={quotation.id}
                  onClick={() => handleRowClick(quotation.id)}
                  className="border-b hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{quotation.clientId}</div>
                    
                  </td>
                  <td className="p-4 font-mono text-sm">{quotation.quotationNumber}</td>
                  <td className="p-4 text-sm">{formatDate(quotation.quotationDate)}</td>
                  <td className="p-4 font-semibold">{formatCurrency(quotation.grandTotal)}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {quotation.qItems.length} items
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    No quotations found.
                    {searchQuery && (
                      <div className="text-sm mt-1">Try adjusting your search terms</div>
                    )}
                  </div>
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