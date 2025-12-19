"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

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
}

interface Category {
  categoryId: string;
  catDescription: string;
}

interface EditExpensePageProps {
  expenseId: string;
  initialExpense?: Expense;
  initialCategories?: Category[];
}

const EditExpensePage = ({
  expenseId,
  initialExpense,
  initialCategories = [],
}: EditExpensePageProps) => {
  const router = useRouter();

  const [expense, setExpense] = useState<Expense | null>(
    initialExpense || null
  );
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(!initialExpense);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state - initialize with initial data or defaults
  const [formData, setFormData] = useState({
    categoryId: initialExpense?.categoryId || "",
    merchant: initialExpense?.merchant || "",
    date: initialExpense?.date
      ? initialExpense.date.split("T")[0]
      : new Date().toISOString().split("T")[0],
    subTotal: initialExpense?.subTotal || 0,
    grandTotal: initialExpense?.grandTotal || 0,
    taxes: initialExpense?.taxes || [],
  });

  const [newTax, setNewTax] = useState({ taxName: "", taxAmount: 0 });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  // Only fetch if initial data wasn't provided
  useEffect(() => {
    if (!initialExpense && expenseId) {
      fetchData();
    }
  }, [expenseId, initialExpense]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch expense if not provided
      if (!initialExpense) {
        const expenseRes = await fetch(
          `${API_BASE_URL}/project_pulse/Expense/getExpense/${expenseId}`
        );
        if (!expenseRes.ok) throw new Error("Expense not found");
        const expenseData = await expenseRes.json();
        setExpense(expenseData);

        // Set form data
        setFormData({
          categoryId: expenseData.categoryId,
          merchant: expenseData.merchant,
          date: expenseData.date.split("T")[0],
          subTotal: expenseData.subTotal,
          grandTotal: expenseData.grandTotal,
          taxes: expenseData.taxes || [],
        });
      }

      // Fetch categories if not provided
      if (initialCategories.length === 0) {
        const categoriesRes = await fetch(
          `${API_BASE_URL}/project_pulse/Category/getActiveCategories`
        );
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const taxData = formData.taxes.map((tax) => ({
        TaxName: tax.taxName,
        TaxAmount: tax.taxAmount,
      }));

      const updateData = {
        Id: expenseId,
        CategoryId: formData.categoryId,
        Merchant: formData.merchant,
        Date: new Date(formData.date).toISOString(),
        SubTotal: formData.subTotal,
        GrandTotal: formData.grandTotal,
        Taxes: taxData,
      };

      console.log("Updating expense with data:", updateData);

      const response = await fetch(
        `${API_BASE_URL}/project_pulse/Expense/updateExpense/${expenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || "Failed to update expense");

      setSuccessMessage("Expense updated successfully!");
      setTimeout(() => {
        router.push(`/user/expenses/${expenseId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTax = () => {
    if (newTax.taxName && newTax.taxAmount > 0) {
      setFormData((prev) => ({
        ...prev,
        taxes: [
          ...prev.taxes,
          {
            id: Date.now(),
            expenseId: expenseId,
            taxName: newTax.taxName,
            taxAmount: newTax.taxAmount,
          },
        ],
      }));
      setNewTax({ taxName: "", taxAmount: 0 });
    }
  };

  const handleRemoveTax = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      taxes: prev.taxes.filter((_, i) => i !== index),
    }));
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.categoryId,
    label: `${cat.categoryId} - ${cat.catDescription}`,
  }));

  // Loading state (only if we don't have initial data)
  //   if (loading && !initialExpense) {
  //     return (
  //       <div className="min-h-screen bg-gray-100 p-6">
  //         <div className="max-w-4xl mx-auto">
  //           <div className="animate-pulse">
  //             <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
  //             <div className="h-64 bg-gray-200 rounded"></div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  // Error state if no expense found
  if (!expense && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Expense Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested expense does not exist.
          </p>
          <Link
            href="/user/expenses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/user/expenses/${expenseId}`}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Edit Expense</h1>
              <p className="text-gray-600">ID: {expenseId}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/user/expenses/${expenseId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-white">
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Category *
              </label>
              <SearchableSelect
                options={categoryOptions}
                value={formData.categoryId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
                placeholder="Select category"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Merchant *
              </label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, merchant: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Grand Total *
              </label>
              <input
                type="number"
                value={formData.grandTotal}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    grandTotal: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Taxes */}
          <div className="border-t pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Taxes</h3>

            {/* Existing Taxes */}
            {formData.taxes.length > 0 && (
              <div className="space-y-3 mb-6">
                {formData.taxes.map((tax, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-100 rounded"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tax.taxName}
                        onChange={(e) => {
                          const newTaxes = [...formData.taxes];
                          newTaxes[index].taxName = e.target.value;
                          setFormData((prev) => ({ ...prev, taxes: newTaxes }));
                        }}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={tax.taxAmount}
                        onChange={(e) => {
                          const newTaxes = [...formData.taxes];
                          newTaxes[index].taxAmount = parseFloat(
                            e.target.value
                          );
                          setFormData((prev) => ({ ...prev, taxes: newTaxes }));
                        }}
                        className="w-32 px-3 py-1 border border-gray-300 rounded"
                        min="0"
                        step="0.01"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTax(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Tax */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-xs font-medium text-blue-900 mb-3">
                Add New Tax
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tax name"
                  value={newTax.taxName}
                  onChange={(e) =>
                    setNewTax((prev) => ({ ...prev, taxName: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newTax.taxAmount}
                    onChange={(e) =>
                      setNewTax((prev) => ({
                        ...prev,
                        taxAmount: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <button
                    type="button"
                    onClick={handleAddTax}
                    disabled={!newTax.taxName || newTax.taxAmount <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpensePage;
