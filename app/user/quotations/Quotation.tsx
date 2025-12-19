"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Filter, Plus, Download, 
  Eye, Edit, Copy, FileText,
  DollarSign, User,
 CheckCircle, Clock, XCircle
} from "lucide-react";

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
}

interface QuotationsProps {
  quotationData: Quotation[];
}

const Quotations = ({ quotationData }: QuotationsProps) => {
  const router = useRouter();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>(quotationData || []);
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
      quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.clientId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || true; // Add date filtering logic
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle row click to navigate to the quotation detail page
  const handleRowClick = (quotationId: string) => {
    router.push(`/user/quotations/${quotationId}`);
  };

  // Handle quotation selection
  const handleSelectQuotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQuotations(prev => 
      prev.includes(id) 
        ? prev.filter(quoteId => quoteId !== id)
        : [...prev, id]
    );
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Accepted": return "bg-green-100 text-green-800";
      case "Sent": return "bg-blue-100 text-blue-800";
      case "Draft": return "bg-gray-100 text-gray-800";
      case "Expired": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "Accepted": return <CheckCircle className="w-3 h-3" />;
      case "Sent": return <FileText className="w-3 h-3" />;
      case "Draft": return <FileText className="w-3 h-3" />;
      case "Expired": return <Clock className="w-3 h-3" />;
      case "Cancelled": return <XCircle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  // Calculate statistics
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce((sum, quote) => sum + quote.grandTotal, 0);
  const averageAmount = totalQuotations > 0 ? totalAmount / totalQuotations : 0;
  // const draftCount = quotations.filter(q => q.status === "Draft").length;
  // const sentCount = quotations.filter(q => q.status === "Sent").length;
  const acceptedCount = quotations.filter(q => q.status === "Accepted").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600 mt-2">Manage and track your quotations</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quotations</p>
                <p className="text-3xl font-bold text-gray-900">{totalQuotations}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(averageAmount)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-gray-900">{acceptedCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by client, quotation number, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <button
                onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                More Filters
              </button>
            </div>
          </div>

          {/* Advanced Search Panel */}
          {isAdvancedSearchOpen && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsAdvancedSearchOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsAdvancedSearchOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedQuotations.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {selectedQuotations.length} quotation(s) selected
                </p>
                <p className="text-sm text-blue-700">
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
                  <p className="text-lg font-medium">No quotations found</p>
                  <p className="text-sm">Try adjusting your search or create a new quotation</p>
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
                            {quotation.clientName || quotation.clientId || "No Client"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {quotation.emailAddress || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quotation Details */}
                    <div className="col-span-2">
                      <div className="font-mono text-sm font-medium text-gray-900">
                        {quotation.quotationNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {quotation.qItems.length} items
                      </div>
                    </div>

                    {/* Date & Status */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">
                        {formatDate(quotation.quotationDate)}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
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
                      {quotation.discountAmount > 0 && (
                        <div className="text-xs text-gray-500">
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
                            router.push(`/user/quotations/${quotation.id}/edit`);
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
        </div>

        {/* Footer Stats */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredQuotations.length} of {quotations.length} quotations
          </div>
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
              Previous
            </button>
            <span>Page 1 of 1</span>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotations;