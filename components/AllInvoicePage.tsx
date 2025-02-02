"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";

// Define types for invoice status and structure
type InvoiceStatus = "Paid" | "Partial" | "Overdue" | "Pending";

interface Invoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  description?: string;
  invoiceDate: string;
  invoiceDueDate?: string;
  client: string;
  amount: number;
  invoiceStatus: string;
  grandTotal: number;
  status: InvoiceStatus;
}

interface AllInvoiceDataProps {
  invoiceArray: Invoice[]; // Accept invoiceArray as a prop
}

const AllInvoiceData = ({ invoiceArray }: AllInvoiceDataProps) => {
  const router = useRouter();

  // Redirect to the new invoice page
  const reDirect = () => {
    router.push("/user/invoices/new");
  };

  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set()
  );

  // Toggle invoice selection
  const toggleInvoice = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  // Get status color for styling based on invoice status
  const getStatusColor = (invoiceStatus: InvoiceStatus) => {
    switch (invoiceStatus) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const calculateGrandTotal = () => {
    return invoiceArray.reduce(
      (total, invoice) => total + invoice.grandTotal,
      0
    );
  };

  const grandTotal = calculateGrandTotal();

  const handleRowClick = (invoiceId: string) => {
    // Navigate to the quotation detail page
    router.push(`/user/invoices/${invoiceId}`);
  };

  const [searchQuery, setSearchQuery] = useState("");

  // Filter invoices based on search query
  const filteredInvoices = invoiceArray.filter((invoice) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(lowerCaseQuery) ||
      invoice.invoiceStatus.toLowerCase().includes(lowerCaseQuery) ||
      invoice.grandTotal.toString().includes(lowerCaseQuery)
    );
  });
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <div></div>
        <div className="mt-6">
          <button
            onClick={reDirect}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex justify-between max-w-7xl mx-auto p-8 font-bold">
        <div>
          <h1 className="text-3xl"> Rs. 0</h1>
          <span className="text-sm font-thin">overdue</span>
        </div>
        <div>
          <h1 className="text-3xl"> Rs. 30</h1>
          <span className="text-sm font-thin">total outstanding</span>
        </div>
        <div>
          <h1 className="text-3xl"> Rs. 80,000</h1>
          <span className="text-sm font-thin">indraft</span>
        </div>
      </div>

      {/* Invoice List Section */}
      <div className="space-y-4">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                All Invoices
              </h1>
              <button
                onClick={() => router.push("/user/invoices/new")}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search(INV001, 7800, Partial...)"
                  className="pl-10 pr-4 text-sm py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-20">
                <span className="text-gray-700">Advanced Search</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button> */}
            </div>
          </div>

          {/* Table to list invoices */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-10">
                    <th className="w-12 py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Client / Invoice Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1">
                        Issued Date
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      Amount / Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      onClick={() => handleRowClick(invoice.id)}
                      key={invoice.id}
                      className="hover:bg-gray-20 cursor-pointer"
                    >
                      <td className="py- px-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.has(invoice.id)}
                          onChange={() => toggleInvoice(invoice.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-1">
                        <div className="regular-12 font-medium text-gray-900">
                          {invoice.clientName}
                        </div>
                        <div className="regular-12 text-gray-500">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-4 py- regular-12 text-gray-500">
                        {invoice.description}
                      </td>
                      <td className="px-4 py-">
                        <div className="regular-12 text-gray-900">
                          {invoice.invoiceDate}
                        </div>
                        {invoice.invoiceDueDate && (
                          <div className="regular-12 text-gray-500">
                            {invoice.invoiceDueDate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-  text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Rs.{" "}
                          {invoice.grandTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(
                            invoice.invoiceStatus
                          )}`}
                        >
                          {invoice.invoiceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end  px-4 py-2 bg-gray-100 border-t rounded-b-md border-gray-200">
                <div className="text-sm text-gray-700">
                  Grand Total:{" "}
                  <span className="font-medium">
                    Rs.{" "}
                    {grandTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllInvoiceData;
