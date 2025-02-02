"use client";
import React, { useState } from "react";

interface Payment {
  id: string;
  client: string;
  invoiceNumber: string;
  paymentDate: string;
  type: string;
  internalNotes: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
}

const AllPayments = () => {
  // const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form state for new payment
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    invoiceNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    type: "",
    amount: 0,
    internalNotes: "",
    status: "Pending",
    client: "New Client", // Default client name
  });

  // Payments state
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      client: "Acme Corp",
      invoiceNumber: "INV-001",
      paymentDate: "2025-01-15",
      type: "Credit Card",
      internalNotes: "Monthly subscription",
      amount: 1500.0,
      status: "Paid",
    },
  ]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new payment object
    const payment: Payment = {
      id: (payments.length + 1).toString(),
      client: newPayment.client || "New Client",
      invoiceNumber: newPayment.invoiceNumber || "",
      paymentDate:
        newPayment.paymentDate || new Date().toISOString().split("T")[0],
      type: newPayment.type || "",
      internalNotes: newPayment.internalNotes || "",
      amount: Number(newPayment.amount) || 0,
      status: "Pending",
    };

    // Add new payment to payments array
    setPayments((prev) => [...prev, payment]);

    // Reset form
    setNewPayment({
      invoiceNumber: "",
      paymentDate: new Date().toISOString().split("T")[0],
      type: "",
      amount: 0,
      internalNotes: "",
      status: "Pending",
      client: "New Client",
    });

    // Close details form
    setShowDetails(false);
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(
    (payment) =>
      payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* Header content remains the same */}
        <div className="flex justify-start items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            All  Payments
          </h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client / Invoice Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Date ▼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type / Internal Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount / Status
              </th>
            </tr>
          </thead>
          {!showDetails && (
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-10">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.client}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{payment.type}</div>
                    <div className="text-sm text-gray-500">
                      {payment.internalNotes}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm ${
                        payment.status === "Paid"
                          ? "text-green-600"
                          : payment.status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {payment.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Form for new payment */}
      {showDetails && (
        <form onSubmit={handleSubmit} className="overflow-x-auto">
          <table className="min-w-full divide-y border-none divide-gray-200 bg-white rounded-md shadow-md">
            <tbody className="divide-y divide-gray-200">
              <tr className="border-none">
                <td className="px-6 py-0">
                  <label
                    htmlFor="invoiceNumber"
                    className="text-sm text-gray-500"
                  >
                    Invoice
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={newPayment.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="Invoice"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <label
                    htmlFor="paymentDate"
                    className="text-sm text-gray-500"
                  >
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={newPayment.paymentDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="p-6 py-0">
                  <label htmlFor="type" className="text-sm text-gray-500">
                    Payment Type
                  </label>
                  <select
                    name="type"
                    value={newPayment.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <label htmlFor="amount" className="text-sm text-gray-500">
                    Amount(LKR)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={newPayment.amount}
                    onChange={handleInputChange}
                    placeholder="Amount (LKR)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={3} className="px-6 py-4">
                  <textarea
                    name="internalNotes"
                    value={newPayment.internalNotes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter notes or details here..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 gap-2 text-right  space-x-2"
                >
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Add Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    aria-label="Cancel payment"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      )}
    </div>
  );
};

export default AllPayments;
