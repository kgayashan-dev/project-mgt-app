"use client";
import React, { useEffect, useState } from "react";

// Types
interface Payment {
  id: string;
  client: string;
  invoiceNumber: string;
  paymentDate: string;
  type: string;
  internalNotes: string;
  amount: number;
  status: string;
  invoiceId: string;
}

type InvoiceStatus = "Paid" | "Partial" | "Overdue" | "Pending";

interface Invoice {
  id: string;
  clientID: string;
  invoiceNumber: string;
  description?: string;
  invoiceDate: string;
  invoiceDueDate?: string;
  client: string;
  amount: number;
  invoiceStatus: string;
  grandTotal: number;
  status: InvoiceStatus;
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

interface InvoicePaymentsInterfaceProps {
  invoiceArray: Invoice[];
  paymentsData: ApiPayment[];
}

interface NewPaymentForm {
  invoiceNumber: string;
  paymentDate: string;
  type: string;
  amount: number;
  internalNotes: string;
  status: string;
  client: string;
  invoiceId: string;
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

const InvoicePaymentsInterface: React.FC<InvoicePaymentsInterfaceProps> = ({
  invoiceArray,
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
    invoiceNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    type: "",
    amount: 0,
    internalNotes: "",
    status: "Pending",
    client: "",
    invoiceId: "",
  });

  // Convert API payments to component payments
  const convertApiPaymentsToComponentPayments = (
    apiPayments: ApiPayment[]
  ): Payment[] => {
    return apiPayments
      .filter((apiPayment) => apiPayment.paymentType === "invoice_payment")
      .map((apiPayment) => {
        const relatedInvoice = invoiceArray.find(
          (inv) => inv.id === apiPayment.referenceId
        );

        return {
          id: apiPayment.id,
          client: relatedInvoice?.clientID || "Unknown Client",
          invoiceNumber:
            relatedInvoice?.invoiceNumber || apiPayment.referenceId,
          paymentDate: apiPayment.paymentDate,
          type: apiPayment.paymentMethod,
          internalNotes: apiPayment.notes,
          amount: apiPayment.amount,
          status:
            apiPayment.status === "Completed"
              ? "Paid"
              : apiPayment.status === "Pending"
              ? "Pending"
              : "Failed",
          invoiceId: apiPayment.referenceId,
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

  // Calculate total paid for an invoice
  const getTotalPaidForInvoice = (invoiceId: string): number => {
    return payments
      .filter(
        (payment) =>
          payment.invoiceId === invoiceId && payment.status === "Paid"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Calculate remaining balance for an invoice
  const getRemainingBalance = (invoiceId: string): number => {
    const invoice = invoiceArray.find((inv) => inv.id === invoiceId);
    if (!invoice) return 0;

    const totalPaid = getTotalPaidForInvoice(invoiceId);
    return invoice.grandTotal - totalPaid;
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

  // Handle invoice selection
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInvoiceId = e.target.value;
    const selectedInvoice = invoiceArray.find(
      (inv) => inv.id === selectedInvoiceId
    );

    if (selectedInvoice) {
      const remainingBalance = getRemainingBalance(selectedInvoiceId);

      setNewPayment((prev) => ({
        ...prev,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        client: selectedInvoice.clientID,
        amount: Math.min(remainingBalance, selectedInvoice.grandTotal), // Don't allow overpayment
      }));
    }
  };

  // API Functions - UPDATED with better error handling
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
            paymentType: "invoice_payment",
            referenceId: paymentData.invoiceId,
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
        // If response is not JSON, it's likely an error message
        throw new Error(responseText || "Invalid response from server");
      }

      if (!response.ok) {
        // Check for specific validation errors from backend
        const errorMessage =
          responseData.message ||
          responseData.error ||
          "Failed to create payment";

        // Check if it's a balance exceeded error from backend
        if (
          errorMessage.includes("exceeds") ||
          errorMessage.includes("balance") ||
          errorMessage.includes("Invoice not found") ||
          errorMessage.includes("Bill not found")
        ) {
          throw new Error(`BACKEND_VALIDATION: ${errorMessage}`);
        }

        throw new Error(errorMessage);
      }

      return responseData;
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
            paymentType: "invoice_payment",
            referenceId: paymentData.invoiceId,
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

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        // If response is not JSON, it's likely an error message
        throw new Error(responseText || "Invalid response from server");
      }

      if (!response.ok) {
        // Check for specific validation errors from backend
        const errorMessage =
          responseData.message ||
          responseData.error ||
          responseText ||
          "Failed to update payment";

        // Check if it's a balance exceeded error from backend
        if (
          errorMessage.includes("exceeds") ||
          errorMessage.includes("balance") ||
          errorMessage.includes("Invoice not found") ||
          errorMessage.includes("Bill not found")
        ) {
          throw new Error(`BACKEND_VALIDATION: ${errorMessage}`);
        }

        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  // Handle form submission - UPDATED with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!newPayment.invoiceId) {
      setError("Please select an invoice");
      return;
    }

    if (!newPayment.amount || newPayment.amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Optional: Frontend check (can be disabled to test backend validation)
    const remainingBalance = getRemainingBalance(newPayment.invoiceId);
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
        const result = await updatePayment(selectedPayment.id, newPayment);
        console.log("Update payment result:", result);

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
        console.log("Create payment result:", result);

        // Add to local state
        const newPaymentObj: Payment = {
          id: result.GeneratedPaymentId || result.id || `PAY${Date.now()}`,
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process payment";

      // Check if it's a backend validation error
      if (errorMessage.startsWith("BACKEND_VALIDATION:")) {
        // Extract the actual error message
        const backendError = errorMessage.replace("BACKEND_VALIDATION: ", "");
        setError(backendError);
      } else {
        setError(errorMessage);
      }

      // Log the error for debugging
      console.error("Payment error details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewPayment({
      invoiceNumber: "",
      paymentDate: new Date().toISOString().split("T")[0],
      type: "",
      amount: 0,
      internalNotes: "",
      status: "Pending",
      client: "",
      invoiceId: "",
    });
  };

  // Handle edit button click
  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      invoiceNumber: payment.invoiceNumber,
      paymentDate: payment.paymentDate.split("T")[0],
      type: payment.type,
      amount: payment.amount,
      internalNotes: payment.internalNotes,
      status: payment.status,
      client: payment.client,
      invoiceId: payment.invoiceId,
    });
    setShowDetails(true);
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(
    (payment) =>
      payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected invoice details
  const selectedInvoiceDetails = newPayment.invoiceId
    ? invoiceArray.find((inv) => inv.id === newPayment.invoiceId)
    : null;

  // Format backend error message for better display
  const formatBackendErrorMessage = (errorMsg: string): string => {
    // Clean up the error message for display
    return errorMsg
      .replace("THROW", "")
      .replace("5000", "")
      .replace(/[0-9]+,/g, "") // Remove error codes
      .trim();
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Invoice Payments</h2>
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

      {/* Enhanced Error Message - Shows backend validation errors */}
      {error && (
        <div
          className={`mb-4 p-4 rounded-lg border-l-4 ${
            error.includes("exceeds") || error.includes("balance")
              ? "bg-red-50 border-red-500"
              : "bg-yellow-50 border-yellow-500"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {error.includes("exceeds") || error.includes("balance") ? (
                <svg
                  className="h-5 w-5 text-red-400"
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
                  className="h-5 w-5 text-yellow-400"
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
            <div className="ml-3">
              <h3
                className={`text-sm font-medium ${
                  error.includes("exceeds") || error.includes("balance")
                    ? "text-red-800"
                    : "text-yellow-800"
                }`}
              >
                {error.includes("exceeds") || error.includes("balance")
                  ? "Payment Validation Failed"
                  : "Error Processing Payment"}
              </h3>
              <div
                className={`mt-2 text-sm ${
                  error.includes("exceeds") || error.includes("balance")
                    ? "text-red-700"
                    : "text-yellow-700"
                }`}
              >
                <p>{formatBackendErrorMessage(error)}</p>
              </div>
              {(error.includes("exceeds") || error.includes("balance")) && (
                <div
                  className={`mt-3 p-3 rounded text-xs ${
                    error.includes("exceeds") || error.includes("balance")
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <p className="font-semibold mb-1">Details from backend:</p>
                  <p className="font-mono text-xs">
                    {formatBackendErrorMessage(error)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {showDetails && (
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedPayment ? "Edit Payment" : "Add New Payment"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Invoice Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Invoice *
                </label>
                <select
                  value={newPayment.invoiceId}
                  onChange={handleInvoiceChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!selectedPayment} // Can't change invoice when editing
                >
                  <option value="">Select Invoice</option>
                  {invoiceArray.map((invoice) => {
                    const paid = getTotalPaidForInvoice(invoice.id);
                    const balance = getRemainingBalance(invoice.id);
                  

                    return (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.clientID} - Total:{" "}
                        {formatCurrency(invoice.grandTotal)} - Paid:{" "}
                        {formatCurrency(paid)} - Balance:{" "}
                        {formatCurrency(balance)}
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Amount (LKR) *
                  {selectedInvoiceDetails && (
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Invoice Total:</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedInvoiceDetails.grandTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Already Paid:</span>
                        <span>
                          {formatCurrency(
                            getTotalPaidForInvoice(newPayment.invoiceId)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Balance:</span>
                        <span
                          className={
                            getRemainingBalance(newPayment.invoiceId) <= 0
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {formatCurrency(
                            getRemainingBalance(newPayment.invoiceId)
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newPayment.amount}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  max={
                    selectedInvoiceDetails
                      ? getRemainingBalance(newPayment.invoiceId)
                      : undefined
                  }
                  step="0.01"
                />
                {selectedInvoiceDetails && (
                  <div className="mt-1 text-xs text-gray-500">
                    Maximum allowed:{" "}
                    {formatCurrency(getRemainingBalance(newPayment.invoiceId))}
                  </div>
                )}
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter payment notes (optional)..."
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client / Invoice
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
                      <p>No payments found</p>
                      <p className="text-xs mt-1">
                        Click the + button to add a payment
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const relatedInvoice = invoiceArray.find(
                    (inv) => inv.id === payment.invoiceId
                  );
                  const totalPaid = getTotalPaidForInvoice(payment.invoiceId);
                  const remainingBalance = relatedInvoice
                    ? relatedInvoice.grandTotal - totalPaid
                    : 0;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-gray-900">
                          {payment.client}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.invoiceNumber}
                          {relatedInvoice && (
                            <div className="text-xs text-gray-400 mt-1 space-y-1">
                              <div>Invoice: {relatedInvoice.invoiceNumber}</div>
                              <div>
                                Total:{" "}
                                {formatCurrency(relatedInvoice.grandTotal)}
                              </div>
                              <div
                                className={
                                  remainingBalance <= 0
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }
                              >
                                Balance: {formatCurrency(remainingBalance)}
                              </div>
                              <div className="text-xs italic">
                                Status: {relatedInvoice.invoiceStatus}
                              </div>
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
                          {formatCurrency(payment.amount)}
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
                          className="text-blue-600 hover:text-blue-900 text-xs font-medium px-3 py-1 border border-blue-300 rounded hover:bg-blue-50"
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

export default InvoicePaymentsInterface;
