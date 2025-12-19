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

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const BillPaymentsInterface: React.FC<BillPaymentsInterfaceProps> = ({
  BillArray,
  paymentsData,
}) => {

  console.log("Bill array data:", BillArray);

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

  // Debug effect to track calculations
  useEffect(() => {
    if (newPayment.billId) {
      const bill = BillArray.find(b => b.id === newPayment.billId);
      const paid = getTotalPaidForBill(newPayment.billId, selectedPayment?.id);
      console.log(`Debug Bill ${newPayment.billId}:`, {
        billNumber: bill?.billNumber,
        grandTotal: bill?.grandTotal,
        amountDueFromDB: bill?.amountDue,
        calculatedPaid: paid,
        remainingByGrandTotal: bill ? bill.grandTotal - paid : 0,
        remainingByAmountDue: bill ? bill.amountDue - paid : 0,
        selectedPaymentId: selectedPayment?.id,
        selectedPaymentAmount: selectedPayment?.amount
      });
    }
  }, [newPayment.billId, BillArray, selectedPayment]);

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
          paymentDate: apiPayment.paymentDate,
          type: apiPayment.paymentMethod,
          internalNotes: apiPayment.notes,
          amount: apiPayment.amount,
          status: apiPayment.status, // Use backend status directly
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

  // Calculate total paid for a bill - FIXED VERSION
  const getTotalPaidForBill = (billId: string, excludePaymentId?: string): number => {
    return payments
      .filter(
        (payment) => 
          payment.billId === billId && 
          payment.status === "Completed" &&
          (excludePaymentId ? payment.id !== excludePaymentId : true)
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Calculate remaining balance for a bill - FIXED VERSION
  const getRemainingBalance = (billId: string, excludePaymentId?: string): number => {
    const bill = BillArray.find((bill) => bill.id === billId);
    if (!bill) return 0;

    const totalPaid = getTotalPaidForBill(billId, excludePaymentId);
    // Always use grandTotal for calculations (original bill amount)
    return bill.grandTotal - totalPaid;
  };

  // Calculate amount already paid from database perspective
  const getAlreadyPaidFromDB = (billId: string): number => {
    const bill = BillArray.find((bill) => bill.id === billId);
    if (!bill) return 0;
    
    // This is what's already been paid according to the database
    return bill.grandTotal - (bill.amountDue || bill.grandTotal);
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

  // Handle bill selection - FIXED VERSION
  const handleBillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBillId = e.target.value;
    const selectedBill = BillArray.find((bill) => bill.id === selectedBillId);

    if (selectedBill) {
      const remainingBalance = getRemainingBalance(
        selectedBillId, 
        selectedPayment?.id
      );

      setNewPayment((prev) => ({
        ...prev,
        billId: selectedBill.id,
        billNumber: selectedBill.billNumber,
        vendor: selectedBill.vendor,
        // Use remaining balance or current amount
        amount: selectedPayment 
          ? prev.amount // Keep existing payment amount when editing
          : Math.max(0, Math.min(remainingBalance, selectedBill.grandTotal)), // Don't go below 0 or above grandTotal
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
            paymentType: "bill_payment", // 0
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

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(responseText || "Invalid response from server");
      }

      // Check if response is OK
      if (!response.ok) {
        // Check if it's a validation error from backend (400 Bad Request)
        if (response.status === 400 && responseData.isValidationError) {
          throw new Error(`VALIDATION_ERROR: ${responseData.message}`);
        }

        // Other errors
        throw new Error(
          responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return responseData;
    } catch (error) {
      // Handle validation errors specifically
      if (error instanceof Error) {
        if (error.message.startsWith("VALIDATION_ERROR:")) {
          const validationError = error.message.replace(
            "VALIDATION_ERROR: ",
            ""
          );
          throw new Error(validationError);
        }
      }

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
            status: paymentData.status, // Use the actual status from form
            transactionReference: `TXN-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(responseText || "Invalid response from server");
      }

      // Check if response is OK
      if (!response.ok) {
        // Check if it's a validation error from backend (400 Bad Request)
        if (response.status === 400 && responseData.isValidationError) {
          throw new Error(`VALIDATION_ERROR: ${responseData.message}`);
        }

        // Other errors
        throw new Error(
          responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return responseData;
    } catch (error) {
      // Handle validation errors specifically
      if (error instanceof Error) {
        if (error.message.startsWith("VALIDATION_ERROR:")) {
          const validationError = error.message.replace(
            "VALIDATION_ERROR: ",
            ""
          );
          throw new Error(validationError);
        }
      }

      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPayment.billId) {
      setError("Please select a bill");
      return;
    }

    if (!newPayment.amount || newPayment.amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Validate amount doesn't exceed remaining balance
    const remainingBalance = getRemainingBalance(newPayment.billId, selectedPayment?.id);
    if (newPayment.amount > remainingBalance) {
      setError(`Payment amount (${formatCurrency(newPayment.amount)}) exceeds remaining balance (${formatCurrency(remainingBalance)})`);
      return;
    }

    setLoading(true);

    try {
      if (selectedPayment) {
        const result = await updatePayment(selectedPayment.id, newPayment);
        console.log("Update payment result:", result);

        const updatedPayments = payments.map((payment) =>
          payment.id === selectedPayment.id
            ? {
                ...payment,
                ...newPayment,
                status: newPayment.status,
              }
            : payment
        );
        setPayments(updatedPayments);
      } else {
        const result = await createPayment(newPayment);

        const newPaymentObj: Payment = {
          id: result.GeneratedPaymentId || result.id || `PAY${Date.now()}`,
          ...newPayment,
          status: "Completed", // New payments default to Completed
        };
        setPayments((prev) => [...prev, newPaymentObj]);
      }

      resetForm();
      setShowDetails(false);
      setSelectedPayment(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process payment";

      if (errorMessage.startsWith("BACKEND_VALIDATION:")) {
        const backendError = errorMessage.replace("BACKEND_VALIDATION: ", "");
        setError(backendError);
      } else {
        setError(errorMessage);
      }
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
      paymentDate: payment.paymentDate.split("T")[0],
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

  // Format backend error message for better display
  const formatBackendErrorMessage = (errorMsg: string): string => {
    return errorMsg
      .replace("THROW", "")
      .replace("5000", "")
      .replace(/[0-9]+,/g, "")
      .trim();
  };

  // Helper function for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-gray-900">Bill Payments</h2>
          <button
            onClick={() => {
              setShowDetails(!showDetails);
              setSelectedPayment(null);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-full"
            aria-label={showDetails ? "Close form" : "Add payment"}
          >
            <svg
              className="w-4 h-4"
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

        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5"
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
        <div
          className={`mb-3 p-3 rounded border-l-3 text-xs ${
            error.includes("exceeds") || error.includes("balance")
              ? "bg-red-50 border-red-400 text-red-700"
              : "bg-yellow-50 border-yellow-400 text-yellow-700"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              {error.includes("exceeds") || error.includes("balance") ? (
                <svg
                  className="h-4 w-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-2">
              <p className="font-medium">
                {error.includes("exceeds") || error.includes("balance")
                  ? "Payment Validation Failed"
                  : "Error"}
              </p>
              <p className="mt-0.5">{formatBackendErrorMessage(error)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {showDetails && (
        <div className="mb-3 bg-white rounded shadow p-3">
          <h3 className="text-sm font-semibold mb-3">
            {selectedPayment ? "Edit Payment" : "Add New Payment"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Bill Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Bill *
                </label>
                <select
                  value={newPayment.billId}
                  onChange={handleBillChange}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  disabled={!!selectedPayment}
                >
                  <option value="">Select Bill</option>
                  {BillArray.map((bill) => {
                    const paidFromDB = getAlreadyPaidFromDB(bill.id);
                    const remainingBalance = getRemainingBalance(bill.id);
                    const statusIcon =
                      remainingBalance <= 0 ? "✓ " : paidFromDB > 0 ? "⚠ " : "○ ";

                    return (
                      <option key={bill.id} value={bill.id}>
                        {statusIcon}
                        {bill.billNumber} - {bill.vendor} -{" "}
                        {formatCurrency(bill.grandTotal)} (Due: {formatCurrency(bill.amountDue)})
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
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newPayment.amount}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
                {selectedBillDetails && (
                  <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Original Bill Total:</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedBillDetails.grandTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Already Paid (from DB):</span>
                      <span>
                        {formatCurrency(getAlreadyPaidFromDB(newPayment.billId))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Already Paid (from Payments):</span>
                      <span>
                        {formatCurrency(getTotalPaidForBill(
                          newPayment.billId, 
                          selectedPayment?.id
                        ))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>DB Amount Due:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(selectedBillDetails.amountDue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Balance (calculated):</span>
                      <span
                        className={
                          getRemainingBalance(newPayment.billId, selectedPayment?.id) <= 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {formatCurrency(getRemainingBalance(
                          newPayment.billId, 
                          selectedPayment?.id
                        ))}
                      </span>
                    </div>
                    {selectedPayment && (
                      <div className="flex justify-between italic text-gray-400">
                        <span>Editing Payment:</span>
                        <span>{selectedPayment.id} ({formatCurrency(selectedPayment.amount)})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="internalNotes"
                value={newPayment.internalNotes}
                onChange={handleInputChange}
                rows={2}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Payment notes (optional)..."
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
                  setError(null);
                }}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100 0"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : selectedPayment ? (
                  "Update Payment"
                ) : (
                  "Add Payment"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments Table - Compact Version */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor / Bill
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Notes
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount / Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-gray-500 text-xs"
                  >
                    <div className="flex flex-col items-center py-4">
                      <svg
                        className="w-8 h-8 text-gray-300 mb-1"
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
                      <p className="text-xs">No payments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const relatedBill = BillArray.find(
                    (bill) => bill.id === payment.billId
                  );
                  const totalPaid = getTotalPaidForBill(payment.billId);
                  // Use grandTotal for calculations
                  const remainingBalance = relatedBill
                    ? relatedBill.grandTotal - totalPaid
                    : 0;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-100 0">
                      <td className="px-2 py-1">
                        <div className="text-xs font-medium text-gray-900">
                          {payment.vendor}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.billNumber}
                          {relatedBill && (
                            <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                              <div>
                                <span className="font-medium">Total:</span>{" "}
                                {formatCurrency(relatedBill.grandTotal)}
                              </div>
                              <div>
                                <span className="font-medium">DB Due:</span>{" "}
                                {formatCurrency(relatedBill.amountDue)}
                              </div>
                              <div>
                                <span className="font-medium">Balance:</span>{" "}
                                <span
                                  className={
                                    remainingBalance <= 0
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }
                                >
                                  {formatCurrency(remainingBalance)}
                                </span>
                              </div>
                              <div className="italic text-orange-50 border-lime-100">
                                {relatedBill.status}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-900">
                          {payment.type}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          {payment.internalNotes || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs font-semibold text-gray-900 mb-1">
                          {formatCurrency(payment.amount)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
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