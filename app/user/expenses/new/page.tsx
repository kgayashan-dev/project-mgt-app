/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
// import html2pdf from "html2pdf.js";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

interface TaxItem {
  name: string;
  rate: number;
  amount: number;
}

interface Category {
  categoryId: string;
  catDescription: string;
  active: boolean;
}

const NewExpensePage = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // generate expense ID
  const generateExpenseId = () => {
    const randomNum = Math.floor(Math.random() * 100);
    return `EXP-${Date.now()}-${randomNum}`;
  };

  // Basic form state
  const [expenseId, setExpenseId] = useState<string>(generateExpenseId());
  const [category, setCategory] = useState<string>("");
  const [merchant, setMerchant] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Total and tax handling
  const [grandTotal, setGrandTotal] = useState<number>(400);
  const [taxes, setTaxes] = useState<TaxItem[]>([
    { name: "Tax_1", rate: 2, amount: 0 },
  ]);

  const [showAddTax, setShowAddTax] = useState<boolean>(false);
  const [newTaxName, setNewTaxName] = useState<string>("");
  const [newTaxRate, setNewTaxRate] = useState<number | string>("");

  // State to control whether we're editing the grand total
  const [isEditing, setIsEditing] = useState(false);

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch active categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/project_pulse/Category/getActiveCategories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Calculate subtotal based on grand total and taxes
  const calculateSubtotal = (total: number, taxRates: number[]): number => {
    const totalTaxRate = taxRates.reduce((sum, rate) => sum + rate, 0);
    return total / (1 + totalTaxRate / 100);
  };

  // Calculate current subtotal
  const subtotal = React.useMemo(() => {
    const taxRates = taxes.map((tax) => tax.rate);
    return calculateSubtotal(grandTotal, taxRates);
  }, [grandTotal, taxes]);

  // Update tax amounts whenever subtotal changes
  useEffect(() => {
    const updatedTaxes = taxes.map((tax) => ({
      ...tax,
      amount: (subtotal * tax.rate) / 100,
    }));
    setTaxes(updatedTaxes);
  }, [subtotal]);

  // File upload handling
  const [file, setFile] = useState<File | null>(null);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Handle adding new tax
  const handleAddTax = () => {
    if (newTaxName && newTaxRate as number > 0 && newTaxRate as number <= 100) {
      const newAmount = (subtotal * Number(newTaxRate)) / 100;
      setTaxes([
        ...taxes,
        {
          name: newTaxName,
          rate: Number(newTaxRate),
          amount: newAmount,
        },
      ]);
      setNewTaxName("");
      setNewTaxRate("");
      setShowAddTax(false);
    }
  };

  // Handle removing tax
  const handleRemoveTax = (index: number) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

  // PDF generation
  // const clickPdf = () => {
  //   const element = document.getElementById("expense-content");
  //   if (!element) return;

  //   const opt = {
  //     margin: 0.25,
  //     filename: `${expenseId}_${date}_expenses.pdf`,
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  //   };

  //   html2pdf()
  //     .from(element)
  //     .set(opt)
  //     .save()
  //     .then(() => "PDF generated successfully")
  //     .catch((error) => console.error("Error generating PDF:", error));
  // };

  // Handle form validation
  const validateForm = (): boolean => {
    if (!category) {
      setError('Please select a category');
      return false;
    }
    if (!merchant.trim()) {
      setError('Merchant name is required');
      return false;
    }
    if (!date) {
      setError('Date is required');
      return false;
    }
    if (grandTotal <= 0) {
      setError('Grand total must be greater than 0');
      return false;
    }
    setError(null);
    return true;
  };

  // Handle add expense
  const handleAddExpense = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Prepare tax data for API
      const taxData = taxes.map(tax => ({
        TaxName: tax.name,
        TaxAmount: tax.amount
      }));

      const expenseData = {
        Id: "", // Auto-generated by backend
        CategoryId: category,
        Merchant: merchant.toString(),
        Date: new Date(date).toISOString(),
        SubTotal: subtotal,
        GrandTotal: grandTotal,
        Taxes: taxData
      };

      const response = await fetch(`${API_BASE_URL}/project_pulse/Expense/createExpense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create expense');
      }

      setSuccessMessage(`Expense created successfully! ID: ${result.id}`);
      
      // Reset form
      setExpenseId(generateExpenseId());
      setCategory("");
      setMerchant("");
      setDescription("");
      setDate(new Date().toISOString().split('T')[0]);
      setGrandTotal(0);
      setTaxes([{ name: "Tax_1", rate: 2, amount: 0 }]);
      setFile(null);
      
      // Auto-clear success message
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      console.error('Error creating expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert categories to SearchableSelect format
  const categoryOptions = categories.map(cat => ({
    value: cat.categoryId,
    label: `${cat.categoryId} - ${cat.catDescription}`,
  }));

  // Get selected category description
  const selectedCategory = categories.find(cat => cat.categoryId === category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-10 to-white p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Expense</h1>
            <p className="text-gray-600 mt-2">Create and manage your expenses</p>
          </div>
          
          <div className="flex gap-3">
            <Link
              href="/user/expenses"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-10 transition-all duration-200 font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={handleAddExpense}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Save Expense
                </>
              )}
            </button>
            {/* <button
              onClick={clickPdf}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </button> */}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

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

        <div id="expense-content" className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Expense ID */}
              {/* <div className="bg-gray-10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expense ID</p>
                    <p className="text-2xl font-bold text-gray-900 font-mono">{expenseId}</p>
                  </div>
                  <button
                    onClick={() => setExpenseId(generateExpenseId())}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Regenerate
                  </button>
                </div>
              </div> */}

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <SearchableSelect
                      options={categoryOptions}
                      value={category}
                      onChange={setCategory}
                      placeholder={loadingCategories ? "Loading categories..." : "Select a category"}
                      disabled={loadingCategories}
                      icon={() => (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                    />
                  </div>
                </div>
                {selectedCategory && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Selected:</span> {selectedCategory.catDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Date and Merchant */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant *
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Enter merchant name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter expense description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column - Receipt and Totals */}
            <div className="space-y-6">
              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Image
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="text-center">
                      <div className="mb-4">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Receipt preview"
                          className="max-w-full h-32 object-contain mx-auto rounded"
                        />
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">
                        Drag receipt image here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        or <span className="text-blue-500">browse files</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports JPG, PNG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Tax Management</h3>
                  <button
                    onClick={() => setShowAddTax(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tax
                  </button>
                </div>

                {/* Tax List */}
                <div className="space-y-3">
                  {taxes.map((tax, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-10 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{tax.name}</p>
                        <p className="text-xs text-gray-600">{tax.rate}% rate</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">
                          Rs. {tax.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveTax(index)}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove tax"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Tax Form */}
                {showAddTax && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Tax name"
                          value={newTaxName}
                          onChange={(e) => setNewTaxName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Rate %"
                          value={newTaxRate}
                          onChange={(e) => setNewTaxRate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <button
                          onClick={handleAddTax}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          disabled={!newTaxName || !newTaxRate}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddTax(false);
                            setNewTaxName("");
                            setNewTaxRate("");
                          }}
                          className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>

                  {taxes.map((tax, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{tax.name} ({tax.rate}%)</span>
                      <span>Rs. {tax.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Grand Total (LKR)</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Rs.</span>
                          <input
                            type="number"
                            value={grandTotal}
                            onChange={(e) => setGrandTotal(Number(e.target.value))}
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                            className="text-2xl font-bold text-right w-32 bg-transparent border-b border-blue-500 focus:outline-none"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span
                          onClick={() => setIsEditing(true)}
                          className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          Rs. {grandTotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Subtotal</p>
                <p className="text-lg font-semibold text-gray-900">Rs. {subtotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Tax</p>
                <p className="text-lg font-semibold text-gray-900">
                  Rs. {taxes.reduce((sum, tax) => sum + tax.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600">Grand Total</p>
                <p className="text-lg font-semibold text-gray-900">Rs. {grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExpensePage;