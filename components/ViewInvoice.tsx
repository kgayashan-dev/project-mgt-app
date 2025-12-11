/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { getBankData, getCompanyAData } from "@/utils/getdata";

type Row = {
  description: string;
  rate: number;
  tax: number;
  qty: number;
  total: number;
  unit: string;
  taxAmount: number;
};

interface InvoiceArray {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string;
  client: string;
  location: string;
  outstandingRevenue: number;
  table: Row[];
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  notes: string;

  emailAddress: string;
  terms: string;
  clientAddress: string;
  invoiceReference: string;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  additionalInfo: string;
  phoneNumber: number;
}
interface CompanyClientDetails {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  registrationNumber: string;
  clientID: string;
  clientPhone: string;
  clientName: string;

  // Add other company fields as needed
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

interface InvoiceDetailPageProps {
  invoiceArray: InvoiceArray;
}

const ViewInvoice: React.FC<InvoiceDetailPageProps> = ({ invoiceArray }) => {
  const {
    client,
    id,
    invoiceNumber,
    clientAddress,
    invoiceDate,
    notes,
    phoneNumber,
    table = [],
    subtotal,
    totalTax,
    grandTotal,
    terms,
    emailAddress,
    invoiceReference,
  } = invoiceArray;



  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showBankSelection, setShowBankSelection] = useState(true);
  // Add company state
  const [company, setCompany] = useState<CompanyClientDetails | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  // Dynamically import html2pdf on client side only
  useEffect(() => {
    import("html2pdf.js").then((module) => {
      setHtml2pdf(module.default);
    });
  }, []);

  // Fetch company data when component mounts
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (id) {
        try {
          setCompanyLoading(true);
          const companyData = await getCompanyAData(id);
          console.log(companyData, "Fetched company data");
          setCompany(companyData);
        } catch (error) {
          console.error("Error fetching company:", error);
        } finally {
          setCompanyLoading(false);
        }
      } else {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  console.log(company, "company data");

  // Fetch bank accounts on component mount
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const results = await getBankData();

        if (results.success) {
          setBankAccounts(results.data);

          // Auto-select first bank account if available
          if (results.data.length > 0) {
            setSelectedBankAccount(results.data[0].id);
          }
        } else {
          console.log("Failed to fetch bank accounts:", results.message);
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccounts();
  }, []);

  // Get selected bank account details
  const selectedBank = bankAccounts.find(
    (bank) => bank.id === selectedBankAccount
  );

