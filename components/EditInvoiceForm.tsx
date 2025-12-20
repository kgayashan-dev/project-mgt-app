/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

interface InvoiceItem {
  id: number;
  description: string;
  unit: string;
  qty: number;
  rate: number;
  invoiceId: string;
  total?: number;
  tax?: number;
  taxAmount?: number;
}

interface InitialInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  clientId: string;
  companyID: string;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  totalTax: number;
  terms: string;
  grandTotal: number;
  invoiceItems: InvoiceItem[];
  status?: string;
  createdDate?: string;
  reference?: string;
  dueDate?: string;
  clientLocation?: string;
  notes?: string;
  quotationID?: string;
}

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
    total?: number;
  }>;
}

interface EditInvoiceFormProps {
  initialData: Client[];
  bankData: BankAccount[];
  companyData: CompanyData[];
  initialInvoice: InitialInvoice;
  invoiceId: string;
  quotationData?: Quotation[];
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({
  initialData,
  bankData,
  companyData,
  initialInvoice,
  invoiceId,
  quotationData = [],
}) => {
  const router = useRouter();

  console.log("Received props for editing:", {
    initialInvoice,
    invoiceId,
    clientCount: initialData.length,
    bankCount: bankData.length,
    quotationCount: quotationData.length,
  });

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
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [reference, setReference] = useState("No");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedQuotation, setSelectedQuotation] = useState<string>("");
  const [quotations, setQuotations] = useState<Quotation[]>(quotationData);

  // Table state
  const [rows, setRows] = useState<Row[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);

