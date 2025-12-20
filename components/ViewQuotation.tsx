/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import html2pdf from "html2pdf.js";
import { getCompanyADataOfQuotaion } from "@/utils/getdata";

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
  clientName: string; // Fixed: was 'client' but API uses 'clientName'
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
  terms: string | string[]; // Fixed: terms can be string or array
  phoneNumber: string; // Fixed: changed from number to string
  emailAddress: string;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  additionalInfo: string;
  reference: string; // Added missing reference property
}

interface QuotationDetailPageProps {
  quoteArray: QuotationData;
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
const ViewQuotation: React.FC<QuotationDetailPageProps> = ({ quoteArray }) => {
  const {
    id,
    reference,
    subtotal,
    clientAddress,
    totalTax,
    // phoneNumber,
    // emailAddress,
    grandTotal,
    additionalInfo,
    quotationNumber,
    quotationDate,
    // clientName,
    table = [],
    terms = [],
  } = quoteArray;

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [referenceVal, setReference] = useState<string>(reference);
  // const [discountPercentage, setDiscountPercentage] = useState<number>(
  //   quoteArray.discountPercentage
  // );
  const [discountAmount, setDiscountAmount] = useState<number>(
    quoteArray.discountAmount
  );
  // const [taxPercentage, setTaxPercentage] = useState<number>(
  //   quoteArray.taxPercentage
  // );
  const [termsState, setTerms] = useState<string | string[]>(terms);

  const [rows, setRows] = useState<Row[]>(table);

  // File upload handling
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const [company, setCompany] = useState<CompanyClientDetails | null>(null);
  // const [companyLoading, setCompanyLoading] = useState(true);
  // console.log(quoteArray, "Q array")

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Function to generate PDF
  const clickPdf = () => {
    const element = document.getElementById("quotation-content");
    if (!element) {
      console.error("Quotation content element not found");
      return;
    }

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
      .catch((error : undefined) => {
        console.warn("Error generating PDF:", error);
      });
  };

  // Fetch company data when component mounts
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (id) {
        try {
          // setCompanyLoading(true);
          const companyData = await getCompanyADataOfQuotaion(id);
          // console.log(companyData, "Fetched company data");
          setCompany(companyData);
        } catch (error) {
          console.warn("Error fetching company:", error);
        } finally {
          // setCompanyLoading(false);
        }
      } else {
        // setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const addressParts = clientAddress
    ? clientAddress.split(",").map((part) => part.trim())
    : [];

  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDate(new Date().toLocaleDateString());
    }
  }, []);

  // Helper function to render terms
  const renderTerms = () => {
    if (Array.isArray(termsState)) {
      return (
        <ol className="list-decimal pl-5 regular-9">
          {termsState.map((term, index) => (
            <li key={index} className="mb-2 leading-none">
              {term}
            </li>
          ))}
        </ol>
      );
    } else if (typeof termsState === "string") {
      return (
        <div className="regular-9">
          {termsState.split("\n").map((line, index) => (
            <p key={index} className="mb-1 leading-none">
              {line}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-navy-900">View Quotation</h1>
        <div className="flex gap-3">
         
          <button
            onClick={clickPdf}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Take a PDF
          </button>
        </div>
      </div>

      <div
        id="quotation-content"
        className="max-w-3xl max-h-[150vh] text-base p-4 bg-white rounded-lg shadow relative"
      >
        <div className="regular-9 flex justify-end items-center absolute top-1 right-8">
          {currentDate}
        </div>

        {/* File Upload and Company Info */}
        <div className="grid grid-cols-2 gap-4 mb-3">
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
                  <h2 className="font-medium">{company?.companyName}</h2>
                  <div className="leading-none">
                    <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                      <span className="font-semibold leading-tight">
                        {company?.email}
                      </span>
                      <span>
                        {addressParts[0]}
                        {addressParts.slice(1).map((part, index) => (
                          <div key={index} className="regular-12 leading-tight">
                            {part}
                          </div>
                        ))}
                        <div className="flex flex-col justify-end">
                          {/* <span>{company?.clientPhone}</span>
                          <p>{company?.clientID}</p> */}
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pl-10">
                <div className="">
                  <div className="flex flex-col justify-center gap-0 regular-12 font-semibold">
                    <span className="underline">Client Details</span>
                    <div className="font-semibold text-xs leading-tight text-blue-700">
                      {company?.clientName}
                      <p>{company?.clientPhone}</p>
                      <p>{company?.clientID}</p>
                    </div>
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
              <tr className="border-gray-300 font-semibold regular-10 leading-none">
                <th className="text-center border w-[5vh]">Item</th>
                <th className="text-center border w-[47.5vh]">Description</th>
                <th className="text-center border">Unit</th>
                <th className="text-center border">Qty</th>
                <th className="text-center border">Rate</th>
                <th className="text-center w-[10vh] border">Total</th>
              </tr>
            </thead>
            <tbody className="leading-none">
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border border-1 regular-10 leading-tight border-gray-300 group hover:bg-gray-100 transition-colors"
                >
                  <td className="border text-center leading-none">
                    {index + 1}
                  </td>
                  <td className="border-1 leading-none cursor-pointer hover:bg-gray-100">
                    {row.description || "No description"}
                  </td>
                  <td className="border leading-none cursor-pointer text-center hover:bg-gray-100">
                    {row.unit || "_"}
                  </td>
                  <td className="px-1 border leading-none cursor-pointer text-center hover:bg-gray-100">
                    {row.qty || "0"}
                  </td>
                  <td className="px-1 border leading-none cursor-pointer text-center p-1 hover:bg-gray-100">
                    Rs. {row.rate?.toFixed(2) || "0.00"}
                  </td>
                  <td className="w-[10vh] text-center rounded focus:ring-2 focus:ring-blue-500 leading-none">
                    Rs. {row.total?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}

              {/* Totals section */}
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Subtotal</td>
                <td className="border text-center px-2">
                  Rs. {subtotal?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Discount</td>
                <td className="border text-center px-2">
                  Rs. {discountAmount?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Tax</td>
                <td className="border text-center px-2">
                  +Rs. {totalTax?.toFixed(2) || "0.00"}
                </td>
              </tr>
              <tr className="border-gray-300 regular-10 font-medium">
                <td colSpan={4} className=""></td>
                <td className="border text-center px-2">Quotation Total</td>
                <td className="border text-center px-2">
                  Rs. {grandTotal?.toFixed(2) || "0.00"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes & Terms */}
        <div className="space-y-4 regular-12 mt-4">
          {additionalInfo && (
            <div>
              <h3 className="font-semibold">Additional Information:</h3>
              <p className="regular-9">{additionalInfo}</p>
            </div>
          )}

          {termsState && (
            <div>
              <h3 className="font-semibold">Terms and Conditions:</h3>
              {renderTerms()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
