"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt, FaImage, FaFilePdf } from "react-icons/fa";
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
  terms: string;
  invoiceReference: string;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  additionalInfo: string;
}

interface InvoiceDetailPageProps {
  invoiceArray: InvoiceArray;
}

const ViewInvoice: React.FC<InvoiceDetailPageProps> = ({ invoiceArray }) => {
  const {
    client,
    invoiceNumber,
    invoiceDate,
    invoiceDueDate,
    location,
    table = [],
    subtotal,
    totalTax,
    grandTotal,
    notes,
    terms,
    additionalInfo,
    discountPercentage,
    invoiceReference,
    taxPercentage,
  } = invoiceArray;

  // State management
  const [clientName, setClientName] = useState(client);
  //   const [invNumber, setInvoiceNumber] = useState(invoiceNumber);
  const [invDate, setInvoiceDate] = useState(invoiceDate);
  const [dueDate, setInvoiceDueDate] = useState(invoiceDueDate);
  const [invoiceLocation, setLocation] = useState(location);

  const [tableRows, setTableRows] = useState<Row[]>(table);
  const [subTotal, setSubTotal] = useState(subtotal);
  const [totalTaxAmount, setTotalTaxAmount] = useState(totalTax);
  const [grandTotalAmount, setGrandTotalAmount] = useState(grandTotal);
  const [invNotes, setNotes] = useState(notes);
  const [invTerms, setTerms] = useState(terms);
  const [reference, setReference] = useState(invoiceReference);
  const [additionalInfoState, setAdditionalInfoState] =
    useState(additionalInfo);

  // Ensure these arrays are correctly initialized based on rows.lengt

  // File upload state
  const [file, setFile] = useState<File | null>(null);

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

  // Delete a row from the table
  const deleteRow = (index: number) => {
    setTableRows(tableRows.filter((_, rowIndex) => rowIndex !== index));
  };

  // file attachment segment

  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

 
  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      attachments.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [attachments]);

  // save funtion
  const handleAttachmentsChange = () => {
    alert("Attachments SAVE");
  };

  const clickPdf = (invoiceNum: string, invoiceDt: string) => {
    // Get the invoice content element
    const element = document.getElementById("invoice-content");

    const opt = {
      margin: 0.25,
      filename: `${invoiceNum}_${invoiceDt}_invoice.pdf`, // Dynamically set filename
      html2canvas: { scale: 2 }, // Optional: Increase scale for better quality
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }, // Optional: Adjust PDF format
    };

    // Generate PDF
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        console.log("PDF generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  //   const [isTaxEditing, setIsTaxEditing] = useState(true);

  return (
    // data-html2canvas-ignore> this can use for hiding data
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">
          {" "}
          Invoice {invoiceNumber}
        </h1>
        <div className="flex gap-3">
          <Link
            href={"/user/Invoices"}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded "
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
            onClick={() => clickPdf(invoiceNumber, invoiceDate)} // Pass
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div
        id="invoice-content"
        className="max-w-3xl  max-h-[150vh]   regular-14 p-8 bg-white rounded-lg shadow"
      >
        {/* File Upload and Company Info */}
        <div className="flex justify-between mb-8">
          <div
            {...getRootProps()}
            className={`w-64 h-32 ${
              file ? "" : "border-2 border-dashed"
            } rounded-lg flex items-center justify-center cursor-pointer`}
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
                  className="w-64 h-32 object-contain rounded"
                />
              </div>
            )}
          </div>

          <div className="text-right">
            <h2 className="font-medium">Gayashan&apos;s Company</h2>
            <p className="text-gray-600">0705889612</p>
            <p className="text-gray-600">United States</p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-4 gap-4 mb-3  w-full">
          <div className="flex flex-col justify-start items-start">
            <div>
              <label className="block text-gray-600 mb-2  regular-14">
                Client Details
              </label>

              <div className="">
                <div className="flex flex-col regular-14 text-blue-700">
                  <span className="font-semibold">{clientName}</span>
                  <span className="">{invoiceLocation}</span>
                </div>
                <button
                  className="self-start text-xs text-white hover:text-red-500"
                  onClick={() => {}}
                >
                  Remove client
                </button>
              </div>

              <div className="my-6 regular-12">
                <span className="font-semibold">Additional Info: </span>
                {additionalInfo ? additionalInfo : ""}
              </div>
            </div>
          </div>

          <div>
            <div>
              <label className="block text-gray-600 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={`w-[15vh] regular-14 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                  invDate ? "border-none" : "border-[0.5px]"
                }`}
              />
            </div>

            <label className="block text-gray-600"> Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setInvoiceDueDate(e.target.value)}
              className={`w-[15vh]  regular-14 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                dueDate ? "border-none" : "border-[0.5px]"
              }`}
            />
          </div>
          <div>
            <label className="block text-gray-600 ">Invoice Number</label>

            <span className="cursor-pointer regular-14 px-2 hover:bg-gray-100">
              {invoiceNumber || "Invoice Number"}
            </span>

            {/* Reference */}
            <div className="w-full max-w-xs">
              <label className="block regular-14 text-gray-600 mb-2">
                Reference
              </label>
              <p>{reference}</p>
            </div>
          </div>
          <div className="flex justify-end items-start">
            <div>
              <p className="text-sm text-gray-60">Amount Due (LKR)</p>
              <h1 className="text-3xl text-right">Rs.{grandTotal}</h1>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-2">
          <table className="w-full  text-[12px] mb- border border-gray-300 border-collapse">
            <thead>
              <tr className=" border-gray-300 font-semibold text-sm">
                <th className="text-left border  p-2">Item</th>
                <th className="text-left border w-96 p-2">Description</th>
                <th className="text-left border p-2">Unit</th>
                <th className="text-left border p-2">Qty</th>
                <th className="text-left border p-2">Rate</th>
                <th className="text-right  p-2">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr
                  key={index}
                  className="border border-1 border-gray-300 group hover:bg-gray-100 transition-colors"
                >
                  <td className="p-1 border text-center">{index + 1}</td>
                  <td className="p-1 border">
                    <span
                      // onClick={() => setIsDescriptionEditing(true)}
                      className="cursor-pointer regular-12  hover:bg-gray-100"
                    >
                      {row.description || "No description"}
                    </span>
                  </td>

                  <td className="px-1 border">
                    <span className="cursor-pointer text-[12px] text-left p-1 hover:bg-gray-100">
                      {row.unit || "_"}
                    </span>
                  </td>

                  <td className="px-1 border">
                    <span
                      // onClick={() => setIsQtyEditing(true)}
                      className="cursor-pointer text-[12px] text-center p-1 hover:bg-gray-100"
                    >
                      {row.qty || "0"}
                    </span>
                  </td>

                  <td className="px-1 border">
                    <span
                      // onClick={() => setIsRateEditing(true)}
                      className="cursor-pointer text-[12px] text-center p-1 hover:bg-gray-100"
                    >
                      {row.rate || "0"}
                    </span>
                  </td>

                  <td className="w-[10vh] text-[12px] pl-2 text-center rounded focus:ring-2 focus:ring-blue-500 ">
                    Rs.{row.total.toFixed(2)}
                  </td>

                  <td className="p-1 text-center">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="relative group w-full">
            {/* <button
              onClick={addRow}
              className="w-full mt-2 py-2 border-2 border-transparent text-white bg-blue-600 rounded opacity-0 group-hover:opacity-100 group-hover:border-dashed group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300"
            >
              + Add a Line
            </button> */}
          </div>
        </div>

        <div className="flex justify-end mb-8  regular-14">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            {/* Discount Input */}

            <div className="flex justify-between items-center py-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="cursor-pointer  ml-2">
                    {/* {invTaxPercentage || 0}% */}
                  </span>
                </div>
              </div>
              <span className="text-red-500">+Rs. {totalTax.toFixed(2)}</span>
            </div>

            <div className="border border-spacing-1"></div>
            <div className="flex justify-between py-2 font-medium">
              <span>Quotation Total</span>
              <span>
                Rs.{" "}
                {grandTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="border-2 border-separate"></div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-2">
              {invNotes ? "Notes" : ""}
            </label>
            <textarea
              value={invNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes (optional)"
              className={`w-full  regular-14 p-2 rounded focus:ring-2 focus:ring-blue-500 ${
                invNotes ? "border-none" : "border-[0.5px]"
              }`}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">
              {invTerms ? "Terms" : ""}
            </label>
            <textarea
              value={invTerms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter terms or conditions (optional)"
              className={`w-full  regular-14 p-2 rounded focus:ring-2 focus:ring-blue-500 ${
                invTerms ? "border-none" : "border-[0.5px]"
              }`}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
