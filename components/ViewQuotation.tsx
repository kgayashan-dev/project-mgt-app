"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Ban } from "lucide-react";
import Link from "next/link";
import html2pdf from "html2pdf.js";
// import dynamic from "next/dynamic";

// Defining types for TypeScript
type Row = {
  description: string;
  rate: number;
  unit: string;
  qty: number;
  total: number;
};

interface QuotationData {
  id: string;
  quotationNumber: string;
  client: string;
  clientAddress: string;
  location: string;
  outstandingRevenue: number;
  rows: number;
  table: Row[];
  quotationDate: string;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  notes: string;
  terms: string;
  phoneNumber: number; // Default if missing
  emailAddress: string; // Default if missing
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  additionalInfo: string;
}

interface QuotationDetailPageProps {
  quoteArray: QuotationData; // Single quotation object
}

const ViewQuotation: React.FC<QuotationDetailPageProps> = ({ quoteArray }) => {
  const {
    reference,
    subtotal,
    clientAddress,
    totalTax,
    phoneNumber, // Default if missing
    emailAddress,
    grandTotal,
    additionalInfo,
    quotationNumber,
    quotationDate,
    clientName,
    table = [], // Default to an empty array if table is undefined
  } = quoteArray;

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  // const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });
  const [referenceVal, setReference] = useState<string>(quoteArray.reference);
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    quoteArray.discountPercentage
  );
  const [discountAmount, setDiscountAmount] = useState<number>(
    quoteArray.discountAmount
  );
  const [taxPercentage, setTaxPercentage] = useState<number>(
    quoteArray.taxPercentage
  );
  const [terms, setTerms] = useState<string>(quoteArray.terms);

  const [rows, setRows] = useState<Row[]>(quoteArray.table); // Handling table rows as state

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

  // Function to generate PDF
  const clickPdf = () => {
    const element = document.getElementById("quotation-content");
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
      .then(() => {
        console.log("PDF generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const addressParts = clientAddress
    ? clientAddress.split(",").map((part) => part.trim())
    : [];

  const [currentDate, setCurrentDate] = useState<string>("");

  // Use useEffect to set the current date only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDate(new Date().toLocaleDateString());
    }
  }, []); //
  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-navy-900">View Quotation</h1>
        <div className="flex gap-3 ">
          <Link
            href={"/user/quotations"}
            className="px-4 py-2 text-gray-600  rounded hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save
          </button>

          <button
            onClick={clickPdf}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div
        id="quotation-content"
        className="max-w-3xl  max-h-[150vh]  text-base p-4 bg-white rounded-lg shadow relative"
      >
        <div className="regular-9 flex justify-end items-center absolute top-1 right-8">
          {currentDate}
          {/* whci date is appeeared here? */}
        </div>
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
                <input {...getInputProps()} />
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
                    <div className="flex flex-col justify-center gap-0 regular-12 font-semibold ">
                      <span className="font-semibold leading-tight">
                        {clientName}
                      </span>
                      <span>
                        {addressParts[0]}
                        {addressParts.slice(1).map((part, index) => (
                          <div key={index} className="regular-12 leading-tight">
                            {part}
                          </div>
                        ))}
                        <div className="flex flex-col justify-end">
                          <span>{phoneNumber}</span>

                          <p>{emailAddress}</p>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pl-10">
                <p className="block text-gray-600 regular-12 leading-tight underline"></p>
                <div className="">
                  <div className="flex flex-col justify-center gap-0 regular-12 font-semibold ">
                    <span className="underline">Client Details</span>
                    <span className="font-semibold leading-tight  text-blue-700">
                      {clientName}
                    </span>
                    <span className=" text-blue-700">
                      {addressParts[0]}
                      {addressParts.slice(1).map((part, index) => (
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

          <div className="flex flex-col justify-between pl-12">
            <div className="regular-12">
              <p>Quotation</p>
            </div>
            <div className="flex flex-col justify-center">
              <span className="regular-12 leading-tight">
                QuotationNo: {quotationNumber}
              </span>
              <span className="regular-12 leading-tight">
                Date: {quotationDate}
              </span>
            </div>
            <div className="regular-12">Reference: {referenceVal}</div>
          </div>
        </div>
        {/* Table of Items */}
        <div className="my-1">
          <table className="w-full regular-1 border-gray-300 leading-none">
            <thead>
              <tr className=" border-gray-300 font-semibold regular-10 leading-none">
                <th className="text-center border   w-[5vh]">Item</th>
                <th className="text-center border w-[47.5vh]">Description</th>
                <th className="text-center border ">Unit</th>
                <th className="text-center border ">Qty</th>
                <th className="text-center border ">Rate</th>
                <th className="text-center w-[10vh] border">Total</th>
              </tr>
            </thead>
            <tbody className="leading-none">
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border border-1 regular-10 leading-tight border-gray-300 group hover:bg-gray-100 transition-colors"
                >
                  <td className="  border text-center leading-none ">
                    {index + 1}
                  </td>

                  {/* Description Field */}
                  <td className="border-1 leading-none cursor-pointer   hover:bg-gray-100">
                    {row.description || "No description"}
                  </td>

                  {/* Unit Field */}
                  <td className=" border leading-none cursor-pointer  text-center  hover:bg-gray-100">
                    {row.unit || "_"}
                  </td>

                  {/* Quantity Field */}
                  <td className="px-1 border leading-none cursor-pointer  text-center  hover:bg-gray-100">
                    {row.qty || "0"}
                  </td>

                  {/* Rate Field */}
                  <td className="px-1 border leading-none cursor-pointer  text-center p-1 hover:bg-gray-100">
                    {row.rate || "0"}
                  </td>

                  {/* Total Field */}
                  <td className="w-[10vh]   text-center rounded focus:ring-2 focus:ring-blue-500 leading-none">
                    Rs.{row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Totals section with colspan to push to right */}
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className=" border text-center px-2">Subtotal</td>
                <td className=" border text-center px-2">
                  Rs. {subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className=" border text-center px-2">Discount</td>
                <td className=" border text-center px-2">
                  Rs. {discountAmount.toFixed(2)}
                </td>
              </tr>

              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className=" border text-center px-2">Tax</td>
                <td className=" border text-center px-2">
                  +Rs. {totalTax.toFixed(2)}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10 font-medium">
                <td colSpan={4} className=""></td>
                <td className=" border text-center px-2">Quotation Total</td>
                <td className=" border text-center px-2">
                  Rs. {grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes & Terms */}
        <div className="space-y-4   regular-12 ">
          {terms && (
            <div>
              <h1>Terms and conditions</h1>

              <ol className="list-decimal pl-5 regular-9">
                {" "}
                {/* Added list styles for better spacing */}
                {terms.map((term, index) => (
                  <li key={index} className="mb-2 leading-none ">
                    {term}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
