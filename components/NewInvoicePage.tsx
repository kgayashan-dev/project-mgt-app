/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import Link from "next/link";
// import SearchableSelect from "./SearchableSelect";
import { getQuotatoinData } from "@/utils/getdata";

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

// interface InvoiceData {
//   id: string;
//   InvoiceNumber: string;
// }

interface Quotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  clientId: string;
  companyID: string;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  totalTax: number;
  terms: string;
  grandTotal: number;
  qItems: Array<{
    id: number;
    description: string;
    quotationId: string;
    unit: string;
    qty: number;
    rate: number;
  }>;
}

interface NewInvoiceProps {
  initialData: Client[];
  bankData: BankAccount[];
  // InvoiceData: InvoiceData[];
  companyData: CompanyData[];
  quotationsData?: Quotation[]; // Add quotations prop
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const InvoiceForm: React.FC<NewInvoiceProps> = ({
  initialData,

  companyData,
  quotationsData = [], // Default to empty array
}) => {
  // State for client-side initialization
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClient, setIsClient] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>(quotationsData);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Client form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    null
  );

  // Initialize with empty strings to avoid hydration mismatch
  const [InvoiceDate, setInvoiceDate] = useState("");
  const [InvoiceDueDate, setInvoiceDueDate] = useState("");
  const [InvoiceNumber, setInvoiceNumber] = useState("");
  const [reference, setReference] = useState("No");

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
  const [taxPercentage, setTaxPercentage] = useState(0); // Tax percentage (not amount)

  // Edit states
  const [isInvoiceNumberEditing, setIsInvoiceNumberEditing] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAdditionalInfoEditing, setIsAdditionalInfoEditing] = useState(true);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(true);
  const [isRateEditing, setIsRateEditing] = useState(true);
  const [isUnitEditing, setIsUnitEditing] = useState(true);
  const [isQtyEditing, setIsQtyEditing] = useState(true);
  const [isDiscountEditing, setIsDiscountEditing] = useState(true);
  const [isTaxEditing, setIsTaxEditing] = useState(true);
  const [isReferenceEditing, setIsReferenceEditing] = useState(true);

  // Initialize client-side only values
  useEffect(() => {
    setIsClient(true);

    // Initialize dates and Invoice number
    const today = new Date().toISOString().split("T")[0];
    setInvoiceDate(today);
    setInvoiceDueDate(today);
    setInvoiceNumber("INV01"); // You might want to generate this dynamically

    // Initialize html2pdf
    import("html2pdf.js").then((module) => {
      setHtml2pdf(() => module.default);
    });
  }, []);

  // Handle file URL creation and cleanup
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setFileUrl(null);
    }
  }, [file]);

  // Fetch quotations if not provided via props
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const quotationData = await getQuotatoinData();
        console.log("Quotation data:", quotationData);

        if (quotationData && Array.isArray(quotationData)) {
          setQuotations(quotationData);
        }
      } catch (error) {
        console.error("Error fetching quotations:", error);
      }
    };

    if (quotationsData.length === 0) {
      fetchQuotations();
    }
  }, [quotationsData]);

  // Auto-select first company if available
  useEffect(() => {
    if (companyData.length > 0 && !selectedCompany) {
      setSelectedCompany(companyData[0]);
    }
  }, [companyData, selectedCompany]);

  // When quotation is selected, populate the form with quotation data
  useEffect(() => {
    if (selectedQuotation) {
      console.log("Selected quotation:", selectedQuotation);

      // Find the client from initialData
      const client = initialData.find(
        (c) => c.id === selectedQuotation.clientId
      );
      if (client) {
        setSelectedClient(client);
      }

      // Find the company from companyData
      const company = companyData.find(
        (c) => c.id === selectedQuotation.companyID
      );
      if (company) {
        setSelectedCompany(company);
      }

      // Set invoice date to today
      const today = new Date().toISOString().split("T")[0];
      setInvoiceDate(today);

      // Set invoice due date (maybe 30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setInvoiceDueDate(dueDate.toISOString().split("T")[0]);

      // Set tax percentage
      const calculatedTaxPercentage =
        selectedQuotation.subtotal > 0
          ? (selectedQuotation.totalTax / selectedQuotation.subtotal) * 100
          : 0;
      setTaxPercentage(calculatedTaxPercentage);

      // Set discount
      setDiscountPercentage(selectedQuotation.discountPercentage);

      // Set terms
      setTerms(selectedQuotation.terms);

      // Convert quotation items to rows
      if (selectedQuotation.qItems && selectedQuotation.qItems.length > 0) {
        const newRows = selectedQuotation.qItems.map((item) => ({
          description: item.description || "",
          rate: item.rate || 0,
          tax: calculatedTaxPercentage, // Use the same tax percentage
          qty: item.qty || 0,
          total: (item.rate || 0) * (item.qty || 0),
          unit: item.unit || "",
          taxAmount:
            ((item.rate || 0) * (item.qty || 0) * calculatedTaxPercentage) /
            100,
        }));
        setRows(newRows);
      }

      // Calculate and set totals
      const calculatedSubtotal = selectedQuotation.subtotal || 0;
      const calculatedDiscountAmount = selectedQuotation.discountAmount || 0;
      const calculatedTax = selectedQuotation.totalTax || 0;
      const calculatedGrandTotal = selectedQuotation.grandTotal || 0;

      setSubtotal(calculatedSubtotal);
      setDiscountAmount(calculatedDiscountAmount);
      setTotalTax(calculatedTax);
      setGrandTotal(calculatedGrandTotal);
    }
  }, [selectedQuotation, initialData, companyData]);

  // Calculate totals including discount - UPDATED TO MATCH BACKEND LOGIC
  useEffect(() => {
    // Don't recalculate if we just set from quotation
    if (selectedQuotation) return;

    // Calculate subtotal from items (sum of quantity * rate)
    let calculatedSubtotal = 0;
    rows.forEach((row) => {
      calculatedSubtotal += row.rate * row.qty;
    });

    // Calculate discount amount based on percentage
    const calculatedDiscountAmount =
      (calculatedSubtotal * discountPercentage) / 100;

    // Calculate tax (using tax percentage on taxable amount)
    const taxableAmount = calculatedSubtotal - calculatedDiscountAmount;
    const calculatedTax = (taxableAmount * taxPercentage) / 100;

    // Calculate final Invoice total
    const calculatedGrandTotal =
      calculatedSubtotal - calculatedDiscountAmount + calculatedTax;

    setSubtotal(calculatedSubtotal);
    setDiscountAmount(calculatedDiscountAmount);
    setTotalTax(calculatedTax);
    setGrandTotal(calculatedGrandTotal);
  }, [rows, discountPercentage, taxPercentage, selectedQuotation]);

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

  // Handle quotation selection
  const handleQuotationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedQuotationId = e.target.value;
    if (selectedQuotationId) {
      const quotation = quotations.find((q) => q.id === selectedQuotationId);
      setSelectedQuotation(quotation || null);
    } else {
      setSelectedQuotation(null);
    }
  };

  const prepareInvoiceData = () => {
    const invoiceDateObj = new Date(InvoiceDate);
    const createdDateObj = new Date();

    return {
      id: "", // Empty string, not null
      invoiceNo: InvoiceNumber || "", // Empty string if not set
      poNo: reference || "", // Empty string, not "No"
      bankAccId: "BNK0000001", // Make sure this exists in database
      invoiceDate: invoiceDateObj.toISOString(),
      quotationID: selectedQuotation?.id || "", // Empty string, not null
      companyID: selectedCompany?.id || "", // Empty string, not null
      remarks: additionalInfo || "", // Empty string, not null
      clientID: selectedClient?.id || "", // Empty string, not null
      subtotal: subtotal,
      tax: taxPercentage,
      discountPercentage: discountPercentage,
      discountAmount: discountAmount,
      invoiceTotal: grandTotal,
      terms: terms , // Empty string, not null
      items: rows.map((row) => ({
        id: 0, // Integer 0
        description: row.description || "",
        unit: row.unit || "",
        qty: row.qty || 0,
        rate: row.rate || 0,
        invoiceId: "", // Empty string
        total: row.total || 0,
      })),
      createdDate: createdDateObj.toISOString(),
      status: "Draft" // Commented out in your model
    };
  };

  // Save Invoice function
  const saveInvoice = async () => {
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }

    if (!selectedCompany) {
      alert("Please select a company");
      return;
    }

    if (rows.length === 0 || rows.every((row) => !row.description.trim())) {
      alert("Please add at least one item to the Invoice");
      return;
    }

    setLoading(true);

    try {
      const InvoiceData = prepareInvoiceData();

      console.log("Items first element:", InvoiceData.items[0]);

      const response = await fetch(
        `${API_URL}/project_pulse/Invoice/postInvoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(InvoiceData),
        }
      );

      console.log(InvoiceData,"select")

      if (!response.ok) {
        const errorText = await response.json();
        console.log(errorText);

        throw new Error(errorText.error);
      }

      const result = await response.json();

      if (result.message === "Invoice saved successfully.") {
        alert(result.message + " " + result.invoiceId);
      } else {
        throw new Error(result.message || "Failed to save Invoice");
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF
  const clickPdf = (InvoiceNum: string, InvoiceDt: string) => {
    if (!html2pdf) {
      alert("PDF generator is still loading. Please try again in a moment.");
      return;
    }

    const element = document.getElementById("Invoice-content");
    const opt = {
      margin: 0.25,
      filename: `${InvoiceNum}_${InvoiceDt}_Invoice.pdf`,
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
      });
  };

  return (
    <div className="flex flex-col m-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-navy-900">New Invoice</h1>
        <div className="flex gap-2">
          <Link
            href={"/user/Invoices"}
            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-300"
          >
            Cancel
          </Link>
          <button
            onClick={saveInvoice}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => clickPdf(InvoiceNumber, InvoiceDate)}
            disabled={!html2pdf}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {html2pdf ? "Save as PDF" : "Loading PDF..."}
          </button>
        </div>
      </div>

      <div
        id="Invoice-content"
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
            {!file ? (
              <p className="text-center text-gray-500 text-xs px-2">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop company logo here, or click to select"}
              </p>
            ) : fileUrl ? (
              <div className="text-center">
                <img
                  src={fileUrl}
                  alt={file.name}
                  className="w-48 h-24 object-contain rounded"
                />
              </div>
            ) : (
              <p className="text-center text-gray-500 text-xs px-2">
                Loading...
              </p>
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

          {/* Quotation Details */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-xs mb-1">
              Select Quotation (Optional)
            </label>
            <select
              value={selectedQuotation?.id || ""}
              onChange={handleQuotationChange}
              className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a Quotation (Optional)</option>
              {quotations.map((quotation) => (
                <option key={quotation.id} value={quotation.id}>
                  {quotation.quotationNumber} -{" "}
                  {quotation.quotationDate.split("T")[0]} - Rs.{" "}
                  {quotation.grandTotal.toFixed(2)}
                </option>
              ))}
            </select>

            {selectedQuotation && (
              <div className="mt-2 p-2 border border-gray-300 rounded bg-blue-50">
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-blue-800">
                    Selected Quotation: {selectedQuotation.quotationNumber}
                  </span>
                  <div className="text-xs text-gray-600 mt-0.5">
                    <div>
                      Date: {selectedQuotation.quotationDate.split("T")[0]}
                    </div>
                    <div>
                      Amount: Rs. {selectedQuotation.grandTotal.toFixed(2)}
                    </div>
                    <div>Items: {selectedQuotation.qItems?.length || 0}</div>
                  </div>
                </div>
                <button
                  className="mt-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  onClick={() => setSelectedQuotation(null)}
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          {/* Invoice Dates */}
          <div>
            <div className="mb-2">
              <label className="block text-gray-700 text-xs mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={InvoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={InvoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Invoice Number & Reference */}
          <div>
            <div className="mb-2">
              <label className="block text-gray-700 text-xs mb-1">
                Invoice Number
              </label>
              {isInvoiceNumberEditing ? (
                <input
                  type="text"
                  value={InvoiceNumber}
                  placeholder="Invoice Number..."
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  onBlur={() => setIsInvoiceNumberEditing(false)}
                  className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p
                  onClick={() => setIsInvoiceNumberEditing(true)}
                  className="cursor-pointer p-1.5 text-xs rounded hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                >
                  {InvoiceNumber || "Invoice Number"}
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

        {/* Amount Due Section */}
        <div className="flex justify-end mb-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 mb-0.5">Invoice Total (LKR)</p>
            <h1 className="text-lg font-bold text-blue-800">
              Rs.{" "}
              {grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h1>
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
                      className="text-red-400 hover:text-red-600 transition-all duration-200 rounded text-xs"
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

        {/* Totals Section */}
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
                      Invoice Total
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
