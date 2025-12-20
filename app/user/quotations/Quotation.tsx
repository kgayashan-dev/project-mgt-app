"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Copy,
  FileText,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  AlertCircle,
  XCircle as XCircleIcon,
} from "lucide-react";
import CommonSearchPopup from "@/components/CommonSearchPopup";

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
  clientId: string;
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
  status?: "Draft" | "Sent" | "Accepted" | "Expired" | "Cancelled";
  companyName?: string;
  dueDate?: string;
}

interface QuotationsProps {
  quotationData: Quotation[];
}

const Quotations = ({ quotationData }: QuotationsProps) => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState<'quotation' | 'invoice'>('quotation');
  const [searchQuery, setSearchQuery] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>(
    quotationData || []
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);

  // Update local state when prop changes
  useEffect(() => {
    setQuotations(quotationData || []);
  }, [quotationData]);

  // Filter quotations based on search query and filters
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.quotationNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      quotation.clientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quotation.companyName && 
        quotation.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || quotation.status === statusFilter;

    const matchesDate = dateFilter === "all" || true;

    return matchesSearch && matchesStatus && matchesDate;
  });

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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle row click to navigate to the quotation detail page
  const handleRowClick = (quotationId: string) => {
    router.push(`/user/quotations/${quotationId}`);
  };

  // Handle quotation selection
  const handleSelectQuotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQuotations((prev) =>
      prev.includes(id)
        ? prev.filter((quoteId) => quoteId !== id)
        : [...prev, id]
    );
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Sent":
        return "bg-blue-100 text-blue-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Expired":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-3 h-3" />;
      case "Sent":
        return <Send className="w-3 h-3" />;
      case "Draft":
        return <FileText className="w-3 h-3" />;
      case "Expired":
        return <Clock className="w-3 h-3" />;
      case "Cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  // Calculate statistics
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce(
    (sum, quote) => sum + quote.grandTotal,
    0
  );
  const averageAmount = totalQuotations > 0 ? totalAmount / totalQuotations : 0;
  const acceptedCount = quotations.filter(
    (q) => q.status === "Accepted"
  ).length;
  const draftCount = quotations.filter((q) => q.status === "Draft").length;
  const sentCount = quotations.filter((q) => q.status === "Sent").length;
  const expiredCount = quotations.filter((q) => q.status === "Expired").length;

  // Calculate total accepted amount
  const acceptedAmount = quotations
    .filter((q) => q.status === "Accepted")
    .reduce((sum, quote) => sum + quote.grandTotal, 0);

  // Calculate total draft amount
  const draftAmount = quotations
    .filter((q) => q.status === "Draft")
    .reduce((sum, quote) => sum + quote.grandTotal, 0);

  // Calculate total sent amount
  const sentAmount = quotations
    .filter((q) => q.status === "Sent")
    .reduce((sum, quote) => sum + quote.grandTotal, 0);

  // Calculate total filtered amount
  const filteredTotal = filteredQuotations.reduce(
    (sum, quote) => sum + quote.grandTotal,
    0
  );

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
              <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  setSearchType("quotation");
                  setIsSearchOpen(true);
                }}
              >
                <Search size={20} />
                {/* <span className="hidden sm:inline">Search Quotations</span> */}
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Manage and track your quotations
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/user/quotations/new")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Quotation
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Quotations</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalQuotations}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
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
                  {formatCurrency(averageAmount)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                {/* <DollarSign className="w-6 h-6 text-purple-600" /> */}
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Accepted</p>
                <p className="text-xl font-bold text-gray-900">
                  {acceptedCount}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">Draft</p>
                <p className="text-xl font-bold text-gray-600">
                  {draftCount} ({formatCurrency(draftAmount)})
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">Sent</p>
                <p className="text-xl font-bold text-blue-600">
                  {sentCount} ({formatCurrency(sentAmount)})
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Send className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">Accepted</p>
                <p className="text-xl font-bold text-green-600">
                  {acceptedCount} ({formatCurrency(acceptedAmount)})
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">Expired</p>
                <p className="text-xl font-bold text-yellow-600">
                  {expiredCount}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
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
                  placeholder="Search by client, quotation number, company, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQuotations.length > 0 && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {selectedQuotations.length} quotation(s) selected
                </p>
                <p className="text-xs text-blue-700">
                  Apply actions to selected items
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send
              </button>
              <button
                onClick={() => setSelectedQuotations([])}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Quotations Table */}
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
                  Quotation
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Status
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
            {filteredQuotations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No quotations found</p>
                  <p className="text-xs">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first quotation to get started"}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredQuotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className="group hover:bg-gray-100 transition-colors"
                >
                  <div
                    onClick={() => handleRowClick(quotation.id)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer"
                  >
                    {/* Select Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedQuotations.includes(quotation.id)}
                        onClick={(e) => handleSelectQuotation(quotation.id, e)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Client Details */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600">
                            {quotation.clientName ||
                              quotation.clientId ||
                              "No Client"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {quotation.emailAddress || "No email"}
                            {quotation.companyName && (
                              <span className="block mt-1">
                                {quotation.companyName}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quotation Details */}
                    <div className="col-span-2">
                      <div className="font-mono text-xs font-medium text-gray-900">
                        {quotation.quotationNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {quotation.qItems.length} items
                      </div>
                      {quotation.notes && (
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {quotation.notes}
                        </div>
                      )}
                    </div>

                    {/* Date & Status */}
                    <div className="col-span-2">
                      <div className="text-xs text-gray-900">
                        {formatDate(quotation.quotationDate)}
                      </div>
                      {quotation.dueDate && (
                        <div className="text-xs text-gray-500">
                          Valid until: {formatDate(quotation.dueDate)}
                        </div>
                      )}
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            quotation.status
                          )}`}
                        >
                          {getStatusIcon(quotation.status)}
                          {quotation.status || "Draft"}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(quotation.grandTotal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(quotation.subtotal)} +{" "}
                        {formatCurrency(quotation.totalTax)} tax
                      </div>
                      {quotation.discountAmount > 0 && (
                        <div className="text-xs text-green-600">
                          -{formatCurrency(quotation.discountAmount)} discount
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/quotations/${quotation.id}`);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/user/quotations/${quotation.id}/edit`
                            );
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
          {filteredQuotations.length > 0 && (
            <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-700">
                  Showing {filteredQuotations.length} of {quotations.length}{" "}
                  quotations
                </div>
                <div className="text-xs font-medium text-gray-900">
                  Total: {formatCurrency(filteredTotal)}
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
          title={searchType === "quotation" ? "Search Quotations" : "Search Invoices"}
        />
      </div>
    </div>
  );
};

export default Quotations;