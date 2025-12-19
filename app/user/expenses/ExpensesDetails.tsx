/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Paperclip, Settings2, Printer, Search, Filter, MoreVertical, Eye, Edit, Trash2, ExternalLink, Download, FileText } from "lucide-react";
import Link from "next/link";

interface ExpenseTax {
  id: number;
  expenseId: string;
  taxName: string;
  taxAmount: number;
}

interface Expense {
  id: string;
  categoryId: string;
  merchant: string;
  date: string;
  subTotal: number;
  grandTotal: number;
  taxes: ExpenseTax[];
  categoryName?: string;
  submittedBy?: string;
}

const ExpensesDetails = () => {
  const router = useRouter();
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/project_pulse/Expense/getAllExpenses`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === "" || 
      expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.categoryName && expense.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = !selectedDate || expense.date.split('T')[0] === selectedDate;
    
    const matchesCategory = categoryFilter === "all" || expense.categoryId === categoryFilter;
    
    return matchesSearch && matchesDate && matchesCategory;
  });

  const handleNewExpense = () => {
    router.push("/user/expenses/new");
  };


  const handleEditExpense = (id: string) => {
    router.push(`/user/expenses/${id}`);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(`Are you sure you want to delete expense ${id}?`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/project_pulse/Expense/deleteExpense/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete expense');
      
      // Refresh the list
      fetchExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  const exportToPDF = (expense: Expense) => {
    // Implementation for PDF export
    alert(`Exporting ${expense.id} to PDF`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const ExpenseListItem = ({ expense }: { expense: Expense }) => {
    const isExpanded = selectedExpense === expense.id;
    const totalTax = expense.taxes.reduce((sum, tax) => sum + tax.taxAmount, 0);

    return (
      <div className="border-b border-gray-200 hover:bg-gray-10 transition-colors">
        {isExpanded ? (
          <div className="p-6 bg-blue-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
                <p className="text-sm text-gray-600">ID: {expense.id}</p>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={expense.merchant}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={expense.categoryName || expense.categoryId}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={expense.date.split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={expense.subTotal}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Tax
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={totalTax}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grand Total
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={expense.grandTotal}
                  />
                </div>
              </div>
            </div>

            {/* Taxes List */}
            {expense.taxes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Taxes</h4>
                <div className="space-y-2">
                  {expense.taxes.map((tax, index) => (
                    <div key={tax.id || index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{tax.taxName}</span>
                      <span className="font-medium">{formatCurrency(tax.taxAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => exportToPDF(expense)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach Receipt
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditExpense(expense.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-between p-4 hover:bg-gray-10 cursor-pointer group"
            onClick={() => setSelectedExpense(expense.id)}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                    {expense.merchant || "No Merchant"}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-mono">{expense.id}</span>
                    {expense.categoryName && (
                      <>
                        <span>•</span>
                        <span>{expense.categoryName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 flex-1">
              <div className="text-gray-600">{formatDate(expense.date)}</div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatCurrency(expense.grandTotal)}
                </div>
                {totalTax > 0 && (
                  <div className="text-xs text-gray-500">
                    Tax: {formatCurrency(totalTax)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Link
                href={`/user/expenses/${expense.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <Link
                href={`/user/expenses/${expense.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExpense(expense.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

 
  return (
    <div className="min-h-screen bg-gray-10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-2">Manage and track your expenses</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchExpenses}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleNewExpense}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Expense
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900">{expenses.length}</p>
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
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(expenses.reduce((sum, exp) => sum + exp.grandTotal, 0))}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Expense</p>
                <p className="text-3xl font-bold text-gray-900">
                  {expenses.length > 0 
                    ? formatCurrency(expenses.reduce((sum, exp) => sum + exp.grandTotal, 0) / expenses.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
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
                  placeholder="Search expenses by ID, merchant, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(expenses.map(exp => exp.categoryId))).map(catId => (
                  <option key={catId} value={catId}>{catId}</option>
                ))}
              </select>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-10 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-10 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense Details
                </span>
              </div>
              <div className="col-span-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </span>
              </div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* Expenses List */}
          {filteredExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No expenses found</p>
                <p className="text-sm">Try adjusting your search or create a new expense</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <ExpenseListItem key={expense.id} expense={expense} />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </div>
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-10">
              Previous
            </button>
            <span>Page 1 of 1</span>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-10">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesDetails;