/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import Link from "next/link";
import SearchableSelect from "./SearchableSelect";
// import { getCompanyData } from "@/utils/getdata";
type Row = {
  description: string;
  rate: number;
  tax: number;
  qty: number;
  total: number;
  unit: string;
  taxAmount: number;
};

interface Client {
  id: string;
  name: string;
  initials: string;
  businessType: string;
  location: string;
  phoneNumber: string;
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType?: string;
  notes?: string;
}

interface CompanyData {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface QuotationData {
  id: string;
  quotationNumber: string;
}

interface NewQuotationProps {
  initialData: Client[];
  bankData: BankAccount[];
  quotationData: QuotationData[];
  companyData: CompanyData[];
}

const QuotationForm: React.FC<NewQuotationProps> = ({
  initialData,
  bankData,
  quotationData,
  companyData,
}) => {
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Client form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    null
  );
  const [QuotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [QuotationDueDate, setQuotationDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [QuotationNumber, setQuotationNumber] = useState("0000001");
  const [reference, setReference] = useState("No");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedQuotation, setSelectedQuotation] = useState<string>("");

  // Table state
  const [rows, setRows] = useState<Row[]>([
    {
      description: "",
      rate: 0,
      tax: 0,
      qty: 0,
      total: 0,
      unit: "",
      taxAmount: 0,
    },
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [terms, setTerms] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);

  // Edit states
  const [isQuotationNumberEditing, setIsQuotationNumberEditing] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAdditionalInfoEditing, setIsAdditionalInfoEditing] = useState(true);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(true);
  const [isRateEditing, setIsRateEditing] = useState(true);
  const [isUnitEditing, setIsUnitEditing] = useState(true);
  const [isQtyEditing, setIsQtyEditing] = useState(true);
  const [isDiscountEditing, setIsDiscountEditing] = useState(true);
  const [isTaxEditing, setIsTaxEditing] = useState(true);
  const [isReferenceEditing, setIsReferenceEditing] = useState(true);

  // Bank selection state
  const [showBankSelection, setShowBankSelection] = useState(true);

  // Get selected bank account details
  const selectedBank = bankData.find((bank) => bank.id === selectedBankAccount);

  // Get selected quotation details
  const selectedQuotationData = quotationData.find(
    (q) => q.id === selectedQuotation
  );

  // Auto-select first company if available
  useEffect(() => {
    if (companyData.length > 0 && !selectedCompany) {
      setSelectedCompany(companyData[0]);
    }
  }, [companyData, selectedCompany]);

  // Dynamically import html2pdf on client side only
  useEffect(() => {
    import("html2pdf.js").then((module) => {
      setHtml2pdf(() => module.default);
    });
  }, []);

  // Auto-select first bank account if available
  useEffect(() => {
    if (bankData.length > 0 && !selectedBankAccount) {
      setSelectedBankAccount(bankData[0].id);
    }
  }, [bankData, selectedBankAccount]);

  // Calculate totals including discount
  useEffect(() => {
    let calculatedSubtotal = 0;
    let calculatedTax = 0;

    rows.forEach((row) => {
      calculatedSubtotal += row.total;
    });

    // Calculate discount amount
    const calculatedDiscountAmount =
      (calculatedSubtotal * discountPercentage) / 100;
    setDiscountAmount(calculatedDiscountAmount);

    // Calculate tax on discounted amount
    const taxableAmount = calculatedSubtotal - calculatedDiscountAmount;
    calculatedTax = taxableAmount * (taxPercentage / 100);

    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);
    setGrandTotal(
      calculatedSubtotal - calculatedDiscountAmount + calculatedTax
    );
  }, [rows, discountPercentage, taxPercentage]);

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
      {
        description: "",
        rate: 0,
        tax: 0,
        qty: 0,
        total: 0,
        unit: "",
        taxAmount: 0,
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  // Save Quotation function
  // Save Quotation function
  const saveQuotation = async () => {
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }

    if (!selectedCompany) {
      alert("Please select a company");
      return;
    }

    if (!selectedBankAccount) {
      alert("Please select a bank account");
      return;
    }

    if (rows.length === 0 || rows.every((row) => !row.description.trim())) {
      alert("Please add at least one item to the Quotation");
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      const QuotationData = {
        id: "", // Will be generated by backend
        quotationNo: QuotationNumber,
        poNo: reference,
        // bankAccId: selectedBankAccount,
        quotationDate: new Date(QuotationDate).toISOString(),
        discountPercentage: discountPercentage, // Fixed: added this field
        discountAmount: discountAmount, // Fixed: added this field
        quotationID: selectedQuotation || null,
        remarks: additionalInfo,
        clientID: selectedClient.id,
        companyID: selectedCompany.id, // Make sure this field exists
        subtotal: subtotal,
        tax: totalTax,
        uotationTotal: grandTotal,
        items: rows.map((row, index) => ({
          id: index,
          description: row.description,
          unit: row.unit,
          qty: row.qty,
          rate: row.rate,
          QuotationId: "", // Will be set by backend
          total: row.total,
        })),
        createdDate: new Date().toISOString(),
        status: "Draft",
      };

      console.log("Sending Quotation data:", QuotationData);

      const response = await fetch(
        `${API_URL}/project_pulse/Quotation/postQuotation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(QuotationData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to save Quotation: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      if (result.message === "Quotation saved successfully.") {
        alert("Quotation saved successfully!");
        console.log("Generated Quotation ID:", result.QuotationId);

        // Optional: Redirect to Quotations list or clear form
        // window.location.href = "/user/Quotations";
      } else {
        throw new Error(result.message || "Failed to save Quotation");
      }
    } catch (error) {
      // console.log("Error saving Quotation:", error);
      alert(
        `Error saving Quotation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF
  const clickPdf = (QuotationNum: string, QuotationDt: string) => {
    if (!html2pdf) {
      alert("PDF generator is still loading. Please try again in a moment.");
      return;
    }

    // Hide bank selection before generating PDF
    setShowBankSelection(false);

    // Small delay to ensure DOM updates
    setTimeout(() => {
      const element = document.getElementById("Quotation-content");
      const opt = {
        margin: 0.25,
        filename: `${QuotationNum}_${QuotationDt}_Quotation.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          console.log("PDF generated successfully!");
        })
        .catch((error: any) => {
          console.error("Error generating PDF:", error);
        })
        .finally(() => {
          // Show bank selection again after PDF generation
          setShowBankSelection(true);
        });
    }, 100);
  };

  return (
    <div className="flex flex-col m-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-navy-900">New Quotation</h1>
        <div className="flex gap-2">
          <Link
            href={"/user/Quotations"}
            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-300"
          >
            Cancel
          </Link>
          <button
            onClick={saveQuotation}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => clickPdf(QuotationNumber, QuotationDate)}
            disabled={!html2pdf}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {html2pdf ? "Save as PDF" : "Loading PDF..."}
          </button>
        </div>
      </div>

      <div
        id="Quotation-content"
        className="max-w-6xl w-full p-4 bg-white rounded-lg shadow border border-gray-200"
      >
        {/* File Upload and Company Info */}
        <div className="flex justify-between mb-6">
          <div
            {...getRootProps()}
            className={`w-48 h-24 ${
              file ? "" : "border-2 border-dashed border-gray-300"
            } rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-100 transition-colors`}
          >
            <input {...getInputProps()} />
            {!file && (
              <p className="text-center text-gray-500 text-xs px-2">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop company logo here, or click to select"}
              </p>
            )}
            {file && (
              <div className="text-center">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-48 h-24 object-contain rounded"
                />
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-right">
              <select
                value={selectedCompany?.id || ""}
                onChange={(e) => {
                  const selected = companyData.find(
                    (company) => company.id === e.target.value
                  );
                  setSelectedCompany(selected || null);
                }}
                className="w-48 p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Company</option>
                {companyData.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
              {selectedCompany && (
                <div className="mt-2 text-xs text-gray-600">
                  <div className="font-semibold">
                    {selectedCompany.companyName}
                  </div>
                  <div>{selectedCompany.email}</div>
                  <div>{selectedCompany.phoneNumber}</div>
                  {selectedCompany.address && (
                    <div>
                      {selectedCompany.address}, {selectedCompany.city}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Client Details */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-xs mb-1">
              Client Details
            </label>
            {!selectedClient ? (
              <select
                value={selectedClient || ""}
                onChange={(e) => {
                  const selected = initialData.find(
                    (clientOption) => clientOption.name === e.target.value
                  );
                  setSelectedClient(selected || null);
                }}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a Client</option>
                {initialData.map((clientOption) => (
                  <option key={clientOption.id} value={clientOption.name}>
                    {clientOption.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2 border border-gray-300 rounded bg-gray-100">
                <div className="flex flex-col text-blue-700">
                  <span className="font-semibold text-xs">
                    {selectedClient.name}
                  </span>
                  <div className="flex flex-col text-xs text-gray-600 mt-0.5">
                    <span>{selectedClient.initials}</span>
                    <span>{selectedClient.businessType}</span>
                    <span>{selectedClient.location}</span>
                  </div>
                </div>
                <button
                  className="mt-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  onClick={() => setSelectedClient(null)}
                >
                  Remove client
                </button>
              </div>
            )}

            <div className="mt-2">
              {isAdditionalInfoEditing ? (
                <input
                  type="text"
                  placeholder="Additional info..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  onBlur={() => setIsAdditionalInfoEditing(false)}
                  className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p
                  onClick={() => setIsAdditionalInfoEditing(true)}
                  className="cursor-pointer p-1.5 text-xs rounded hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                >
                  {additionalInfo
                    ? `Additional Info: ${additionalInfo}`
                    : "Click to add additional info"}
                </p>
              )}
            </div>
          </div>

          {/* Quotation Dates */}
          <div>
            <div className="mb-2">
              <label className="block text-gray-700 text-xs mb-1">
                Quotation Date
              </label>
              <input
                type="date"
                value={QuotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={QuotationDueDate}
                onChange={(e) => setQuotationDueDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quotation Number & Reference */}
          <div>
            <div className="mb-2">
              <label className="block text-gray-700 text-xs mb-1">
                Quotation Number
              </label>
              {isQuotationNumberEditing ? (
                <input
                  type="text"
                  value={QuotationNumber}
                  placeholder="Quotation Number..."
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  onBlur={() => setIsQuotationNumberEditing(false)}
                  className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p
                  onClick={() => setIsQuotationNumberEditing(true)}
                  className="cursor-pointer p-1.5 text-xs rounded hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                >
                  {QuotationNumber || "Quotation Number"}
                </p>
              )}
            </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-xs mb-1">
                Reference
              </label>
              {isReferenceEditing ? (
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter value (e.g. PO #)"
                  className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p
                  onClick={() => setIsReferenceEditing(true)}
                  className="cursor-pointer p-1.5 text-xs rounded hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                >
                  {reference}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quotation and Amount Due Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Quotation Selection */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">
              Select Quotation
            </label>
            <SearchableSelect
              options={quotationData.map((q) => ({
                value: q.id,
                label: q.quotationNumber,
              }))}
              value={selectedQuotation}
              onChange={setSelectedQuotation}
              placeholder="Search and select quotation..."
              label=""
              className="w-full text-xs"
            />
            {selectedQuotationData && (
              <div className="mt-1 text-xs text-green-600">
                Selected: {selectedQuotationData.id}
              </div>
            )}
          </div>

          {/* Amount Due */}
          <div className="flex justify-end">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-0.5">Amount Due (LKR)</p>
              <h1 className="text-xl font-bold text-blue-800">
                Rs.{" "}
                {grandTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h1>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-4">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="text-left p-2 font-semibold text-gray-700 text-xs">
                  Item
                </th>
                <th className="text-left p-2 font-semibold text-gray-700 text-xs">
                  Description
                </th>
                <th className="text-left p-2 font-semibold text-gray-700 text-xs">
                  Unit
                </th>
                <th className="text-left p-2 font-semibold text-gray-700 text-xs">
                  Qty
                </th>
                <th className="text-left p-2 font-semibold text-gray-700 text-xs">
                  Rate
                </th>
                <th className="text-right p-2 font-semibold text-gray-700 text-xs">
                  Total
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <td className="p-2 text-center text-gray-600 text-xs">
                    {index + 1}
                  </td>
                  <td className="p-2">
                    {isDescriptionEditing ? (
                      <input
                        type="text"
                        value={row.description}
                        placeholder="Description..."
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        onBlur={() => setIsDescriptionEditing(false)}
                        className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span
                        onClick={() => setIsDescriptionEditing(true)}
                        className="cursor-pointer block p-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                      >
                        {row.description || "No description"}
                      </span>
                    )}
                  </td>

                  <td className="p-2">
                    {isUnitEditing ? (
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          handleInputChange(index, "unit", e.target.value)
                        }
                        onBlur={() => setIsUnitEditing(false)}
                        className="w-16 p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span
                        onClick={() => setIsUnitEditing(true)}
                        className="cursor-pointer block p-1.5 text-xs rounded hover:bg-gray-100 transition-colors text-center"
                      >
                        {row.unit || "_"}
                      </span>
                    )}
                  </td>

                  <td className="p-2">
                    {isQtyEditing ? (
                      <input
                        type="number"
                        value={row.qty}
                        min="0"
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "qty",
                            Number(e.target.value)
                          )
                        }
                        onBlur={() => setIsQtyEditing(false)}
                        className="w-16 p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span
                        onClick={() => setIsQtyEditing(true)}
                        className="cursor-pointer block p-1.5 text-xs rounded hover:bg-gray-100 transition-colors text-center"
                      >
                        {row.qty || "0"}
                      </span>
                    )}
                  </td>

                  <td className="p-2">
                    {isRateEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={row.rate}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "rate",
                            Number(e.target.value)
                          )
                        }
                        onBlur={() => setIsRateEditing(false)}
                        className="w-20 p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span
                        onClick={() => setIsRateEditing(true)}
                        className="cursor-pointer block p-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                      >
                        Rs. {row.rate || "0"}
                      </span>
                    )}
                  </td>

                  <td className="p-2 text-right text-xs">
                    Rs. {row.total.toFixed(2)}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-red-400   group-hover:opacity-100 hover:text-red-600 transition-all duration-200  rounded text-xs"
                      title="Delete row"
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
            className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 text-xs"
          >
            + Add a Line
          </button>
        </div>

        {/* Totals and Bank Account */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Notes & Terms */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Terms</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter terms or conditions (optional)"
                className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
          </div>

          {/* Totals Section */}
          <div className="w-full md:w-72">
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs">Subtotal</span>
                  <span className="text-xs">Rs. {subtotal.toFixed(2)}</span>
                </div>

                {/* Discount Section */}
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600 text-xs">Discount</span>
                    {isDiscountEditing ? (
                      <input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) =>
                          setDiscountPercentage(Number(e.target.value))
                        }
                        onBlur={() => setIsDiscountEditing(false)}
                        className="w-12 p-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    ) : (
                      <span
                        onClick={() => setIsDiscountEditing(true)}
                        className="cursor-pointer px-1 py-0.5 rounded hover:bg-gray-200 transition-colors text-xs"
                      >
                        {discountPercentage || 0}%
                      </span>
                    )}
                  </div>
                  <span className="text-green-600 text-xs">
                    -Rs. {discountAmount.toFixed(2)}
                  </span>
                </div>

                {/* Tax Section */}
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600 text-xs">Tax</span>
                    {isTaxEditing ? (
                      <input
                        type="number"
                        value={taxPercentage}
                        onChange={(e) =>
                          setTaxPercentage(Number(e.target.value))
                        }
                        onBlur={() => setIsTaxEditing(false)}
                        className="w-12 p-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    ) : (
                      <span
                        onClick={() => setIsTaxEditing(true)}
                        className="cursor-pointer px-1 py-0.5 rounded hover:bg-gray-200 transition-colors text-xs"
                      >
                        {taxPercentage || 0}%
                      </span>
                    )}
                  </div>
                  <span className="text-red-600 text-xs">
                    +Rs. {totalTax.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-xs text-gray-800">
                      Quotation Total
                    </span>
                    <span className="font-bold text-xs text-blue-800">
                      Rs.{" "}
                      {grandTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 text-xs mb-1">
                  Bank Account
                </label>
                {showBankSelection && (
                  <select
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Bank Account</option>
                    {bankData.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.accountName} - {bank.bankName} (
                        {bank.accountNumber})
                      </option>
                    ))}
                  </select>
                )}

                {selectedBank && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <h3 className="font-semibold text-xs text-gray-800 mb-1">
                      Bank Account Details
                    </h3>
                    <div className="text-xs space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="text-xs">
                          {selectedBank.accountName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="text-xs">{selectedBank.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Branch:</span>
                        <span className="text-xs">{selectedBank.branch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="text-xs">
                          {selectedBank.accountNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
