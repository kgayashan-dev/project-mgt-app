"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  // ChevronDown,
  FileText,
  User,
  CheckCircle,
  Clock,
  XCircle,
  // DollarSign,
  // Filter,
  Download,
  Eye,
  Edit,
  Copy,
  Receipt,
} from "lucide-react";
import CommonSearchPopup from "../components/CommonSearchPopup";
import { formatCurrencyOrNA } from "@/utils/converts";

// Define types for invoice status and structure
type InvoiceStatus = "Paid" | "Partial" | "Overdue" | "Draft" | "Pending";

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
  emailAddress?: string;
  discountAmount?: number;
}

interface AllInvoicePageProps {
  invoiceArray: Invoice[];
}

const AllInvoicePage = ({ invoiceArray }: AllInvoicePageProps) => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState<"quotation" | "invoice">(
    "invoice"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Filter invoices based on search query and filters
  const filteredInvoices = useMemo(() => {
    return invoiceArray.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.description &&
          invoice.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      const matchesDate = dateFilter === "all" || true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoiceArray, searchQuery, statusFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };


  // Handle row click to navigate to invoice detail page
  const handleRowClick = (invoiceId: string) => {
    router.push(`/user/invoices/${invoiceId}`);
  };

  // Handle invoice selection
  const handleSelectInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoices((prev) =>
      prev.includes(id)
        ? prev.filter((invoiceId) => invoiceId !== id)
        : [...prev, id]
    );
  };

  // Get status badge color
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="w-3 h-3" />;
      case "Partial":
        return <Clock className="w-3 h-3" />;
      case "Pending":
        return <Clock className="w-3 h-3" />;
      case "Overdue":
        return <XCircle className="w-3 h-3" />;
      case "Draft":
        return <FileText className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  // Calculate statistics
  const totalInvoices = invoiceArray.length;
  const totalAmount = invoiceArray.reduce(
    (sum, invoice) => sum + invoice.grandTotal,
    0
  );
  const averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
  const paidCount = invoiceArray.filter((inv) => inv.status === "Paid").length;

  // Calculate overdue amount
  const overdueAmount = invoiceArray
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Calculate partial amount
  const partialAmount = invoiceArray
    .filter((inv) => inv.status === "Partial")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Calculate draft amount
  const draftAmount = invoiceArray
    .filter((inv) => inv.status === "Draft")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Calculate grand total from filtered invoices
  const calculateGrandTotal = () => {
    return filteredInvoices.reduce(
      (total, invoice) => total + invoice.grandTotal,
      0
    );
  };

  const grandTotal = calculateGrandTotal();

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-3">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex justify-normal gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                onClick={() => {
                  setSearchType("invoice");
                  setIsSearchOpen(true);
                }}
              >
                <Search size={20} />
                {/* <span className="hidden sm:inline">Search Invoices</span> */}
              </button>
            </div>
            <p className="text-gray-600 mt-2">Manage and track your invoices</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/user/invoices/new")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Invoices</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalInvoices}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Receipt className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalAmount.toString() ?  formatCurrencyOrNA(totalAmount) : "N/A"}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                {/* <DollarSign className="w-6 h-6 text-green-600" /> */}
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Average Amount</p>
                <p className="text-xl font-bold text-gray-900">
                {averageAmount.toString() ?  formatCurrencyOrNA(averageAmount) : "N/A"}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                {/* <DollarSign className="w-6 h-6 text-blue-600" /> */}
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Paid</p>
                <p className="text-xl font-bold text-gray-900">
                  {paidCount}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(overdueAmount)}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(partialAmount)}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">In Draft</p>
                <p className="text-2xl font-bold text-gray-600">
                  {formatCurrency(draftAmount)}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by client, invoice number, PO #, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {/* <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  // Add more filters functionality if needed
                }}
              >
                <Filter className="w-5 h-5" />
                More Filters
              </button> */}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedInvoices.length > 0 && (
          <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-purple-900">
                  {selectedInvoices.length} invoice(s) selected
                </p>
                <p className="text-xs text-purple-700">
                  Apply actions to selected items
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setSelectedInvoices([])}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client & Details
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates & Status
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredInvoices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No invoices found</p>
                  <p className="text-xs">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first invoice to get started"}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 text-purple-600 hover:text-purple-800 underline text-xs"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="group hover:bg-gray-100 transition-colors"
                >
                  <div
                    onClick={() => handleRowClick(invoice.id)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer"
                  >
                    {/* Select Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onClick={(e) => handleSelectInvoice(invoice.id, e)}
                        onChange={() => {}}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </div>

                    {/* Client Details */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-purple-600">
                            {invoice.client || invoice.clientID || "No Client"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invoice.emailAddress || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="col-span-2">
                      <div className="font-mono text-xs font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {invoice.description
                          ? `${invoice.description.substring(0, 30)}...`
                          : "No description"}
                      </div>
                    </div>

                    {/* Dates & Status */}
                    <div className="col-span-2">
                      <div className="text-xs text-gray-900">
                        {formatDate(invoice.invoiceDate)}
                      </div>
                      {invoice.invoiceDueDate && (
                        <div className="text-xs text-gray-500">
                          Due: {formatDate(invoice.invoiceDueDate)}
                        </div>
                      )}
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(invoice.grandTotal)}
                      </div>
                      {invoice.discountAmount && invoice.discountAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          -{formatCurrency(invoice.discountAmount)} discount
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/invoices/${invoice.id}`);
                          }}
                          className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/invoices/${invoice.id}/edit`);
                          }}
                          className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle duplicate
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer */}
          {filteredInvoices.length > 0 && (
            <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-700">
                  Showing {filteredInvoices.length} of {invoiceArray.length}{" "}
                  invoices
                </div>
                <div className="text-xs font-medium text-gray-900">
                  Total: {formatCurrency(grandTotal)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Common Search Popup */}
        <CommonSearchPopup
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchType={searchType}
          title={searchType === "invoice" ? "Search Invoices" : "Search Quotations"}
        />
      </div>
    </div>
  );
};

export default AllInvoicePage;