  // File upload handling
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const onSignatureDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSignatureFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  const {
    getRootProps: getSignatureRootProps,
    getInputProps: getSignatureInputProps,
    isDragActive: isSignatureDragActive,
  } = useDropzone({
    onDrop: onSignatureDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Save function
  const handleAttachmentsChange = () => {
    alert("Attachments SAVE");
  };

  // Generate PDF
  // Alternative PDF generation using jspdf + html2canvas directly
  const generatePDF = async (invoiceNum: string, invoiceDt: string) => {
    try {
      setIsGeneratingPDF(true);

      // Hide bank selection before PDF generation
      setShowBankSelection(false);
      // Dynamically import both libraries
      const [jsPDF, html2canvas] = await Promise.all([
        import("jspdf").then((module) => module.default),
        import("html2canvas").then((module) => module.default),
      ]);

      const element = document.getElementById("invoice-content");
      if (!element) {
        throw new Error("Invoice content not found");
      }

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoiceNum}_${invoiceDt}_invoice.pdf`);
      console.log("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setShowBankSelection(true);
      setIsGeneratingPDF(false);
    }
  };

  // Split client address
  const addressParts = clientAddress
    ? clientAddress.split(",").map((part) => part.trim())
    : [];

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Invoice {id}</h1>
        <div className="flex gap-3">
          <Link
            href={"/user/invoices"}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </Link>
          <button
            onClick={handleAttachmentsChange}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => generatePDF(invoiceNumber, invoiceDate)}
            disabled={!html2pdf}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {html2pdf ? "Save as PDF" : "Loading PDF..."}
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        id="invoice-content"
        className="max-w-3xl max-h-[150vh] regular-14 p-4 bg-white rounded-lg shadow"
      >
        {/* File Upload and Company Info */}
        <div className="grid grid-cols-2 gap-6 mb-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col justify-start mb-4">
              <div
                {...getRootProps()}
                className={`w-60 h-30 ${
                  file ? "" : "border-2 border-dashed"
                } rounded-lg flex items-center justify-center cursor-pointer`}
              >
                <input {...getInputProps()} aria-label="Upload company logo" />
                {!file && (
                  <p className="text-center text-gray-500 regular-12">
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
                      className="w-60 h-30 object-contain rounded"
                    />
                  </div>
                )}
              </div>
              <div className="text-left regular-12 flex flex-col gap-1 my-2 leading-none">
                <div className="">
                  {company ? (
                    <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                      <span className="font-semibold leading-tight">
                        {company.companyName}
                      </span>
                      <span className="regular-12 leading-tight">
                        {company.registrationNumber}
                      </span>
                      {company.address && (
                        <div className="regular-12 leading-tight">
                          {company.address}
                        </div>
                      )}
                      <div className="flex flex-col justify-end">
                        <span>{company.phoneNumber}</span>
                        <p>{company.email}</p>
                      </div>
                    </div>
                  ) : companyLoading ? (
                    "Loading company data..."
                  ) : (
                    "No company data available"
                  )}
                </div>
              </div>
              <div className="pl-11">
                <p className="block text-gray-600 regular-12 leading-tight underline"></p>
                <div className="">
                  <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                    <span className="underline">Client Details</span>

                    <div className="">
                      {company ? (
                        <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                          <span className="font-semibold leading-tight">
                            ID: {company.clientID}
                          </span>
                          <span className="regular-12 leading-tight">
                            Name: {company.clientName}
                          </span>
                          <span className="regular-12 leading-tight">
                            Tel: {company.clientPhone}
                          </span>
                        </div>
                      ) : companyLoading ? (
                        "Loading company data..."
                      ) : (
                        "No company data available"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between pl-[52px]">
            <div className="regular-12">
              <p>Invoice</p>
            </div>
            <div className="flex flex-col justify-center">
              <span className="regular-12 leading-tight">InvoiceId: {id}</span>
              <span className="regular-12 leading-tight">
                InvoiceNo: {invoiceNumber}
              </span>
              <span className="regular-12 leading-tight">
                PO No: {invoiceNumber}
              </span>
              <span className="regular-12 leading-tight">
                Date: {invoiceDate}
              </span>
              <span className="regular-12 leading-tight">
                Quotation No: {invoiceReference}
              </span>
              <span className="regular-12 leading-tight">Remarks: {notes}</span>
            </div>
            <div className="regular-12">Reference: {invoiceReference}</div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-2">
          <table className="w-full border-gray-300 border-collapse">
            <thead>
              <tr className="border-gray-300 regular-10 font-semibold">
                <th className="text-center border w-[5vh]">Item</th>
                <th className="text-center border w-[48vh]">Description</th>
                <th className="text-center border">Unit</th>
                <th className="text-center border">Qty</th>
                <th className="text-center border">Rate</th>
                <th className="text-center border">Total</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => (
                <tr
                  key={index}
                  className="leading-none border cursor-pointer regular-10 border-1 border-gray-300 group hover:bg-gray-100 transition-colors"
                >
                  <td className="p-1 text-center border">{index + 1}</td>
                  <td className="p-1 border">
                    {row.description || "No description"}
                  </td>
                  <td className="px-1 text-center border">{row.unit || "_"}</td>
                  <td className="px-1 text-center border">{row.qty || "0"}</td>
                  <td className="px-1 text-center p-1 hover:bg-gray-100 border">
                    {row.rate || "0"}
                  </td>
                  <td className="w-[10vh] text-center pl-2 rounded focus:ring-2 focus:ring-blue-500 border">
                    Rs.{row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Totals section */}
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Subtotal</td>
                <td className="border text-center px-2">
                  Rs. {subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Tax</td>
                <td className="border text-center px-2">
                  +Rs. {totalTax.toFixed(2)}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10 font-medium">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Invoice Total</td>
                <td className="border text-center px-2">
                  Rs. {grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes & Terms */}
        <div className="space-y-1">
          <div className="w-full regular-10 max-w-2xl grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2">
            {/* Authorized By Section */}
            <div className="flex justify-start gap-2">
              <span className="items- font-medium">Authorized by:</span>
              <div className="w-32 h-12">
                <div
                  {...getSignatureRootProps()}
                  className={`w-32 h-12 ${
                    signatureFile ? "" : "border-2 border-dashed"
                  } rounded-lg flex justify-start items-start cursor-pointer`}
                >
                  <input
                    {...getSignatureInputProps()}
                    aria-label="Upload signature"
                  />
                  {!signatureFile && (
                    <p className="text-center text-gray-500 regular-12 p-2">
                      {isSignatureDragActive
                        ? "Drop the signature here..."
                        : "Drop the signature here"}
                    </p>
                  )}
                  {signatureFile && (
                    <div className="text-center">
                      <img
                        src={URL.createObjectURL(signatureFile)}
                        alt={signatureFile.name}
                        className="w-32 h-12 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="pl-24  ">
              {/* Bank Account Selection Dropdown */}
              {showBankSelection && (
                <div className="mb-4 ">
                  <label className="block regular-12 font-semibold mb-2 text-red-400">
                    Select Bank Account
                  </label>
                  <select
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg regular-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading || bankAccounts.length === 0}
                  >
                    {loading ? (
                      <option value="">Loading bank accounts...</option>
                    ) : bankAccounts.length === 0 ? (
                      <option value="">No bank accounts available</option>
                    ) : (
                      bankAccounts.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.accountName} - {bank.bankName} ({bank.branch})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* Bank Account Details */}
              {selectedBank && (
                <div className="mb-4">
                  <h2 className="regular-12 font-semibold mb-2">
                    Bank Account Details
                  </h2>
                  <div className="regular-10 space-y-1">
                    <div className="flex gap-2">
                      <span className="min-w-20">Name</span>
                      <span className="font-medium">
                        {selectedBank.accountName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="min-w-20">Bank</span>
                      <span className="font-medium">
                        {selectedBank.bankName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="min-w-20">Branch</span>
                      <span className="font-medium">{selectedBank.branch}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="min-w-20 regular-10">Acc. Number</span>
                      <span className="font-medium">
                        {selectedBank.accountNumber}
                      </span>
                    </div>
                    {selectedBank.accountType && (
                      <div className="flex gap-2">
                        <span className="min-w-20 regular-10">Type</span>
                        <span className="font-medium">
                          {selectedBank.accountType}
                        </span>
                      </div>
                    )}
                    {selectedBank.notes && (
                      <div className="flex gap-2">
                        <span className="min-w-20 regular-10">Notes</span>
                        <span className="font-medium">
                          {selectedBank.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Note Section */}
            <div className="mt-3 regular-9 text-gray-600 max-w-md">
              {terms ? (
                <div>
                  <h1>Terms:</h1>
                  <span className="font-semibold">{terms}</span> 
                </div>
              ) : (
                "No terms specified"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