  // Edit states
  const [isInvoiceNumberEditing, setIsInvoiceNumberEditing] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAdditionalInfoEditing, setIsAdditionalInfoEditing] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [isRateEditing, setIsRateEditing] = useState(false);
  const [isUnitEditing, setIsUnitEditing] = useState(false);
  const [isQtyEditing, setIsQtyEditing] = useState(false);
  const [isDiscountEditing, setIsDiscountEditing] = useState(false);
  const [isTaxEditing, setIsTaxEditing] = useState(false);
  const [isReferenceEditing, setIsReferenceEditing] = useState(false);

  // Bank selection state
  const [showBankSelection, setShowBankSelection] = useState(true);

  // Initialize form with invoice data
  useEffect(() => {
    if (initialInvoice) {
      console.log("Initializing form with initialInvoice:", initialInvoice);

      // Set basic invoice data
      setInvoiceNumber(initialInvoice.invoiceNumber || "");

      if (initialInvoice.quotationID) {
        setSelectedQuotation(initialInvoice.quotationID);
      }
      // Format dates
      const formattedDate = initialInvoice.invoiceDate
        ? new Date(initialInvoice.invoiceDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      setInvoiceDate(formattedDate);

      // Use dueDate from API or default to 30 days from invoice date
      const dueDate = initialInvoice.dueDate
        ? new Date(initialInvoice.dueDate).toISOString().split("T")[0]
        : new Date(
            new Date(formattedDate).setDate(
              new Date(formattedDate).getDate() + 30
            )
          )
            .toISOString()
            .split("T")[0];
      setInvoiceDueDate(dueDate);

      setTerms(initialInvoice.terms || "");
      setNotes(initialInvoice.notes || "");
      setDiscountPercentage(initialInvoice.discountPercentage || 0);
      setDiscountAmount(initialInvoice.discountAmount || 0);
      setSubtotal(initialInvoice.subtotal || 0);
      setTotalTax(initialInvoice.totalTax || 0);
      setGrandTotal(initialInvoice.grandTotal || 0);
      setReference(initialInvoice.reference || "No");

      // Calculate tax percentage
      if (
        initialInvoice.subtotal &&
        initialInvoice.totalTax &&
        initialInvoice.subtotal > 0
      ) {
        const calculatedTaxPercentage =
          (initialInvoice.totalTax / initialInvoice.subtotal) * 100;
        setTaxPercentage(calculatedTaxPercentage);
      } else {
        setTaxPercentage(0);
      }

      // Set rows from invoice items
      if (
        initialInvoice.invoiceItems &&
        initialInvoice.invoiceItems.length > 0
      ) {
        const formattedRows = initialInvoice.invoiceItems.map((item) => {
          const itemTotal = item.total || (item.rate || 0) * (item.qty || 0);
          const itemTax = item.tax || taxPercentage;
          const itemTaxAmount = item.taxAmount || (itemTotal * itemTax) / 100;

          return {
            description: item.description || "",
            rate: item.rate || 0,
            tax: itemTax,
            qty: item.qty || 0,
            total: itemTotal,
            unit: item.unit || "",
            taxAmount: itemTaxAmount,
          };
        });
        setRows(formattedRows);
        console.log("Set rows:", formattedRows);
      } else {
        // Initialize with one empty row if no items
        setRows([
          {
            description: "",
            rate: 0,
            tax: taxPercentage,
            qty: 0,
            total: 0,
            unit: "",
            taxAmount: 0,
          },
        ]);
      }

      // Find and set selected client
      const client = initialData.find(
        (client) => client.id === initialInvoice.clientId
      );
      if (client) {
        setSelectedClient(client);
        console.log("Set selected client:", client);
      } else {
        console.log("Client not found for ID:", initialInvoice.clientId);
      }

      // Find and set selected company
      const company = companyData.find(
        (company) => company.id === initialInvoice.companyID
      );
      if (company) {
        setSelectedCompany(company);
        console.log("Set selected company:", company);
      } else {
        console.log("Company not found for ID:", initialInvoice.companyID);
        console.log("Available companies:", companyData);
      }

      // Auto-select first bank account
      if (bankData.length > 0) {
        setSelectedBankAccount(bankData[0].id);
      }
    }
  }, [initialInvoice, initialData, companyData, bankData]);

  // Auto-select first company if available and none selected
  useEffect(() => {
    if (companyData.length > 0 && !selectedCompany && initialInvoice) {
      const company = companyData.find(
        (company) => company.id === initialInvoice.companyID
      );
      if (company) {
        setSelectedCompany(company);
      } else {
        setSelectedCompany(companyData[0]);
      }
    }
  }, [companyData, selectedCompany, initialInvoice]);

  // Dynamically import html2pdf on client side only
  useEffect(() => {
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

  // Handle quotation selection
  const handleQuotationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedQuotationId = e.target.value;
    setSelectedQuotation(selectedQuotationId);

    if (selectedQuotationId) {
      const quotation = quotations.find((q) => q.id === selectedQuotationId);
      if (quotation) {
        console.log("Selected quotation:", quotation);

        // Find the client from initialData
        const client = initialData.find((c) => c.id === quotation.clientId);
        if (client) {
          setSelectedClient(client);
        }

        // Find the company from companyData
        const company = companyData.find((c) => c.id === quotation.companyID);
        if (company) {
          setSelectedCompany(company);
        }

        // Set tax percentage
        const calculatedTaxPercentage =
          quotation.subtotal > 0
            ? (quotation.totalTax / quotation.subtotal) * 100
            : 0;
        setTaxPercentage(calculatedTaxPercentage);

        // Set discount
        setDiscountPercentage(quotation.discountPercentage);
        setDiscountAmount(quotation.discountAmount);

        // Set terms
        setTerms(quotation.terms);

        // Convert quotation items to rows
        if (quotation.qItems && quotation.qItems.length > 0) {
          const newRows = quotation.qItems.map((item) => ({
            description: item.description || "",
            rate: item.rate || 0,
            tax: calculatedTaxPercentage,
            qty: item.qty || 0,
            total: item.total || (item.rate || 0) * (item.qty || 0),
            unit: item.unit || "",
            taxAmount:
              ((item.rate || 0) * (item.qty || 0) * calculatedTaxPercentage) /
              100,
          }));
          setRows(newRows);
        }

        // Set totals
        setSubtotal(quotation.subtotal || 0);
        setTotalTax(quotation.totalTax || 0);
        setGrandTotal(quotation.grandTotal || 0);
      }
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
        tax: taxPercentage,
        qty: 0,
        total: 0,
        unit: "",
        taxAmount: 0,
      },
    ]);
  };

  const deleteRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
    }
  };

  // Update Invoice function
  const updateInvoice = async () => {
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
      const invoiceData = {
        id: invoiceId,
        invoiceNo: invoiceNumber,
        poNo: reference,
        bankAccId: selectedBankAccount || bankData[0]?.id || "BNK0000001",
        invoiceDate: new Date(invoiceDate).toISOString(),
        dueDate: new Date(invoiceDueDate).toISOString(),
        quotationID: selectedQuotation || "",
        companyID: selectedCompany.id,
        terms: terms,
        remarks: notes,
        clientID: selectedClient.id,
        subtotal: subtotal,
        tax: totalTax,
        discountPercentage: discountPercentage,
        discountAmount: discountAmount,
        invoiceTotal: grandTotal,
        status: initialInvoice.status || "Draft",
        items: rows.map((row, index) => ({
          id: initialInvoice.invoiceItems[index]?.id || 0,
          description: row.description,
          unit: row.unit,
          qty: row.qty,
          rate: row.rate,
          invoiceId: invoiceId,
          total: row.total,
        })),
      };

      console.log("Updating invoice data:", invoiceData);

      const response = await fetch(
        `${API_URL}/project_pulse/Invoice/updateInvoice/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to update invoice: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Update response:", result);

      if (
        result.message === "Invoice updated successfully." ||
        result.success
      ) {
        alert("Invoice updated successfully!");
        router.push("/user/invoices");
      } else {
        throw new Error(result.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert(
        `Error updating invoice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete Invoice function
  const deleteInvoice = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Invoice/deleteInvoice/${invoiceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete invoice: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Delete response:", result);

      if (
        result.message === "Invoice deleted successfully." ||
        result.success
      ) {
        alert("Invoice deleted successfully!");
        router.push("/user/invoices");
      } else {
        throw new Error(result.message || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert(
        `Error deleting invoice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  console.log(initialInvoice);
  // Get selected bank account details
  const selectedBank = bankData.find((bank) => bank.id === selectedBankAccount);

  return (
    <div className="flex flex-col m-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-navy-900">
          Edit Invoice #{invoiceNumber || initialInvoice?.invoiceNumber}
        </h1>
        <div className="flex gap-2">
          <Link
            href={"/user/invoices"}
            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded border border-gray-300"
          >
            Cancel
          </Link>
          <button
            onClick={deleteInvoice}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={updateInvoice}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div
        id="invoice-content"
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

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Client Details */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-xs mb-1">
              Client Details
            </label>
            {!selectedClient ? (
              <select
                value={selectedClient?.id || ""}
                onChange={(e) => {
                  const selected = initialData.find(
                    (clientOption) => clientOption.id === e.target.value
                  );
                  setSelectedClient(selected || null);
                }}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a Client</option>
                {initialData.map((clientOption) => (
                  <option key={clientOption.id} value={clientOption.id}>
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
              value={selectedQuotation} // Fixed: Just use the state variable
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
                    Selected Quotation:{" "}
                    {
                      quotations.find((q) => q.id === selectedQuotation)
                        ?.quotationNumber
                    }
                  </span>
                  <div className="text-xs text-gray-600 mt-0.5">
                    <div>
                      Date:{" "}
                      {
                        quotations
                          .find((q) => q.id === selectedQuotation)
                          ?.quotationDate.split("T")[0]
                      }
                    </div>
                    <div>
                      Amount: Rs.{" "}
                      {quotations
                        .find((q) => q.id === selectedQuotation)
                        ?.grandTotal.toFixed(2)}
                    </div>
                    <div>
                      Items:{" "}
                      {quotations.find((q) => q.id === selectedQuotation)
                        ?.qItems?.length || 0}
                    </div>
                  </div>
                </div>
                <button
                  className="mt-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                  onClick={() => setSelectedQuotation("")}
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
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Invoice Number & Reference */}
          <div className="">
            <div className="mb-2">
              <label className="block text-gray-700 text-xs mb-1">
                Invoice Number
              </label>
              {isInvoiceNumberEditing ? (
                <input
                  type="text"
                  value={invoiceNumber}
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
                  {invoiceNumber || "Invoice Number"}
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

            {/* Amount Due Section */}
          </div>
        </div>

        <div className="flex justify-end mb-4 ">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 mb-0.5">Amount Due (LKR)</p>
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
                      disabled={rows.length <= 1}
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
              <label className="block text-gray-700 text-xs mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes (optional)"
                className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
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

export default EditInvoiceForm;
