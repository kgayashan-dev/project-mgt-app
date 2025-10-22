"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import Link from "next/link";
import html2pdf from "html2pdf.js";
import { generateQuotationNumber } from "@/utils/qnoGeneratora";

type Row = {
  description: string;
  rate: number;
  unit: string;
  qty: number;
  total: number;
};

interface Client {
  id: string;
  name: string;
  initials: string;
  businessType: string;
  location: string;
  emailAddress?: string;
  phoneNumber?: string;
}

interface NewQuotationProps {
  initialData: Client[];
}
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NewQuotation: React.FC<NewQuotationProps> = ({ initialData }) => {
  // File upload state
  const [file, setFile] = useState<File | null>(null);

  // Client form state
  const [client, setClient] = useState<Client | null>(null);
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [reference, setReference] = useState("");

  // Table state
  const [rows, setRows] = useState<Row[]>([
    { description: "", rate: 0, unit: "", qty: 0, total: 0 },
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);

  const [quotationNumber, setQuotationNumber] = useState(
    generateQuotationNumber()
  );

  // Edit states
  const [isEditing, setIsEditing] = useState(true);
  const [isQuotationNumberEditing, setIsQuotationNumberEditing] =
    useState(true);
  const [isReferenceEditing, setIsReferenceEditing] = useState(true);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState<boolean[]>(
    new Array(rows.length).fill(true)
  );
  const [isRateEditing, setIsRateEditing] = useState<boolean[]>(
    new Array(rows.length).fill(true)
  );
  const [isUnitEditing, setIsUnitEditing] = useState<boolean[]>(
    new Array(rows.length).fill(true)
  );
  const [isQtyEditing, setIsQtyEditing] = useState<boolean[]>(
    new Array(rows.length).fill(true)
  );
  const [isDiscountEditing, setIsDiscountEditing] = useState(true);
  const [isTaxEditing, setIsTaxEditing] = useState(true);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setQuotationDate(newDate);
    if (newDate) {
      setIsEditing(false);
    }
  };

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
      const rowTax = row.total * (taxPercentage / 100);
      calculatedTax += rowTax;
    });

    const calculatedDiscount = (calculatedSubtotal * discountPercentage) / 100;

    setDiscountAmount(calculatedDiscount);
    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);
    setGrandTotal(calculatedSubtotal - calculatedDiscount + calculatedTax);
  }, [rows, discountPercentage, taxPercentage]);

  // Table row handling
  const handleInputChange = <K extends keyof Row>(
    index: number,
    field: K,
    value: Row[K]
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "rate" || field === "qty") {
      const { rate, qty } = updatedRows[index];
      const total = rate * qty;
      updatedRows[index].total = total;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { description: "", rate: 0, unit: "", qty: 0, total: 0 },
    ]);
    // Add new editing states for the new row
    setIsDescriptionEditing([...isDescriptionEditing, true]);
    setIsRateEditing([...isRateEditing, true]);
    setIsUnitEditing([...isUnitEditing, true]);
    setIsQtyEditing([...isQtyEditing, true]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
    setIsDescriptionEditing(isDescriptionEditing.filter((_, i) => i !== index));
    setIsRateEditing(isRateEditing.filter((_, i) => i !== index));
    setIsUnitEditing(isUnitEditing.filter((_, i) => i !== index));
    setIsQtyEditing(isQtyEditing.filter((_, i) => i !== index));
  };

  // Prepare data for API
  const prepareQuotationData = () => {
    return {
      id: "", // Empty string to trigger auto-generation of QID000001
      quotationNumber: quotationNumber,
      quotationDate: new Date(quotationDate).toLocaleDateString("en-CA"), // YYYY-MM-DD format
      clientName: client?.name || "",
      clientId: client?.id || "",
      discountPercentage: discountPercentage || 0,
      discountAmount: discountAmount || 0,
      subtotal: subtotal || 0,
      totalTax: totalTax || 0,
      grandTotal: grandTotal || 0,
      notes: notes || "",
      qItems: rows.map((row) => ({
        description: row.description || "",
        unit: row.unit || "",
        qty: row.qty || 0,
        rate: row.rate || 0,
        total: row.total || 0,
        // id and quotationId will be auto-generated by backend
      })),
    };
  };

  // Initialize quotation number

  // Regenerate function
  const regenerateQuotationNumber = () => {
    setQuotationNumber(generateQuotationNumber());
  };
  // Save quotation to API
  const saveQuotation = async () => {
    setQuotationNumber((prev) => prev + 1);
    try {
      const quotationData = prepareQuotationData();

      const response = await fetch(
        `${API_URL}/project_pulse/Quotation/postQuotation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quotationData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save quotation");
      }

      const result = await response.json();
      console.log("Quotation saved successfully:", result);
      alert("Quotation saved successfully!");

      // Optionally redirect to quotations list
      // window.location.href = '/user/quotations';
    } catch (error) {
      console.log("Error saving quotation:", error);
      alert("Error saving quotation. Please try again.");
    }
  };

  // Generate PDF
  const clickPdf = () => {
    const element = document.getElementById("quotation-content");
    if (!element) return;

    const opt = {
      margin: 0.1,
      filename: `${quotationNumber}_${quotationDate}_quotation.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .catch((error: string) => {
        console.log("Error generating PDF:", error);
      });
  };

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">New Quotation</h1>
        <div className="flex gap-3 regular-14">
          <Link
            href={"/user/quotations"}
            className="px-4 py-2 text-gray-600 rounded hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button
            onClick={saveQuotation}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Quotation
          </button>
          <button
            onClick={regenerateQuotationNumber}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Generate Quotation No
          </button>
          <button
            onClick={clickPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div
        id="quotation-content"
        className="max-w-4xl max-h-[150vh] text-base p-8 bg-white rounded-lg shadow relative"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Company Logo */}
          <div
            {...getRootProps()}
            className={`w-48 h-24 ${
              file ? "" : "border-2 border-dashed border-gray-300"
            } rounded-lg flex items-center justify-center cursor-pointer`}
          >
            <input {...getInputProps()} />
            {!file && (
              <p className="text-center text-gray-500 text-sm">
                {isDragActive ? "Drop logo here..." : "Click to upload logo"}
              </p>
            )}
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="Company logo"
                className="w-48 h-24 object-contain rounded"
              />
            )}
          </div>

          {/* Quotation Details */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">QUOTATION</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Quotation #:</span>
                {isQuotationNumberEditing ? (
                  <input
                    type="text"
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                    onBlur={() => setIsQuotationNumberEditing(false)}
                    className="text-right border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setIsQuotationNumberEditing(true)}
                    className="cursor-pointer hover:bg-gray-100 px-2 rounded"
                  >
                    {quotationNumber}
                  </span>
                )}
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Date:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={quotationDate}
                    onChange={handleDateChange}
                    className="text-right border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer hover:bg-gray-100 px-2 rounded"
                  >
                    {quotationDate}
                  </span>
                )}
              </div>
              {reference && (
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">Reference:</span>
                  {isReferenceEditing ? (
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      onBlur={() => setIsReferenceEditing(false)}
                      className="text-right border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span
                      onClick={() => setIsReferenceEditing(true)}
                      className="cursor-pointer hover:bg-gray-100 px-2 rounded"
                    >
                      {reference}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client and Company Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* From */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">From:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Your Company Name</p>
              <p className="text-sm text-gray-600">Your Address</p>
              <p className="text-sm text-gray-600">Phone: Your Phone</p>
              <p className="text-sm text-gray-600">Email: your@email.com</p>
            </div>
          </div>

          {/* To */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">To:</h3>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
              {!client ? (
                <select
                  onChange={(e) => {
                    const selectedClient = initialData.find(
                      (clientOption) => clientOption.id === e.target.value
                    );
                    setClient(selectedClient || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a Client</option>
                  {initialData.map((clientOption) => (
                    <option key={clientOption.id} value={clientOption.id}>
                      {clientOption.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-sm text-gray-600">
                        {client.businessType}
                      </p>
                      <p className="text-sm text-gray-600">{client.location}</p>
                      {client.emailAddress && (
                        <p className="text-sm text-gray-600">
                          {client.emailAddress}
                        </p>
                      )}
                      {client.phoneNumber && (
                        <p className="text-sm text-gray-600">
                          {client.phoneNumber}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setClient(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  #
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Description
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Unit
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Qty
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Rate
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold">
                  Total
                </th>
                <th className="border border-gray-300 p-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {isDescriptionEditing[index] ? (
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        onBlur={() => {
                          const newState = [...isDescriptionEditing];
                          newState[index] = false;
                          setIsDescriptionEditing(newState);
                        }}
                        className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Item description"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          const newState = [...isDescriptionEditing];
                          newState[index] = true;
                          setIsDescriptionEditing(newState);
                        }}
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                      >
                        {row.description || "Click to add description"}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {isUnitEditing[index] ? (
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          handleInputChange(index, "unit", e.target.value)
                        }
                        onBlur={() => {
                          const newState = [...isUnitEditing];
                          newState[index] = false;
                          setIsUnitEditing(newState);
                        }}
                        className="w-20 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Unit"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          const newState = [...isUnitEditing];
                          newState[index] = true;
                          setIsUnitEditing(newState);
                        }}
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded text-center"
                      >
                        {row.unit || "-"}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {isQtyEditing[index] ? (
                      <input
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "qty",
                            Number(e.target.value)
                          )
                        }
                        onBlur={() => {
                          const newState = [...isQtyEditing];
                          newState[index] = false;
                          setIsQtyEditing(newState);
                        }}
                        className="w-20 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          const newState = [...isQtyEditing];
                          newState[index] = true;
                          setIsQtyEditing(newState);
                        }}
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded text-center"
                      >
                        {row.qty}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {isRateEditing[index] ? (
                      <input
                        type="number"
                        value={row.rate}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "rate",
                            Number(e.target.value)
                          )
                        }
                        onBlur={() => {
                          const newState = [...isRateEditing];
                          newState[index] = false;
                          setIsRateEditing(newState);
                        }}
                        className="w-24 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          const newState = [...isRateEditing];
                          newState[index] = true;
                          setIsRateEditing(newState);
                        }}
                        className="cursor-pointer p-1 hover:bg-gray-100 rounded text-center"
                      >
                        ${row.rate.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 font-semibold">
                    ${row.total.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrashAlt size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addRow}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Add Item
          </button>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Discount:</span>
                {isDiscountEditing ? (
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) =>
                      setDiscountPercentage(Number(e.target.value))
                    }
                    onBlur={() => setIsDiscountEditing(false)}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                    min="0"
                    max="100"
                  />
                ) : (
                  <span
                    onClick={() => setIsDiscountEditing(true)}
                    className="cursor-pointer hover:bg-gray-100 px-2 rounded"
                  >
                    {discountPercentage}%
                  </span>
                )}
              </div>
              <span className="text-red-500">
                -${discountAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Tax:</span>
                {isTaxEditing ? (
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    onBlur={() => setIsTaxEditing(false)}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                    min="0"
                    max="100"
                  />
                ) : (
                  <span
                    onClick={() => setIsTaxEditing(true)}
                    className="cursor-pointer hover:bg-gray-100 px-2 rounded"
                  >
                    {taxPercentage}%
                  </span>
                )}
              </div>
              <span>+${totalTax.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment terms, delivery conditions..."
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuotation;
