/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";

// Types
interface Payment {
  id: string;
  vendor: string;
  billNumber: string;
  paymentDate: string;
  type: string;
  internalNotes: string;
  amount: number;
  status: string;
  billId: string;
}

interface Bill {
  id: string;
  vendorID: string;
  billNumber: string;
  description?: string;
  billDate: string;
  billDueDate?: string;
  vendor: string;
  amount: number;
  billStatus: string;
  grandTotal: number;
  status: string;
  totalOutstanding: number;
  amountDue: number;
}

interface ApiPayment {
  id: string;
  paymentType: string;
  referenceId: string;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  amount: number;
  status: string;
  transactionReference: string;
  createdAt: string;
}

interface BillPaymentsInterfaceProps {
  BillArray: Bill[];
  paymentsData: ApiPayment[];
}

interface NewPaymentForm {
  billNumber: string;
  paymentDate: string;
  type: string;
  amount: number;
  internalNotes: string;
  status: string;
  vendor: string;
  billId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BillPaymentsInterface: React.FC<BillPaymentsInterfaceProps> = ({
  BillArray,
  paymentsData,
}) => {
  // State
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new payment
  const [newPayment, setNewPayment] = useState<NewPaymentForm>({
    billNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    type: "",
    amount: 0,
    internalNotes: "",
    status: "Pending",
    vendor: "",
    billId: "",
  });

  console.log(paymentsData,"dadadadadasx")

  // Convert API payments to component payments
  const convertApiPaymentsToComponentPayments = (
    apiPayments: ApiPayment[]
  ): Payment[] => {
    return apiPayments
      .filter((apiPayment) => apiPayment.paymentType === "bill_payment")
      .map((apiPayment) => {
        const relatedBill = BillArray.find(
          (bill) => bill.id === apiPayment.referenceId
        );

        return {
          id: apiPayment.id,
          vendor: relatedBill?.vendor || "Unknown Vendor",
          billNumber: relatedBill?.billNumber || apiPayment.referenceId,
          paymentDate: apiPayment.paymentDate.split("T")[0],
          type: apiPayment.paymentMethod,
          internalNotes: apiPayment.notes,
          amount: apiPayment.amount,
          status:
            apiPayment.status === "Completed"
              ? "Paid"
              : apiPayment.status === "Pending"
              ? "Pending"
              : "Failed",
          billId: apiPayment.referenceId,
        };
      });
  };

  // Payments state
  const [payments, setPayments] = useState<Payment[]>(() =>
    convertApiPaymentsToComponentPayments(paymentsData)
  );

  // Update payments when paymentsData changes
  useEffect(() => {
    setPayments(convertApiPaymentsToComponentPayments(paymentsData));
  }, [paymentsData]);

  // Calculate total paid for a bill
  const getTotalPaidForBill = (billId: string): number => {
    return payments
      .filter(
        (payment) => payment.billId === billId && payment.status === "Paid"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Calculate remaining balance for a bill
  const getRemainingBalance = (billId: string): number => {
    const bill = BillArray.find((bill) => bill.id === billId);
    if (!bill) return 0;

    const totalPaid = getTotalPaidForBill(billId);
    const billTotal = bill.amountDue || bill.grandTotal;
    return billTotal - totalPaid;
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle bill selection
  const handleBillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBillId = e.target.value;
    const selectedBill = BillArray.find((bill) => bill.id === selectedBillId);

    if (selectedBill) {
      const remainingBalance = getRemainingBalance(selectedBillId);
      const billTotal = selectedBill.amountDue || selectedBill.grandTotal;

      setNewPayment((prev) => ({
        ...prev,
        billId: selectedBill.id,
        billNumber: selectedBill.billNumber,
        vendor: selectedBill.vendor,
        amount: Math.min(remainingBalance, billTotal),
      }));
    }
  };

  // API Functions
  const createPayment = async (paymentData: NewPaymentForm) => {
    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Payment/createPayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "",
            paymentType: "bill_payment",
            referenceId: paymentData.billId,
            paymentDate: new Date(paymentData.paymentDate).toISOString(),
            paymentMethod: paymentData.type,
            notes: paymentData.internalNotes,
            amount: paymentData.amount,
            status: "Completed",
            transactionReference: `TXN-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  const updatePayment = async (
    paymentId: string,
    paymentData: NewPaymentForm
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Payment/updatePayment/${paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: paymentId,
            paymentType: "bill_payment",
            referenceId: paymentData.billId,
            paymentDate: new Date(paymentData.paymentDate).toISOString(),
            paymentMethod: paymentData.type,
            notes: paymentData.internalNotes,
            amount: paymentData.amount,
            status: paymentData.status === "Paid" ? "Completed" : "Pending",
            transactionReference: `TXN-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update payment: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPayment.billId) {
      setError("Please select a bill");
      return;
    }

    if (!newPayment.amount || newPayment.amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Check if payment exceeds remaining balance
    const remainingBalance = getRemainingBalance(newPayment.billId);
    if (newPayment.amount > remainingBalance) {
      setError(
        `Payment amount exceeds remaining balance of Rs. ${remainingBalance.toFixed(
          2
        )}`
      );
      return;
    }

    setLoading(true);

    try {
      if (selectedPayment) {
        // Update existing payment
        await updatePayment(selectedPayment.id, newPayment);

        // Update local state
        const updatedPayments = payments.map((payment) =>
          payment.id === selectedPayment.id
            ? {
                ...payment,
                ...newPayment,
                status: newPayment.status as "Paid" | "Pending" | "Failed",
              }
            : payment
        );
        setPayments(updatedPayments);
      } else {
        // Create new payment
        const result = await createPayment(newPayment);

        // Add to local state
        const newPaymentObj: Payment = {
          id: result.id || `PAY${Date.now()}`,
          ...newPayment,
          status: "Paid",
        };
        setPayments((prev) => [...prev, newPaymentObj]);
      }

      // Reset form
      resetForm();
      setShowDetails(false);
      setSelectedPayment(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewPayment({
      billNumber: "",
      paymentDate: new Date().toISOString().split("T")[0],
      type: "",
      amount: 0,
      internalNotes: "",
      status: "Pending",
      vendor: "",
      billId: "",
    });
  };

  // Handle edit button click
  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      billNumber: payment.billNumber,
      paymentDate: payment.paymentDate.includes("T")
        ? payment.paymentDate.split("T")[0]
        : payment.paymentDate,
      type: payment.type,
      amount: payment.amount,
      internalNotes: payment.internalNotes,
      status: payment.status,
      vendor: payment.vendor,
      billId: payment.billId,
    });
    setShowDetails(true);
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(
    (payment) =>
      payment.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected bill details
  const selectedBillDetails = newPayment.billId
    ? BillArray.find((bill) => bill.id === newPayment.billId)
    : null;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Bill Payments</h2>
          <button
            onClick={() => {
              setShowDetails(!showDetails);
              setSelectedPayment(null);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
            aria-label={showDetails ? "Close form" : "Add payment"}
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
                d={showDetails ? "M5 15l7-7 7 7" : "M12 4v16m8-8H4"}
              />
            </svg>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Payment Form */}
      {showDetails && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-4">
            {selectedPayment ? "Edit Payment" : "Add New Payment"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Bill Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Bill *
                </label>
                <select
                  value={newPayment.billId}
                  onChange={handleBillChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!selectedPayment}
                >
                  <option value="">Select Bill</option>
                  {BillArray.map((bill) => {
                    const paid = getTotalPaidForBill(bill.id);
                    const balance = getRemainingBalance(bill.id);
                    const billTotal = bill.amountDue || bill.grandTotal;
                    return (
                      <option key={bill.id} value={bill.id}>
                        {bill.billNumber} - {bill.vendor} - Total: Rs.{" "}
                        {billTotal.toFixed(2)} - Paid: Rs. {paid.toFixed(2)} -
                        Balance: Rs. {balance.toFixed(2)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={newPayment.paymentDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Type *
                </label>
                <select
                  name="type"
                  value={newPayment.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount (LKR) *
                  {selectedBillDetails && (
                    <span className="text-xs text-gray-500 ml-2">
                      Bill Total: Rs.{" "}
                      {(
                        selectedBillDetails.amountDue ||
                        selectedBillDetails.grandTotal
                      ).toFixed(2)}{" "}
                      | Already Paid: Rs.{" "}
                      {getTotalPaidForBill(newPayment.billId).toFixed(2)} |
                      Remaining: Rs.{" "}
                      {getRemainingBalance(newPayment.billId).toFixed(2)}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newPayment.amount}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  max={
                    selectedBillDetails
                      ? getRemainingBalance(newPayment.billId)
                      : undefined
                  }
                  step="0.01"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="internalNotes"
                value={newPayment.internalNotes}
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter payment notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedPayment(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading
                  ? "Processing..."
                  : selectedPayment
                  ? "Update Payment"
                  : "Add Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor / Bill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type / Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount / Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>No bill payments found</p>
                      <p className="text-xs mt-1">
                        Click the + button to add a payment
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const relatedBill = BillArray.find(
                    (bill) => bill.id === payment.billId
                  );
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-gray-900">
                          {payment.vendor}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.billNumber}
                          {relatedBill && (
                            <div className="text-xs text-gray-400 mt-1">
                              Total: Rs.{" "}
                              {(
                                relatedBill.amountDue || relatedBill.grandTotal
                              ).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900">
                          {payment.type}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {payment.internalNotes || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-gray-900">
                          Rs. {payment.amount.toFixed(2)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillPaymentsInterface;
