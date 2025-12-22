/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";

// Types
type BillItem = {
  id: number;
  billId: string;
  description: string;
  categoryID: string;
  rate: number;
  qty: number;
  total: number;
};

type BillData = {
  id: string;
  billNumber: string;
  companyName: string;
  vendorId: string;
  issueDate: string;
  dueDate: string;
  emailAddress: string;
  phoneNumber: string;
  totalOutstanding: number;
  subTotal: number;
  tax: number;
  grandTotal: number;
  amountDue: number;
  status: string;
  totalTax: number;
  remarks: string;
  imagePath: string;
  imageUrl: string;
  table: BillItem[];
};

type Vendor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  address: string;
};

type Category = {
  categoryId: string;
  catDescription: string;
};

interface EditBillPageProps {
  vendorArray: Vendor[];
  categoryArray: Category[];
  billData: BillData;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EditBillPage: React.FC<EditBillPageProps> = ({
  vendorArray,
  categoryArray,
  billData,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [vendor, setVendor] = useState<Vendor | null>(
    vendorArray.find((v) => v.id === billData.vendorId) || null
  );
  const [remarks, setRemarks] = useState(billData.remarks || "");
  const [status, setStatus] = useState(billData.status || "Draft");
  const [taxPercentage, setTaxPercentage] = useState(billData.tax || 0);

  // Bill items rows
  const [rows, setRows] = useState(
    billData.table.map((item) => ({
      id: item.id,
      description: item.description,
      category: item.categoryID,
      rate: item.rate,
      qty: item.qty,
      total: item.total,
    }))
  );

  // Totals
  const [subtotal, setSubtotal] = useState(billData.subTotal || 0);
  const [totalTax, setTotalTax] = useState(billData.totalTax || 0);
  const [grandTotal, setGrandTotal] = useState(billData.grandTotal || 0);
  const [amountDue, setAmountDue] = useState(billData.amountDue || 0);

  // Calculate totals
  useEffect(() => {
    const calculatedSubtotal = rows.reduce((sum, row) => sum + row.total, 0);
    const calculatedTax = (calculatedSubtotal * taxPercentage) / 100;
    const calculatedGrandTotal = calculatedSubtotal + calculatedTax;

    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);
    setGrandTotal(calculatedGrandTotal);
    setAmountDue(calculatedGrandTotal);
  }, [rows, taxPercentage]);

  // Row handlers
  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedRows = [...rows];
    const row = updatedRows[index];
    (row as any)[field] = value;

    if (field === "rate" || field === "qty") {
      row.total = row.rate * row.qty;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([
      ...rows,
      {
        id: newId,
        description: "",
        category: "",
        rate: 0,
        qty: 0,
        total: 0,
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // File upload
  // const onDrop = (acceptedFiles: File[]) => {
  //   if (acceptedFiles.length > 0) {
  //     // setFile(acceptedFiles[0]);
  //   }
  // };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Validation
  const validateForm = (): boolean => {
    if (!vendor) {
      setError("Please select a vendor");
      return false;
    }

    if (rows.length === 0 || rows.some((row) => !row.description.trim())) {
      setError("Please add at least one item with description");
      return false;
    }

    return true;
  };

  // Update bill
  const handleUpdateBill = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedBillData = {
        ...billData,
        companyName: vendor?.companyName || "",
        vendorId: vendor?.id || "",
        emailAddress: vendor?.email || "",
        phoneNumber: vendor?.phone || "",
        status: status,
        subTotal: subtotal,
        tax: taxPercentage,
        totalTax: totalTax,
        grandTotal: grandTotal,
        amountDue: amountDue,
        remarks: remarks,
        table: rows.map((row) => ({
          id: row.id,
          billId: billData.id,
          description: row.description,
          categoryID: row.category,
          rate: row.rate,
          qty: row.qty,
          total: row.total,
        })),
      };

      const response = await fetch(
        `${API_URL}/project_pulse/Bill/updateBill/${billData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedBillData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update bill");
      }

      setSuccess("Bill updated successfully!");

      setTimeout(() => {
        router.push(`/user/bills/${billData.id}`);
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update bill"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure? All unsaved changes will be lost.")) {
      router.back();
    }
  };

  return (
    <div className="flex flex-col m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-900">
          Edit Bill: {billData.id} - {billData.billNumber}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 rounded hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateBill}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              "Update Bill"
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        </div>
      )}

      <div className="max-w-2xl max-h-[150vh] regular-12 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between space-y-6">
          <div className="w-full flex flex-col justify-start space-y-6">
            {/* Bill Info */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-medium">Bill ID:</span> {billData.id}
              </div>
              <div>
                <span className="font-medium">Bill Number:</span>{" "}
                {billData.billNumber}
              </div>
              <div>
                <span className="font-medium">Status:</span> {status}
              </div>
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <select
                value={vendor?.id || ""}
                onChange={(e) => {
                  const selectedVendor = vendorArray.find(
                    (v) => v.id === e.target.value
                  );
                  setVendor(selectedVendor || null);
                }}
                className="rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                required
              >
                <option value="" className="text-gray-500">
                  Select a Vendor
                </option>
                {vendorArray.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName} - {v.firstName} {v.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Details */}
            {vendor && (
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 p-3 rounded">
                <div>
                  <span className="font-medium">Company:</span>{" "}
                  {vendor.companyName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {vendor.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {vendor.phone}
                </div>
                <div>
                  <span className="font-medium">Address:</span> {vendor.address}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value;

                  if (newStatus !== status) {
                    const confirmed = window.confirm(
                      `Do you really want to change status from "${status}" to "${newStatus}"?Because this action might have implications on payment tracking and reporting.`
                    );

                    if (!confirmed) {
                      return;
                    }

                    setStatus(newStatus);
                  }
                }}
                className="py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                rows={3}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="flex justify-between">
            <div
              {...getRootProps()}
              className={`w-40 h-44 ${
                billData.imageUrl
                  ? ""
                  : "border-2 border-dashed border-gray-300"
              } rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500`}
            >
              <input {...getInputProps()} />
              {billData.imageUrl ? (
                <img
                  src={billData.imageUrl}
                  alt="Bill"
                  className="w-40 h-44 object-contain rounded"
                />
              ) : (
                <div className="text-center p-4">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-xs text-gray-500">
                    {isDragActive ? "Drop here" : "Upload image"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="my-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">Items</h3>
            <button
              onClick={addRow}
              className="px-4 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Item
            </button>
          </div>

          <table className="w-full mb-4">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="text-left p-3 text-xs font-medium text-gray-700">
                  Description
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700">
                  Category
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700">
                  Rate
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700">
                  Qty
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-700">
                  Total
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3">
                    <SearchableSelect
                      options={categoryArray.map((cat) => ({
                        value: cat.categoryId,
                        label: cat.catDescription,
                      }))}
                      value={row.category}
                      onChange={(value) =>
                        handleInputChange(index, "category", value)
                      }
                      className="w-full"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={row.rate || ""}
                      onChange={(e) =>
                        handleInputChange(index, "rate", Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={row.qty || ""}
                      onChange={(e) =>
                        handleInputChange(index, "qty", Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </td>
                  <td className="p-3 text-right font-medium">
                    Rs.{row.total.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 bg-gray-100 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Tax</span>
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-16 p-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <span className="font-medium">Rs.{totalTax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Grand Total</span>
                  <span>Rs.{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Amount Due</span>
                  <span>Rs.{amountDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBillPage;
