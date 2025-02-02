"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import Link from "next/link";
import html2pdf from "html2pdf.js";

type Row = {
  description: string;
  rate: number;
  qty: number;
  total: number;
  category: string;
};

const categories = [
  "Services",
  "Products",
  "Materials",
  "Labor",
  "Equipment",
  "Other",
];

const EditBillPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [billId, setBillId] = useState("0000001");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [billNumber, setBillNumber] = useState("0000001");
  const [taxPercentage, setTaxPercentage] = useState(0);

  const [rows, setRows] = useState<Row[]>([
    {
      description: "",
      category: "",
      rate: 0,
      qty: 0,
      total: 0,
    },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Calculate totals whenever rows or tax percentage changes
  useEffect(() => {
    const calculatedSubtotal = rows.reduce((sum, row) => sum + row.total, 0);
    const calculatedTax = (calculatedSubtotal * taxPercentage) / 100;

    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);
    setGrandTotal(calculatedSubtotal + calculatedTax);
  }, [rows, taxPercentage]);

  const handleInputChange = <K extends keyof Row>(
    index: number,
    field: K,
    value: Row[K]
  ) => {
    const updatedRows = [...rows];
    const row = updatedRows[index];
    row[field] = value;

    if (field === "rate" || field === "qty") {
      row.total = row.rate * row.qty;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        description: "",
        category: "",
        rate: 0,
        qty: 0,
        total: 0,
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  // Rest of the component remains the same until the totals section
  const clickPdf = () => {
    const element = document.getElementById("estimate-content");
    if (!element) return;

    const opt = {
      margin: 0.25,
      filename: `${billNumber}_${billDate}_invoice.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => console.log("PDF generated successfully!"))
      .catch((error) => console.error("Error generating PDF:", error));
  };

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
  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy-900">New Bill</h1>
        <div className="flex gap-3">
          <Link
            href="/user/bills"
            className="px-4 py-2 text-gray-600 rounded hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Save
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Send To...
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
        id="estimate-content"
        className="max-w-2xl max-h-[150vh] regular-12 p-6 bg-white rounded-lg shadow"
      >
        <div className="flex justify-between spacy">
          <div className="w-full flex flex-col justify-start space-y-6">
            <input
              type="text"
              placeholder="Add Vendor."
              className="p-2 text-2xl"
            />
            <div className="flex flex-row justify-start items-center gap-4 regular-12">
              <div className="flex flex-col">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="py-1 px-2"
                />
              </div>
              <div className="flex flex-col">
                <label>Due Date</label>
                <input type="date" className="py-1 px-2" />
              </div>
              <div className="flex flex-col">
                <label>Bill Number</label>
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="Bill number (optional)"
                  className="py-1 px-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div
              {...getRootProps()}
              className={`w-40  h-44 ${
                file ? "" : "border-2 border-dashed"
              } rounded-lg flex items-center justify-center cursor-pointer`}
            >
              <input {...getInputProps()} />
              {!file && (
                <p className="text-center text-gray-500p">
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
                    className="w-40 h-44 object-contain rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="my-4">
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Category</th>
                <th className="text-center p-2">Rate</th>
                <th className="text-center p-2">Qty</th>
                <th className="text-center p-2">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b group hover:bg-gray-100 transition-colors"
                >
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.description}
                      placeholder="Description..."
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      className={`w-full regular-12 p-2 rounded focus:ring-2 focus:ring-blue-500 ${
                        row.description ? "border-none" : "border-[0.5px]"
                      }`}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={row.category}
                      onChange={(e) =>
                        handleInputChange(index, "category", e.target.value)
                      }
                      className="w-full regular-12 p-2 rounded focus:ring-2 focus:ring-blue-500 border-[0.5px]"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.rate}
                      onChange={(e) =>
                        handleInputChange(index, "rate", Number(e.target.value))
                      }
                      className={`w-[10vh] regular-12 text-right p-2 rounded focus:ring-2 focus:ring-blue-500 ${
                        row.rate ? "border-none" : "border-[0.5px]"
                      }`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) =>
                        handleInputChange(index, "qty", Number(e.target.value))
                      }
                      className={`w-[10vh] regular-12 text-right p-2 rounded focus:ring-2 focus:ring-blue-500 ${
                        row.qty ? "border-none" : "border-[0.5px]"
                      }`}
                    />
                  </td>
                  <td className="p-2 text-right">Rs.{row.total.toFixed(2)}</td>
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
              className="w-full mt-2 py-1 border-2 border-transparent text-white bg-blue-600 rounded opacity-0 group-hover:opacity-100 group-hover:border-dashed group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300"
            >
              + Add a Line
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between ">
              <div>
                <span>Tax</span>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-10 regular-12 p-1 text-right rounded focus:ring-2 focus:ring-blue-500 border-[0.5px]"
                />
                <span>(%)</span>
              </div>
              <div>
                <span>Rs.{totalTax.toFixed(2)}</span>
              </div>
            </div>
            <div className="border border-spacing-1"></div>
            <div className="flex justify-between py-2 font-medium">
              <span>Bill Total</span>
              <span>Rs.{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBillPage;
