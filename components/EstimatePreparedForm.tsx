"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";

type Row = {
  description: string;
  rate: number;
  tax: number;
  qty: number;
  total: number;
  taxAmount: number;
};

const EstimateForm = () => {
  // File upload state
  const [file, setFile] = useState<File | null>(null);

  // Client form state
  const [client, setClient] = useState("");
  const [estimateDate, setEstimateDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [estimateNumber, setEstimateNumber] = useState("0000001");
  const [reference, setReference] = useState("");

  // Table state
  const [rows, setRows] = useState<Row[]>([
    { description: "", rate: 0, tax: 0, qty: 0, total: 0, taxAmount: 0 },
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  // set the state to p
  const [isInvoiceNumberEditing, setIsInvoiceNumberEditing] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState(""); // clients description
  const [isAdditionalInfoEditing, setIsAdditionalInfoEditing] = useState(true);

  // table fields values convert to the tds
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(true);
  const [isRateEditing, setIsRateEditing] = useState(true);
  const [isUnitEditing, setIsUnitEditing] = useState(true);
  const [isQtyEditing, setIsQtyEditing] = useState(true);
  const [isDiscountEditing, setIsDiscountEditing] = useState(true);
  const [isTaxEditing, setIsTaxEditing] = useState(true);
  const [isReferenceEditing, setIsReferenceEditing] = useState(true);
  // File upload handling
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Calculate totals
  useEffect(() => {
    let calculatedSubtotal = 0;
    let calculatedTax = 0;

    rows.forEach((row) => {
      calculatedSubtotal += row.total;
      calculatedTax += row.taxAmount;
    });

    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);
    setGrandTotal(calculatedSubtotal + calculatedTax);
  }, [rows]);

  // Table row handling
  const handleInputChange = <K extends keyof Row>(
    index: number,
    field: K,
    value: Row[K]
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "rate" || field === "qty" || field === "tax") {
      const { rate, qty, tax } = updatedRows[index];
      const total = rate * qty;
      updatedRows[index].total = total;
      updatedRows[index].taxAmount = (total * tax) / 100;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { description: "", rate: 0, tax: 0, qty: 0, total: 0, taxAmount: 0 },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-900">New Estimate</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            Cancel
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Send To...
          </button>
        </div>
      </div>

      {/* File Upload and Company Info */}
      <div className="flex justify-between mb-8">
        <div
          {...getRootProps()}
          className="w- border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {!file && (
            <p className="text-center text-gray-500">
              {isDragActive
                ? "Drop the file here..."
                : "Drag & drop an image here, or click to select one"}
            </p>
          )}
          {file && (
            <div className="text-center">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-24 h-24 object-cover mx-auto rounded"
              />
              <p className="text-xs mt-2 text-gray-600">{file.name}</p>
            </div>
          )}
        </div>

        <div className="text-right">
          <h2 className="font-medium">Gayashan&apos;s Company</h2>
          <p className="text-gray-600">0705889612</p>
          <p className="text-gray-600">United States</p>
          <button className="text-blue-600 hover:underline text-xs">
            Edit Business Information
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-gray-600 mb-2">Prepared For</label>
          <select
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Client</option>
            <option value="Client A">Client A</option>
            <option value="Client B">Client B</option>
          </select>
          <button className="text-blue-600 hover:underline text-xs mt-2">
            + Create a Client
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 mb-2">Estimate Date</label>
            <input
              type="date"
              value={estimateDate}
              onChange={(e) => setEstimateDate(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Estimate Number</label>
            <input
              type="text"
              value={estimateNumber}
              onChange={(e) => setEstimateNumber(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="mb-8">
        <label className="block text-gray-600 mb-2">Reference</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter value (e.g. PO #)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Line Items */}
      <div className="mb-8">
      <table className="w-full  text-[12px] mb- border border-gray-300 border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2">Rate</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Tax (%)</th>
              <th className="text-right p-2">Total</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) =>
                      handleInputChange(index, "description", e.target.value)
                    }
                    className="w-full p-2 border-0 focus:ring-0"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={row.rate}
                    onChange={(e) =>
                      handleInputChange(index, "rate", Number(e.target.value))
                    }
                    className="w-full p-2 text-right border-0 focus:ring-0"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      handleInputChange(index, "qty", Number(e.target.value))
                    }
                    className="w-full p-2 text-right border-0 focus:ring-0"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={row.tax}
                    onChange={(e) =>
                      handleInputChange(index, "tax", Number(e.target.value))
                    }
                    className="w-full p-2 text-right border-0 focus:ring-0"
                  />
                </td>
                <td className="p-2 text-right">${row.total.toFixed(2)}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteRow(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addRow}
          className="w-full py-3 border-2 border-dashed text-blue-600 hover:bg-blue-50 rounded"
        >
          + Add a Line
        </button>
      </div>

      {/* Totals */}
      <div className="flex justify-between items-center py-2">
        <div className="flex justify-between items-center">
          <div>
            Tax
            {isTaxEditing ? (
              <input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                onBlur={() => setIsTaxEditing(false)}
                className={`rounded focus:ring-2 ml-2 focus:ring-blue-500 ${
                  taxPercentage ? "border-none" : "border-none"
                }`}
                min="0"
                max="100"
              />
            ) : (
              <span
                onClick={() => setIsTaxEditing(true)}
                className="cursor-pointer  ml-2"
              >
                {taxPercentage || 0}%
              </span>
            )}
          </div>
        </div>
        <span className="text-red-500">+Rs. {totalTax.toFixed(2)}</span>
      </div>

      {/* Notes & Terms */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-2">
            {notes ? "Notes" : ""}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes (optional)"
            className={`w-full  regular-14 p-2 rounded focus:ring-2 focus:ring-blue-500 ${
              notes ? "border-none" : "border-[0.5px]"
            }`}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-2">
            {terms ? "Terms" : ""}
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Enter terms or conditions (optional)"
            className={`w-full  regular-14 p-2 rounded focus:ring-2 focus:ring-blue-500 ${
              terms ? "border-none" : "border-[0.5px]"
            }`}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;
