"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import Link from "next/link";
import html2pdf from "html2pdf.js";

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
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  additionalInfo: string;
}

interface QuotationDetailPageProps {
  quoteArray: QuotationData; // Single quotation object
}

const EditQuotation: React.FC<QuotationDetailPageProps> = ({ quoteArray, myCompany }) => {
  const {
    reference,
    subtotal,
    totalTax,
    grandTotal,
    additionalInfo,
    quotationNumber,
    quotationDate,
    client,
    table = [], // Default to an empty array if table is undefined
  } = quoteArray;

 
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [quotDate, setQuotationDate] = useState<string>(
    quoteArray.quotationDate
  ); // Added state for quotation date
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
  const [notes, setNotes] = useState<string>(quoteArray.notes);
  const [rows, setRows] = useState<Row[]>(quoteArray.table); // Handling table rows as state

  // State for editable fields
  const [isEditing, setIsEditing] = useState(true);
  const [isQuotationNumberEditing, setIsQuotationNumberEditing] =
    useState(true);
  const [isAdditionalInfoEditing, setIsAdditionalInfoEditing] = useState(true);

  const [isDiscountEditing, setIsDiscountEditing] = useState(true);
  const [isTaxEditing, setIsTaxEditing] = useState(true);

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

  // Function to update rows dynamically
  const handleInputChange = (
    index: number,
    field: keyof Row,
    value: string | number
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // Handle adding a new row
  const addRow = () => {
    const newRow: Row = {
      description: "",
      rate: 0,
      unit: "",
      qty: 0,
      total: 0,
    };
    setRows([...rows, newRow]);
  };

  // Handle deleting a row
  const deleteRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  // Function to generate PDF
  const clickPdf = () => {
    const element = document.getElementById("quotation-content");
    const opt = {
      margin: 0.25,
      filename: `${quotationNumber}_${quotationDate}_quotation.pdf`,
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
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">View Quotation</h1>
        <div className="flex gap-3">
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
        className="max-w-3xl  max-h-[150vh]  text-base p-8 bg-white rounded-lg shadow"
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

          <div className="text-right regular-14">
            <h2 className="font-medium">Gayashan&apos;s Company</h2>
            <p className="text-gray-600">0705889612</p>
            <p className="text-gray-600">United States</p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3 ">
          <div>
            <label className="block text-gray-600 regular-14 mb-2">
              Client Details
            </label>
            <div className="">
              <div className="flex flex-col regular-14 text-blue-700">
                <span className="font-semibold">{client}</span>
              </div>
              <button
                className="self-start text-xs text-white hover:text-red-500"
                onClick={() => {}}
              >
                Remove client
              </button>
            </div>

            <div className="mt-2 regular-12">
              {isAdditionalInfoEditing ? (
                <input
                  type="text"
                  placeholder="Additional info..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  onBlur={() => setIsAdditionalInfoEditing(false)}
                  className="w-full p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span
                  onClick={() => setIsAdditionalInfoEditing(true)}
                  className="cursor-pointer py-4 regular-12 w-full rounded transition-colors"
                >
                  {additionalInfo ? `Additional Info : ${additionalInfo}` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="w-full max-w-xs ">
            <label className="block regular-14 text-gray-600 mb-2">
              Quotation Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={quotDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full regular-12 p-1 rounded focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="regular-12">{quotationDate}</p>
            )}
          </div>

          <div className="w-full max-w-xs">
            <label className="block regular-14 text-gray-600 mb-2">
              Reference
            </label>
            <input
              type="text"
              value={referenceVal}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-1 rounded regular-12 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table of Items */}
        <div className="my-4">
          <table className="w-full regular-12  border border-gray-300 border-collapse">
            <thead>
              <tr className=" border-gray-300 font-semibold text-sm">
                <th className="text-left border  p-2">Item</th>
                <th className="text-left border w-96 p-2">Description</th>
                <th className="text-left border p-2">Unit</th>
                <th className="text-left border p-2">Qty</th>
                <th className="text-left border p-2">Rate</th>
                <th className="text-right w-[10vh] p-2">Total</th>
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

                  {/* Description Field */}
                  <td className="px-1 border-1">
                    {isDescriptionEditing[index] ? (
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
                        onBlur={() => {
                          const updatedEditing = [...isDescriptionEditing];
                          updatedEditing[index] = false;
                          setIsDescriptionEditing(updatedEditing);
                        }}
                        className={`w-full regular-12 p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                          row.description ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          const updatedEditing = [...isDescriptionEditing];
                          updatedEditing[index] = true;
                          setIsDescriptionEditing(updatedEditing);
                        }}
                        className="cursor-pointer regular-12 p-1 hover:bg-gray-100"
                      >
                        {row.description || "No description"}
                      </span>
                    )}
                  </td>

                  {/* Unit Field */}
                  <td className="px-1 border">
                    {isUnitEditing[index] ? (
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          handleInputChange(index, "unit", e.target.value)
                        }
                        onBlur={() => {
                          const updatedEditing = [...isUnitEditing];
                          updatedEditing[index] = false;
                          setIsUnitEditing(updatedEditing);
                        }}
                        className={`max-w-[50px] regular-12 p-1 text-left rounded focus:ring-2 focus:ring-blue-500 ${
                          row.unit ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          const updatedEditing = [...isUnitEditing];
                          updatedEditing[index] = true;
                          setIsUnitEditing(updatedEditing);
                        }}
                        className="cursor-pointer text-[12px] text-left p-1 hover:bg-gray-100"
                      >
                        {row.unit || "_"}
                      </span>
                    )}
                  </td>

                  {/* Quantity Field */}
                  <td className="px-1 border">
                    {isQtyEditing[index] ? (
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
                        onBlur={() => {
                          const updatedEditing = [...isQtyEditing];
                          updatedEditing[index] = false;
                          setIsQtyEditing(updatedEditing);
                        }}
                        className={`w-[10vh] regular-12 text-left p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                          row.qty ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          const updatedEditing = [...isQtyEditing];
                          updatedEditing[index] = true;
                          setIsQtyEditing(updatedEditing);
                        }}
                        className="cursor-pointer regular-12 text-left p-1 hover:bg-gray-100"
                      >
                        {row.qty || "0"}
                      </span>
                    )}
                  </td>

                  {/* Rate Field */}
                  <td className="px-1 border">
                    {isRateEditing[index] ? (
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
                        onBlur={() => {
                          const updatedEditing = [...isRateEditing];
                          updatedEditing[index] = false;
                          setIsRateEditing(updatedEditing);
                        }}
                        className={`w-[10vh] regular-12 text-start p-1 rounded focus:ring-2 focus:ring-blue-500 ${
                          row.rate ? "border-none" : "border-[0.5px]"
                        }`}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          const updatedEditing = [...isRateEditing];
                          updatedEditing[index] = true;
                          setIsRateEditing(updatedEditing);
                        }}
                        className="cursor-pointer regular-12 text-start p-1 hover:bg-gray-100"
                      >
                        {row.rate || "0"}
                      </span>
                    )}
                  </td>

                  {/* Total Field */}
                  <td className="w-[10vh] regular-12 pl-2 text-left rounded focus:ring-2 focus:ring-blue-500">
                    Rs.{row.total.toFixed(2)}
                  </td>

                  {/* Delete Button */}
                  <td className="p-2 text-center">
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
        {/* Totals */}
        <div className="flex justify-end mb-8   regular-14">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            {/* Discount Input */}
            <div className="flex justify-between py-1">
              <div className="flex  regular-14 justify-center items-center ">
                <div>
                  {" "}
                  Discount
                  {isDiscountEditing ? (
                    <input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) =>
                        setDiscountPercentage(Number(e.target.value))
                      }
                      onBlur={() => setIsDiscountEditing(false)}
                      className={` rounded focus:ring-2 focus:ring-blue-500 ${
                        discountPercentage ? "border-none" : "border-[0.5px]"
                      }`}
                      min="0"
                      max="100"
                    />
                  ) : (
                    <span
                      onClick={() => setIsDiscountEditing(true)}
                      className="cursor-pointer   ml-2"
                    >
                      {discountPercentage}%
                    </span>
                  )}
                </div>
              </div>

              <span className="text-red-500">
                -Rs. {discountAmount.toFixed(2)}
              </span>
            </div>

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
                      className={`rounded focus:ring-2 focus:ring-blue-500 ${
                        taxPercentage ? "border-none" : "border-[0.5px]"
                      }`}
                      min="0"
                      max="100"
                    />
                  ) : (
                    <span
                      onClick={() => setIsTaxEditing(true)}
                      className="cursor-pointer  ml-2"
                    >
                      {taxPercentage}%
                    </span>
                  )}
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
        <div className="space-y-4   regular-14 ">
          <div>
            <label className="block text-gray-600 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes (optional)"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Terms</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter terms or conditions (optional)"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuotation;
