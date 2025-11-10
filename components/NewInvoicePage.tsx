"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";

import Link from "next/link";
import html2pdf from "html2pdf.js";

type Row = {
  description: string;
  rate: number;
  tax: number;
  qty: number;
  total: number;
  unit: string;
  taxAmount: number;
};

interface NewInvoiceProps {
  initialData: object;
  name: string; // Adjust the type according to your data structure
}

const InvoiceForm: React.FC<NewInvoiceProps> = ({ initialData }) => {
  // File upload state
  const [file, setFile] = useState<File | null>(null);

  // Client form state
  const [client, setClient] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [invoiceDueDate, setInvoiceDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [invoiceNumber, setInvoiceNumber] = useState("0000001");
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
      // Calculate tax for each row
      const rowTax = row.total * (taxPercentage / 100);
      calculatedTax += rowTax;
    });

    //  const calculatedDiscount = (calculatedSubtotal * discountPercentage) / 100;

    //  setDiscountAmount(calculatedDiscount);
    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);
    setGrandTotal(calculatedSubtotal + calculatedTax);
  }, [rows, discountPercentage, taxPercentage]);

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

  // file attachment segment

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

  const hasNotes = notes.trim() !== "";
  const hasTerms = terms.trim() !== "";

  return (
    // data-html2canvas-ignore> this can use for hiding data
    <div className="flex flex-col m-8 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">New Invoice</h1>
        <div className="flex gap-3">
          <Link
            href={"/user/invoices"}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded "
          >
            Cancel
          </Link>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
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
                {/* <p className=" regular-14 mt-2 text-gray-600">{file.name}</p> */}
              </div>
            )}
          </div>

          <div className="text-right">
            <h2 className="font-medium">Gayashan&apos;s Company</h2>
            <p className="text-gray-600">0705889612</p>
            <p className="text-gray-600">United States</p>
            {/* <button className="text-blue-600 hover:underline  regular-14">
              Edit Business Information
            </button> */}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-4 gap-4 mb-3  w-full text-xs">
          <div className="flex flex-col justify-start items-start ">
            <div>
              <label className="block text-gray-600 mb-2">
                Client Details
              </label>
              {/* Conditionally show the select dropdown if no client is selected */}
              {!client && (
                <select
                  value={client?.name || ""}
                  onChange={(e) => {
                    const selectedClient = initialData.find(
                      (clientOption) => clientOption.name === e.target.value
                    );
                    setClient(selectedClient || null); // Set the selected client
                  }}
                  className={`text-sm rounded  text-[13px] p-2 focus:ring-2 focus:ring-blue-500 border-[0.5px]`}
                >
                  <option value="">Select a Client</option>
                  {initialData.map((clientOption) => (
                    <option key={clientOption.name} value={clientOption.name}>
                      {clientOption.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Show client details if a client is selected */}
              {client && (
                <div className="">
                  <div className="flex flex-col text-blue-700  regular-14">
                    <span className="font-semibold">{client.name}</span>
                    <div className="flex flex-col justify-normal -gap-1">
                      <span>{client.initials}</span>
                      <span>{client.businessType}</span>
                      <span>{client.location}</span>
                    </div>
                  </div>
                  <button
                    className="self-start text-xs text-white hover:text-red-500"
                    onClick={() => setClient(null)} // Reset the client selection
                  >
                    Remove client
                  </button>
                </div>
              )}
              <div className="mt-2  regular-14">
                {isAdditionalInfoEditing ? (
                  <input
                    type="text"
                    placeholder="Additional info..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    onBlur={() => setIsAdditionalInfoEditing(false)}
                    className={`w-  regular-14 p-2 rounded focus:ring-2 focus:ring-blue-500 ${
                      additionalInfo ? "border-none" : "border-[0.5px]"
                    }`}
                  />
                ) : (
                  <p
                    onClick={() => setIsAdditionalInfoEditing(true)}
                    className="cursor-pointer  regular-14 py-4  rounded hover:bg-gray-200 transition-colors"
                  >
                    <span>
                      {additionalInfo
                        ? `Additional Info : ${additionalInfo}`
                        : ""}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div>
              <label className="block text-gray-600 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={`w-[15vh] regular-14 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                  invoiceDate ? "border-none" : "border-[0.5px]"
                }`}
              />
            </div>

            <label className="block text-gray-600"> Due date</label>
            <input
              type="date"
              value={invoiceDueDate}
              onChange={(e) => setInvoiceDueDate(e.target.value)}
              className={`w-[15vh]  regular-14 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                invoiceDueDate ? "border-none" : "border-[0.5px]"
              }`}
            />
          </div>
          <div>
            <label className="block text-gray-600 ">Invoice Number</label>
            {isInvoiceNumberEditing ? (
              <input
                type="text"
                value={invoiceNumber}
                placeholder="Invoice Number..."
                onChange={(e) => setInvoiceNumber(e.target.value)}
                onBlur={() => setIsInvoiceNumberEditing(false)}
                className={`w-full regular-14 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                  invoiceNumber ? "border-none" : "border-[0.5px]"
                }`}
              />
            ) : (
              <p
                onClick={() => setIsInvoiceNumberEditing(true)}
                className="cursor-pointer regular-14 px-2 hover:bg-gray-100"
              >
                {invoiceNumber || "Invoice Number"}
              </p>
            )}

            {/* Reference */}
            <div className="my-3 text-left">
              <label className="block  regular-14 text-gray-600 ">
                Reference
              </label>
              {isReferenceEditing ? (
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  onBlur={() => setIsReferenceEditing(false)}
                  placeholder="Enter value (e.g. PO #)"
                  className={`w-full  regular-14  rounded focus:ring-2 focus:ring-blue-500 ${
                    reference ? "border-none" : "border-[0.5px]"
                  }`}
                />
              ) : (
                <p
                  onClick={() => setIsReferenceEditing(true)}
                  className="cursor-pointer  regular-14 px-1  rounded hover:bg-gray-200 transition-colors"
                >
                  {reference}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end items-start">
            <div className="flex flex-col gap-4 ">
              <div>
                <div className=" duration-300">
                  <label className="block text-gray-600 mb-2">
                    Search and select quotation
                  </label>
                  <select name="" id="">
                    <option value="">Q1</option>
                    <option value="">Q2</option>
                    <option value="">Q2</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-60">Amount Due (LKR)</p>
                <h1 className="text-3xl text-right">Rs.{grandTotal}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-2">
          <table className="w-full  text-[12px] mb- border border-gray-300 border-collapse">
            <thead>
              <tr className=" border-gray-300 font-semibold text-xs">
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
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border border-1 border-gray-300 group hover:bg-gray-100 transition-colors"
                >
                  <td className="p-1 border text-center">{index + 1}</td>
                  <td className="p-1 border">
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
                        className={`w-full regular-12 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                          row.description ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => setIsDescriptionEditing(true)}
                        className="cursor-pointer regular-12  hover:bg-gray-100"
                      >
                        {row.description || "No description"}
                      </span>
                    )}
                  </td>

                  <td className="px-1 border">
                    {isUnitEditing ? (
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          handleInputChange(index, "unit", e.target.value)
                        }
                        onBlur={() => setIsUnitEditing(false)}
                        className={`max-w-[50px] regular-12 p-1 text-left rounded focus:ring-2 focus:ring-blue-500 ${
                          row.unit ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => setIsUnitEditing(true)}
                        className="cursor-pointer text-[12px] text-left p-1 hover:bg-gray-100"
                      >
                        {row.unit || "_"}
                      </span>
                    )}
                  </td>

                  <td className="px-1 border">
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
                        className={`max-w-[50px] regular-12 text-center p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                          row.qty ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => setIsQtyEditing(true)}
                        className="cursor-pointer text-[12px] text-center p-1 hover:bg-gray-100"
                      >
                        {row.qty || "0"}
                      </span>
                    )}
                  </td>

                  <td className="px-1 border">
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
                        className={`max-w-[50px] regular-12 text-center p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                          row.rate ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => setIsRateEditing(true)}
                        className="cursor-pointer text-[12px] text-center p-1 hover:bg-gray-100"
                      >
                        {row.rate || "0"}
                      </span>
                    )}
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
            <button
              onClick={addRow}
              className="w-full mt-2 py-2 border-2 border-transparent text-white bg-blue-600 rounded opacity-0 group-hover:opacity-100 group-hover:border-dashed group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300"
            >
              + Add a Line
            </button>
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

            <div className="border border-spacing-1"></div>
            <div className="flex flex-col justify-normal gap-4">
              <div className="flex justify-between py-2 font-medium">
                <span>Invoice Total</span>
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
            <div>
              <div className="mt-4">
                <div className=" duration-300">
                  <label className="block text-gray-600 mb-2">
                    Search and select Bank acc
                  </label>
                  <select name="" id="">
                    <option value="">Bank of Ceylon - 1234567890</option> 
                    <option value="">Bank of Ceylon - 1234567890</option> 
                    <option value="">Bank of Ceylon - 1234567890</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="space-y-4">
          {/* Notes Section */}
          {hasNotes && (
            <div className="relative">
              <label className="block text-gray-600 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes (optional)"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}

          {/* Terms Section */}
          {hasTerms && (
            <div className="relative">
              <label className="block text-gray-600 mb-2">Terms</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter terms or conditions (optional)"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}

          {/* Hidden Fields that Appear on Hover */}
          {!hasNotes && !hasTerms && (
            <div
              className="relative group"
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              {/* <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label className="block text-gray-600 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes (optional)"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div> */}

              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label className="block text-gray-600 mb-2">Notes</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Enter terms or conditions (optional)"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
