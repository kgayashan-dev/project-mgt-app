"use client";
import React, { useState, useEffect } from "react";

type Row = {
  description: string;
  rate: number;
  tax: number;
  qty: number;
  total: number;
  unit: string;
  taxAmount: number;
};

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  client: string;
  location: string;
  outstandingRevenue: number;
  rows: Row[];
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

interface InvoiceDetailPageProps {
  initialData: InvoiceData; // Ensure this matches the structure of your invoice data
}

const InvoiceForm: React.FC<InvoiceDetailPageProps> = ({ initialData }) => {
  // Destructuring the incoming data from props
  const {
    client,
    invoiceNumber,
    invoiceDate,
    location,
    rows = [], // Default to empty array if rows are undefined
    subtotal,
    totalTax,
    grandTotal,
    notes,
    terms,
    additionalInfo,
    discountPercentage,
    discountAmount,
    taxPercentage,
  } = initialData;

  console.log(initialData);

  // State Management
  const [clientName, setClientName] = useState(client);
  const [invNumber, setInvNumber] = useState(invoiceNumber);
  const [invDate, setInvDate] = useState(invoiceDate);
  const [invLocation, setInvLocation] = useState(location);

  const [tableRows, setTableRows] = useState<Row[]>(rows);

  const [subTotal, setSubTotal] = useState(subtotal);
  const [totalTaxAmount, setTotalTaxAmount] = useState(totalTax);
  const [grandTotalAmount, setGrandTotalAmount] = useState(grandTotal);

  const [invoiceNotes, setInvoiceNotes] = useState(notes);
  const [invoiceTerms, setInvoiceTerms] = useState(terms);

  const [discountPercent, setDiscountPercent] = useState(discountPercentage);
  const [discountAmt, setDiscountAmt] = useState(discountAmount);

  const [taxPercent, setTaxPercent] = useState(taxPercentage);

  const [additionalInfoField, setAdditionalInfoField] =
    useState(additionalInfo);

  // Editable states for table rows
  const [isEditingRow, setIsEditingRow] = useState<boolean[]>(
    new Array(rows.length).fill(false)
  );

  // Handle table row updates
  const handleRowChange = (index: number, field: keyof Row, value: any) => {
    const updatedRows = [...tableRows];
    updatedRows[index][field] = value;

    if (field === "rate" || field === "qty") {
      updatedRows[index].total =
        updatedRows[index].rate * updatedRows[index].qty; // Update total
      updatedRows[index].taxAmount =
        (updatedRows[index].total * taxPercent) / 100; // Update tax amount
    }

    setTableRows(updatedRows);

    // Recalculate totals
    recalculateTotals(updatedRows);
  };

  // Recalculate totals based on rows
  const recalculateTotals = (rows: Row[]) => {
    let newSubtotal = rows.reduce((sum, row) => sum + row.total, 0);
    let newTotalTax = rows.reduce((sum, row) => sum + row.taxAmount, 0);

    let newDiscountAmount = (newSubtotal * discountPercent) / 100;

    let newGrandTotal = newSubtotal + newTotalTax - newDiscountAmount;

    setSubTotal(newSubtotal);
    setTotalTaxAmount(newTotalTax);
    setDiscountAmt(newDiscountAmount);
    setGrandTotalAmount(newGrandTotal);
  };

  // Add a new row to the table
  const addRow = () => {
    setTableRows([
      ...tableRows,
      {
        description: "",
        rate: 0,
        tax: taxPercent,
        qty: 0,
        total: 0,
        unit: "",
        taxAmount: 0,
      },
    ]);
  };

  // Delete a row from the table
  const deleteRow = (index: number) => {
    setTableRows(tableRows.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Details</h1>

      {/* Client Information */}
      <div className="mb-4">
        <label className="block font-semibold">Client:</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Invoice Number:</label>
        <input
          type="text"
          value={invNumber}
          onChange={(e) => setInvNumber(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Invoice Date:</label>
        <input
          type="date"
          value={invDate}
          onChange={(e) => setInvDate(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Location:</label>
        <input
          type="text"
          value={invLocation}
          onChange={(e) => setInvLocation(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      {/* Table of Items */}
      <h2 className="text-lg font-bold mt-6 mb-2">Items</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Unit</th>
            <th className="border px-4 py-2">Qty</th>
            <th className="border px-4 py-2">Rate</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleRowChange(index, "description", e.target.value)
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={row.unit}
                  onChange={(e) =>
                    handleRowChange(index, "unit", e.target.value)
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) =>
                    handleRowChange(index, "qty", Number(e.target.value))
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleRowChange(index, "rate", Number(e.target.value))
                  }
                  className="border border-gray-300 rounded p-1 w-full"
                />
              </td>
              <td className="border px-4 py-2">${row.total.toFixed(2)}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => deleteRow(index)}
                  className="bg-red-500 text-white rounded px-[6px]"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6">
        <h3>Subtotal: ${subTotal.toFixed(2)}</h3>
        <h3>Total Tax: ${totalTaxAmount.toFixed(2)}</h3>
        <h3>Grand Total: ${grandTotalAmount.toFixed(2)}</h3>
      </div>

      {/* Notes and Terms */}
      {invoiceNotes && (
        <>
          <h3 className="text-sm font-semibold mt-4">Notes</h3>
          <p>{invoiceNotes}</p>
        </>
      )}

      {invoiceTerms && (
        <>
          <h3 className="text-sm font-semibold mt-4">Terms</h3>
          <p>{invoiceTerms}</p>
        </>
      )}

      {additionalInfoField && (
        <>
          <h3 className="text-sm font-semibold mt-4">Additional Information</h3>
          <p>{additionalInfoField}</p>
        </>
      )}

      {/* PDF Generation Button */}
      {/* Add your PDF generation logic here if required */}

      {/* File Upload Section */}
      {/* You can add a file upload section here if needed */}

      {/* Add Row Button */}
      <button
        onClick={addRow}
        className="mt-[10px] bg-blue-500 text-white rounded px-[6px]"
      >
        Add Row
      </button>
    </div>
  );
};

export default InvoiceForm;
