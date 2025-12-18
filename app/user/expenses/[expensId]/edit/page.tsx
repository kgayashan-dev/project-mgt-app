"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Printer, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface TaxItem {
  name: string;
  rate: number;
  amount: number;
}

interface Expense {
  id: string;
  category: string;
  merchant: string;
  description: string;
  date: string;
  grandTotal: number;
  taxes: TaxItem[];
  receiptUrl?: string;
}

interface ExpenseEditPageProps {
  params: {
    id: string;
  };
}

const ExpenseEditPage = ({ params }: ExpenseEditPageProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [category, setCategory] = useState<string>("");
  const [merchant, setMerchant] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [showAddTax, setShowAddTax] = useState<boolean>(false);
  const [newTaxName, setNewTaxName] = useState<string>("");
  const [newTaxRate, setNewTaxRate] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [originalReceiptUrl, setOriginalReceiptUrl] = useState<string>("");

  // Calculate subtotal
  const subtotal = React.useMemo(() => {
    const taxRates = taxes.map((tax) => tax.rate);
    const totalTaxRate = taxRates.reduce((sum, rate) => sum + rate, 0);
    return grandTotal / (1 + totalTaxRate / 100);
  }, [grandTotal, taxes]);

  // Update tax amounts when subtotal changes
  useEffect(() => {
    const updatedTaxes = taxes.map((tax) => ({
      ...tax,
      amount: (subtotal * tax.rate) / 100,
    }));
    setTaxes(updatedTaxes);
  }, [subtotal]);

  // Fetch expense data
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/expenses/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch expense");

        const data: Expense = await response.json();
        setCategory(data.category);
        setMerchant(data.merchant);
        setDescription(data.description);
        setDate(data.date);
        setGrandTotal(data.grandTotal);
        setTaxes(data.taxes);
        if (data.receiptUrl) setOriginalReceiptUrl(data.receiptUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load expense");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [params.id]);

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Create form data for multipart submission
      const formData = new FormData();
      formData.append("category", category);
      formData.append("merchant", merchant);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("grandTotal", grandTotal.toString());
      formData.append("taxes", JSON.stringify(taxes));
      if (file) formData.append("receipt", file);

      const response = await fetch(`/api/expenses/${params.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update expense");

      router.push(`/expenses/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding new tax
  const handleAddTax = () => {
    if (newTaxName && newTaxRate) {
      const newAmount = (subtotal * newTaxRate) / 100;
      setTaxes([
        ...taxes,
        { name: newTaxName, rate: newTaxRate, amount: newAmount },
      ]);
      setNewTaxName("");
      setNewTaxRate(0);
      setShowAddTax(false);
    }
  };

  // Handle removing tax
  const handleRemoveTax = (index: number) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

  // Generate PDF
  const handleSaveAsPDF = async () => {
    const element = document.getElementById("expense-content");
    if (element) {
      const canvas = await html2canvas(element, { scale: 4 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`expense-${params.id}.pdf`);
    }
  };

  //   if (isLoading) {
  //     return (
  //       <div className="flex items-center justify-center h-screen">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div className="flex flex-col items-center justify-center h-screen">
  //         <div className="text-red-600 mb-4">{error}</div>
  //         <Link href="/expenses" className="text-blue-500 hover:underline">
  //           Return to Expenses
  //         </Link>
  //       </div>
  //     );
  //   }

  return (
    <div className="flex flex-col m-8">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/expenses"
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Edit Expense</h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveAsPDF}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Save as PDF"
            >
              <Printer className="h-5 w-5" />
            </button>
            <Link
              href="/user/expenses"
              className="px-4 py-2 text-gray-600 rounded hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-blue-300"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div
          id="expense-content"
          className="max-w-2xl bg-white rounded-lg shadow p-4"
        >
          {/* Main form content */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Merchant"
                className="w-full p-2 text-lg border-b border-gray-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Receipt Upload Area */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer"
            >
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="New receipt"
                  className="max-w-full max-h-32 object-contain"
                />
              ) : originalReceiptUrl ? (
                <img
                  src={originalReceiptUrl}
                  alt="Current receipt"
                  className="max-w-full max-h-32 object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>Drag receipt image here</p>
                  <p>
                    or <span className="text-blue-500">select a file</span>
                  </p>
                </div>
              )}
              <input {...getInputProps()} />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-3 bg-gray-10 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
          </div>

          {/* Taxes and Totals */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>

            {taxes.map((tax, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-gray-600 py-2 border-b border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {tax.name} - {tax.rate}%
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">
                    Rs.{tax.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTax(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {showAddTax ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Tax name"
                  value={newTaxName}
                  onChange={(e) => setNewTaxName(e.target.value)}
                  className="p-1 border rounded"
                />
                <input
                  type="number"
                  placeholder="Rate %"
                  value={newTaxRate}
                  onChange={(e) => setNewTaxRate(Number(e.target.value))}
                  className="p-1 border rounded w-20"
                />
                <button
                  type="button"
                  onClick={handleAddTax}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTax(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Tax
              </button>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="font-medium">Grand Total (LKR):</span>
              <input
                type="number"
                value={grandTotal}
                onChange={(e) => setGrandTotal(Number(e.target.value))}
                className="text-lg font-medium text-right w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseEditPage;
