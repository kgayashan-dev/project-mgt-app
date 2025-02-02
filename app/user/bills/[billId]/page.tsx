"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { ChevronLeft, PenSquare } from "lucide-react";
import Link from "next/link";

const BillingInterface = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payments, setPayments] = useState([
    { date: "01/09/2025", type: "Cash", notes: "100", amount: 100.0 },
    { date: "01/10/2025", type: "Cash", notes: "Noted", amount: 900.0 },
  ]);

  const [paymentAmount, setPaymentAmount] = useState(""); // Store payment amount
  const [paymentDate, setPaymentDate] = useState("01/10/2025"); // Store payment date
  const [paymentMethod, setPaymentMethod] = useState(""); // Store payment method
  const [paymentNotes, setPaymentNotes] = useState(""); // Store payment notes

  const billData = {
    issueDate: "01/09/2025",
    dueDate: "02/08/2025",
    billNumber: "bill1",
    items: [
      {
        description: "OOO",
        category: "Advertising",
        rate: 1000.0,
        qty: 1,
        total: 1000.0,
      },
    ],
  };

  const handleAddPayment = () => {
    // Validate fields before adding payment
    if (!paymentAmount || !paymentMethod) {
      alert("Please fill in all required fields.");
      return;
    }

    // Add payment to the payments array
    const newPayment = {
      date: paymentDate,
      type: paymentMethod,
      notes: paymentNotes,
      amount: parseFloat(paymentAmount),
    };
    setPayments([...payments, newPayment]);

    // Reset fields and close modal
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentNotes("");
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="l mx-auto regular-12 p-4">
      <div className="mb-8">
        <Link
          href="/user/bills"
          className="inline-flex text-base items-center text-blue-600 mb-6 hover:text-blue-700"
        >
          <ChevronLeft className="w-5 h-5 mr-1 text-base" />
          <span>Bills</span>
        </Link>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-navy-900">Bill </h1>
          <div className="flex gap-3">
            {/* <button className="px-4 py-2 text-gray-600 hover:bg-gray-10 rounded-lg flex items-center gap-2">
              More Actions
              <ChevronLeft className="w-4 h-4 rotate-270" />
            </button> */}
            <Link
              href={`/user/bills/bill1/edit`} // change the params  ID accordingly
              className="bg-green-600 text-white px-4 py-2 regular-14 rounded-lg flex items-center gap-2"
            >
              <PenSquare className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>
      {/* Status Banner */}
      <div className="bg-green-100 p-4 mb-4 max-w-5xl rounded-md">
        <p className="text-green-800">
          Paid In Full · You added a payment on Jan 10, 2025
        </p>
      </div>

      {/* Bill Details */}
      <div className="bg-white rounded-lg max-w-5xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Bill Details</h2>
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Issue Date</p>
              <p>{billData.issueDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p>{billData.dueDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bill Number</p>
              <p>{billData.billNumber}</p>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="py-2">Description</th>
                <th>Category</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {billData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2">{item.description}</td>
                  <td>{item.category}</td>
                  <td>${item.rate.toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>1,000.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>0.00</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Grand Total (USD)</span>
              <span>1,000.00</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid</span>
              <span>1,000.00</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Amount Due (USD)</span>
              <span>0.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Section */}
      <div className="mt-6 bg-white p-6 rounded">
        <div className="flex items-center justify-start space-x-4 mb-4">
          <h3 className="text-lg font-bold">All Payments For Bill</h3>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-md px-3 py-1"
          >
            +
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2">Date</th>
              <th>Type</th>
              <th>Internal Notes</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2">{payment.date}</td>
                <td>{payment.type}</td>
                <td>{payment.notes}</td>
                <td>${payment.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add a Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm">Amount due: Rs. 0.00</p>

              <div>
                <label className="block text-sm mb-1">Payment Amount</label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Payment Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {/* <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" /> */}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Payment Method</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="" disabled>
                    Select a payment method
                  </option>
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
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

export default BillingInterface;
