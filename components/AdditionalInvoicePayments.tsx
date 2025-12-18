"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

interface Payment {
  id: string;
  date: string;
  type: string;
  notes: string;
  amount: number;
}

interface AdditionalInvoicePaymentProps {
  invoiceId: string;
  amountDue: number;
}

const AdditionalInvoicePayment = ({
  invoiceId,
  amountDue,
}: AdditionalInvoicePaymentProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Combined payment state
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      date: "2025-01-18",
      type: "Bank Transfer",
      notes: "Initial payment",
      amount: 47500.0,
    },
    {
      id: "2",
      date: "2025-01-18",
      type: "Bank Transfer",
      notes: "Deposit paid in full",
      amount: 47500.0,
    },
  ]);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "",
    notes: "",
  });

  // Handle Add Payment Click
  const handleAddPaymentClick = () => {
    if (invoiceId) {
      setIsPaymentModalOpen(true);
      setError(null);
    } else {
      setError("Please select an invoice first.");
    }
  };

  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Add Payment
  const handleAddPayment = () => {
    // Validate fields
    if (!paymentForm.amount || !paymentForm.method) {
      setError("Please fill in all required fields.");
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    // Add payment to the payments array
    const newPayment: Payment = {
      id: Date.now().toString(), // Simple ID generation
      date: paymentForm.date,
      type: paymentForm.method,
      notes: paymentForm.notes,
      amount: amount,
    };

    setPayments([...payments, newPayment]);

    // Reset form and close modal
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      method: "",
      notes: "",
    });
    setError(null);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="max-w-4xl px-8 regular-14">
      <div className="flex flex-col md:flex-row justify-normal space-x-4 items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-lg font-bold">
          All Payments For Invoice {invoiceId}
        </h2>
        <button
          onClick={handleAddPaymentClick}
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Date ▼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{payment.date}</td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {payment.type}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {payment.notes}
                </td>
                <td className="px-6 py-4 text-right text-xs text-gray-900">
                  Rs. 
                  {payment.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50  flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-md w-full regular-12">
            <div className="flex justify-between items-center mb-4 ">
              <h3 className="text-sm font-bold">Add a Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>{" "}
            {error && (
              <div className="p-2 bg-red-100 text-red-700 text-[10px] rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <p className="text-xs">Amount due: Rs. {amountDue}</p>

              <div>
                <label className="block text-xs mb-1">Payment Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Payment Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={paymentForm.date}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Payment Method</label>
                <select
                  name="method"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={paymentForm.method}
                  onChange={handleFormChange}
                >
                  <option value="">Select a payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalInvoicePayment;
