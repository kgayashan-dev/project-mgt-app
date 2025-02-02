"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import html2pdf from "html2pdf.js";
import Link from "next/link";
import { Trash2 } from "lucide-react";

interface TaxItem {
  name: string;
  rate: number;
  amount: number;
}

const NewExpensePage = () => {
  // generate expense ID
  const generateExpenseId = () => {
    const randomNum = Math.floor(Math.random() * 100); // Random number between 0-999
    return `EXP-${Date.now()}-${randomNum}`; // Generates an ID like "EXP-1674825600000-123"
  };

  // Basic form state
  const [expenseId, setExpenseId] = useState<string>(generateExpenseId());
  const [category, setCategory] = useState<string>("");
  const [merchant, setMerchant] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("2025-01-08");

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
    if (newTaxName && newTaxRate > 0 && newTaxRate <= 100) {
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
      setNewTaxRate(0);
      setShowAddTax(false);
    }
  };

  // Handle removing tax
  const handleRemoveTax = (index: number) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

  // PDF generation
  const clickPdf = () => {
    const element = document.getElementById("expense-content");
    if (!element) return;

    const opt = {
      margin: 0.25,
      filename: `${expenseId}_${date}_expenses.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => console.log("PDF generated successfully!"))
      .catch((error) => console.error("Error generating PDF:", error));
  };

  const handleAddExpense = () => {
    const newExpense = {
      id: expenseId,
      category,
      merchant,
      description,
      date,
      grandTotal,
      taxes,
    };

    // Logic to save the new expense...
    console.log(newExpense);

    // Reset the expense ID for the next entry
    setExpenseId(generateExpenseId());
  };

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-900">New Expense</h1>
        <div className="flex gap-3">
          <Link
            href="/user/expenses"
            className="px-4 py-2 text-gray-600 rounded hover:bg-gray-100"
          >
            Cancel
          </Link>
          <button
            onClick={handleAddExpense}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={clickPdf}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Convert to PDF
          </button>
        </div>
      </div>

      <div
        id="expense-content"
        className="max-w-2xl h-[90vh] bg-white rounded-lg shadow p-6 regular-14"
      >
        {/* Form content remains the same */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">category</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Add category"
                className="w-full p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border-b border-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Add merchant"
              className="w-full p-2 text-xl border-b border-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer"
          >
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Receipt"
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
        <div className="mt-6 regular-12">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description (optional)"
            className="w-full p-3 bg-blue-50 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              {/* Tax Name and Rate */}
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {tax.name} - {tax.rate}%
                </span>
              </div>

              {/* Amount and Remove Button */}
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">
                  Rs.{tax.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveTax(index)}
                  className="text-gray-400 hover:text-red-500 text-sm flex items-center"
                  aria-label={`Remove tax ${tax.name}`}
                >
                  <Trash2 className="h-4 w-4" />{" "}
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
                onClick={handleAddTax}
                className="text-blue-500 hover:text-blue-700"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTax(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              Add Taxes
            </button>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="font-medium">Grand Total (LKR):</span>
            {isEditing ? (
              <input
                type="number"
                value={grandTotal}
                onChange={(e) => setGrandTotal(Number(e.target.value))}
                onBlur={() => setIsEditing(false)} // Stops editing when input loses focus
                className="text-2xl font-medium text-right w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span
                onClick={() => setIsEditing(true)} // Start editing when clicked
                className="text-2xl font-medium text-right cursor-pointer"
              >
                {grandTotal.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExpensePage;
