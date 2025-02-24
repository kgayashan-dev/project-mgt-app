"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import html2pdf from "html2pdf.js";
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

interface InvoiceDetailPageProps {
  invoiceArray: InvoiceArray;
}

const ViewInvoice: React.FC<InvoiceDetailPageProps> = ({ invoiceArray }) => {
  const {
    client,
    invoiceNumber,
    clientAddress,
    invoiceDate,

    phoneNumber,

    table = [],
    subtotal,
    totalTax,
    grandTotal,
    notes,
    emailAddress,
    // terms,
    // additionalInfo,
    // discountPercentage,
    invoiceReference,
    // taxPercentage,
  } = invoiceArray;

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

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
  const clickPdf = (invoiceNum: string, invoiceDt: string) => {
    const element = document.getElementById("invoice-content");
    const opt = {
      margin: 0.1,
      filename: `${invoiceNum}_${invoiceDt}_invoice.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        console.log("PDF generated successfully!");
      })
      .catch((error: string) => {
        console.error("Error generating PDF:", error);
      });
  };

  // Split client address
  const addressParts = clientAddress
    ? clientAddress.split(",").map((part) => part.trim())
    : [];

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">
          Invoice {invoiceNumber}
        </h1>
        <div className="flex gap-3">
          <Link
            href={"/user/invoices"}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </Link>
          <button
            onClick={handleAttachmentsChange}
            // onClick={}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => clickPdf(invoiceNumber, invoiceDate)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save as PDF
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
                  <h2 className="font-medium">SESO Company</h2>
                  <div className="leading-none">
                    <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                      <span className="font-semibold leading-tight">
                        {client}
                      </span>
                      {addressParts.map((part, index) => (
                        <div key={index} className="regular-12 leading-tight">
                          {part}
                        </div>
                      ))}
                      <div className="flex flex-col justify-end">
                        <span>{phoneNumber}</span>
                        <p>{emailAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pl-11">
                <p className="block text-gray-600 regular-12 leading-tight underline"></p>
                <div className="">
                  <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                    <span className="underline">Client Details</span>
                    <span className="font-semibold leading-tight text-blue-700">
                      {client}
                    </span>
                    <span className="text-blue-700">
                      {addressParts.map((part, index) => (
                        <div key={index} className="regular-12 leading-tight">
                          {part}
                        </div>
                      ))}
                    </span>
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
            <div className="pl-24">
              <h2 className="regular-12 font-semibold mb-4">
                Bank Account Details
              </h2>
              <div className="regular-10">
                <div className="flex gap-2">
                  <span className="min-w-20">Name</span>
                  <span className="font-medium">SESO Engineering</span>
                </div>
                <div className="flex gap-2">
                  <span className="min-w-20">Bank</span>
                  <span className="font-medium">ABC Bank</span>
                </div>
                <div className="flex gap-2">
                  <span className="min-w-20">Branch</span>
                  <span className="font-medium">Colombo</span>
                </div>
                <div className="flex gap-2">
                  <span className="min-w-20 regular-10">Acc. Number</span>
                  <span className="font-medium">1234567890</span>
                </div>
              </div>
              {/* Note Section */}
              <div className="mt-3 regular-9 text-gray-600 max-w-md">
                Note: An interest of 2% per month will be levied for outstanding
                amounts, unless payment is made by duplicate Cheques to the
                credit in favor of &apos;SESO Engineering and crossed Account
                Payee Only&apos;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
