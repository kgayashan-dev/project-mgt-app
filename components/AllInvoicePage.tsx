"use client";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";

// Define types for invoice status and structure
type InvoiceStatus = "Paid" | "Partial" | "Overdue" | "Draft";

interface Invoice {
  id: string;
  clientID: string;
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

interface AllInvoicePageProps {
  invoiceArray: Invoice[];
}

const AllInvoicePage = ({ invoiceArray }: AllInvoicePageProps) => {
  const router = useRouter();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter invoices based on search term and status filter
  const filteredInvoices = useMemo(() => {
    return invoiceArray.filter((invoice) => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.description && invoice.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoiceArray, searchTerm, statusFilter]);

  // Redirect to the new invoice page
  const reDirect = () => {
    router.push("/user/invoices/new");
  };

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

  // Calculate grand total from filtered invoices
  const calculateGrandTotal = () => {
    return filteredInvoices.reduce(
      (total, invoice) => total + invoice.grandTotal,
      0
    );
  };

  const handleRowClick = (invoiceId: string) => {
    router.push(`/user/invoices/${invoiceId}`);
  };

  const grandTotal = calculateGrandTotal();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mx-8">
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
          <h1 className="text-3xl">
            Rs.{" "}
            {invoiceArray
              .filter((inv) => inv.status === "Overdue")
              .reduce((sum, inv) => sum + inv.grandTotal, 0)
              .toLocaleString()}
          </h1>
          <span className="text-xs font-thin">overdue</span>
        </div>
        <div>
          <h1 className="text-3xl">
            Rs.{" "}
            {invoiceArray
              .filter(
                (inv) =>  inv.status === "Partial"
              )
              .reduce((sum, inv) => sum + inv.grandTotal, 0)
              .toLocaleString()}
          </h1>
          <span className="text-xs font-thin">total outstanding</span>
        </div>
        <div>
          <h1 className="text-3xl">
            Rs.{" "}
            {invoiceArray
              .filter((inv) => inv.status === "Draft")
              .reduce((sum, inv) => sum + inv.grandTotal, 0)
              .toLocaleString()}
          </h1>
          <span className="text-xs font-thin">in draft</span>
        </div>
      </div>

      {/* Invoice List Section */}
      <div className="space-y-2">
        <div className=" mx-auto p-2">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">
                All Invoices ({filteredInvoices.length})
                {searchTerm || statusFilter !== "all" ? ` of ${invoiceArray.length}` : ''}
              </h1>
              <button
                onClick={() => router.push("/user/invoices/new")}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-4">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-8 text-xs py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 text-xs py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Table to list invoices */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-12 py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices(
                              new Set(filteredInvoices.map((inv) => inv.id))
                            );
                          } else {
                            setSelectedInvoices(new Set());
                          }
                        }}
                        checked={
                          selectedInvoices.size === filteredInvoices.length &&
                          filteredInvoices.length > 0
                        }
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900">
                      Client / Invoice Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900">
                      <div className="flex items-center gap-1">
                        Issued Date
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-900">
                      Amount / Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Search className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-xs">
                            {searchTerm || statusFilter !== "all" 
                              ? "No invoices match your search criteria" 
                              : "No invoices found"}
                          </p>
                          {(searchTerm || statusFilter !== "all") && (
                            <button
                              onClick={clearFilters}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Clear filters to see all invoices
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr
                        onClick={() => handleRowClick(invoice.id)}
                        key={invoice.id}
                        className="hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <td
                          className="py-1 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedInvoices.has(invoice.id)}
                            onChange={() => toggleInvoice(invoice.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-xs font-medium text-gray-900">
                            {invoice.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            {invoice.clientID}/ {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-500">
                          {invoice.description || "No description"}
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-xs text-gray-900">
                            {invoice.invoiceDate}
                          </div>
                          {invoice.invoiceDueDate && (
                            <div className="text-xs text-gray-500">
                              Due: {invoice.invoiceDueDate}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="text-xs font-medium text-gray-900">
                            Rs.{" "}
                            {invoice.grandTotal.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.invoiceStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {filteredInvoices.length > 0 && (
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs text-gray-700">
                    {selectedInvoices.size > 0 && (
                      <span>
                        {selectedInvoices.size} invoice(s) selected
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllInvoicePage;