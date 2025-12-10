"use client";
import React, { useEffect, useState } from "react";

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

interface ClientsProps {
  invoiceArray: Invoice[];
  paymentsData: ApiPayment[];
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const InvoicePaymentsInterface: React.FC<ClientsProps> = ({
  invoiceArray,
  paymentsData,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for new payment
  const [newPayment, setNewPayment] = useState({
    invoiceNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    type: "",
    amount: 0,
    internalNotes: "",
    status: "Pending",
    client: "",
    invoiceId: "",
  });

  console.log(invoiceArray, "ivoice data");

  // Convert API payments to component payments
  const convertApiPaymentsToComponentPayments = (
    apiPayments: ApiPayment[]
  ): Payment[] => {
    return apiPayments.map((apiPayment) => {
      // Find the related invoice to get client and invoice number
      const relatedInvoice = invoiceArray.find(
        (inv) => inv.id === apiPayment.referenceId
      );

      return {
        id: apiPayment.id,
        client: relatedInvoice?.clientID || "Unknown Client",
        invoiceNumber: relatedInvoice?.invoiceNumber || apiPayment.referenceId,
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

  // Initialize payments with converted data
  const [payments, setPayments] = useState<Payment[]>(() =>
    convertApiPaymentsToComponentPayments(paymentsData)
  );

  useEffect(() => {
    // Update payments when paymentsData prop changes
    setPayments(convertApiPaymentsToComponentPayments(paymentsData));
  }, [paymentsData]);

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

  // Handle invoice selection
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInvoiceId = e.target.value;
    const selectedInvoice = invoiceArray.find(
      (inv) => inv.id === selectedInvoiceId
    );

    console.log(selectedInvoice, "selected");

    if (selectedInvoice) {
      setNewPayment((prev) => ({
        ...prev,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        client: selectedInvoice.clientID,
        amount: selectedInvoice.grandTotal,
      }));
    }
  };

  // Create new payment
  const createPayment = async (paymentData: any) => {
    try {
      console.log("Creating payment with data:", {
        paymentType: "invoice_payment",
        referenceId: paymentData.invoiceId,
        paymentDate: new Date(paymentData.paymentDate).toISOString(),
        paymentMethod: paymentData.type,
        notes: paymentData.internalNotes,
        amount: paymentData.amount,
        status: "Completed",
        transactionReference: `TXN-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });

      const response = await fetch(
        `${API_URL}/project_pulse/Payment/createPayment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "", // Let backend generate the ID
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

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(`${errorText.error}`);
      }

      const result = await response.json();
      console.log("Payment created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  };

  // Update existing payment
  const updatePayment = async (paymentId: string, paymentData: any) => {
    try {
      console.log("Updating payment with data:", {
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
      });

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update payment: ${errorText}`);
      }

      const result = await response.json();
      console.log("Payment updated successfully:", result);
      return result;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newPayment.invoiceId) {
      alert("Please select an invoice");
      return;
    }

    if (!newPayment.amount || newPayment.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      if (selectedPayment) {
        // Update existing payment
        const result = await updatePayment(selectedPayment.id, newPayment);

        // Update local state
        const updatedPayments = payments.map((payment) =>
          payment.id === selectedPayment.id
            ? {
                ...payment,
                client: newPayment.client || payment.client,
                invoiceNumber:
                  newPayment.invoiceNumber || payment.invoiceNumber,
                paymentDate: newPayment.paymentDate || payment.paymentDate,
                type: newPayment.type || payment.type,
                internalNotes:
                  newPayment.internalNotes || payment.internalNotes,
                amount: Number(newPayment.amount) || payment.amount,
                status:
                  (newPayment.status as "Paid" | "Pending" | "Failed") ||
                  payment.status,
              }
            : payment
        );
        setPayments(updatedPayments);
      } else {
        // Create new payment
        const result = await createPayment(newPayment);

        // Find the related invoice for the new payment
        const relatedInvoice = invoiceArray.find(
          (inv) => inv.id === newPayment.invoiceId
        );

        const payment: Payment = {
          id: result.id || `PAY${Date.now()}`, // Use ID from response or generate one
          client: newPayment.client || relatedInvoice?.clientID || "New Client",
          invoiceNumber:
            newPayment.invoiceNumber || relatedInvoice?.invoiceNumber || "",
          paymentDate:
            newPayment.paymentDate || new Date().toISOString().split("T")[0],
          type: newPayment.type || "",
          internalNotes: newPayment.internalNotes || "",
          amount: Number(newPayment.amount) || 0,
          status: "Paid",
          invoiceId: newPayment.invoiceId,
        };

        setPayments((prev) => [...prev, payment]);
      }

      // Reset form
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

      // Close details form
      setShowDetails(false);
      setSelectedPayment(null);

      alert(
        selectedPayment
          ? "Payment updated successfully!"
          : "Payment created successfully!"
      );
    } catch (error) {
      // console.error("Error processing payment:", error);
      alert(
        `Failed to process payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      invoiceNumber: payment.invoiceNumber,
      paymentDate: payment.paymentDate.split("T")[0], // Format for date input
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex justify-start items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            All Invoice Payments
          </h2>
          <button
            onClick={() => {
              setShowDetails(!showDetails);
              setSelectedPayment(null);
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
            }}
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
            placeholder="Search by client, invoice, or type"
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {!showDetails && (
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No payments found. Click the + button to add a payment.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="regular-12 font-medium text-gray-900">
                        {payment.client}
                      </div>
                      <div className="regular-12 text-gray-500">
                        {payment.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 regular-12 text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="regular-12 text-gray-900">
                        {payment.type}
                      </div>
                      <div className="regular-12 text-gray-500">
                        {payment.internalNotes}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="regular-12 font-medium text-gray-900">
                        Rs. {payment.amount.toFixed(2)}
                      </div>
                      <div
                        className={`regular-12 ${
                          payment.status === "Paid"
                            ? "text-green-600"
                            : payment.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        <span className="regular-12"> {payment.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right regular-12">
                      <button
                        onClick={() => handleEdit(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Form for new payment - remains the same */}
      {showDetails && (
        <form onSubmit={handleSubmit} className="overflow-x-auto regular-12">
          <table className="min-w-full divide-y border-none divide-gray-200 bg-white rounded-md shadow-md">
            <tbody className="divide-y divide-gray-200">
              <tr className="border-none">
                <td className="px-6 py-4">
                  <label
                    htmlFor="invoice"
                    className="regular-12text-gray-500 block mb-2"
                  >
                    Select Invoice
                  </label>
                  <select
                    value={newPayment.invoiceId}
                    onChange={handleInvoiceChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select an Invoice</option>
                    {invoiceArray.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.id} - Rs.{" "}
                        {invoice.grandTotal.toFixed(2)} - {invoice.clientID}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <label
                    htmlFor="paymentDate"
                    className="regular-12text-gray-500 block mb-2"
                  >
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={newPayment.paymentDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </td>
                <td className="px-6 py-4">
                  <label
                    htmlFor="type"
                    className="regular-12text-gray-500 block mb-2"
                  >
                    Payment Type
                  </label>
                  <select
                    name="type"
                    value={newPayment.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <label
                    htmlFor="amount"
                    className="regular-12text-gray-500 block mb-2"
                  >
                    Amount(LKR)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={newPayment.amount}
                    onChange={handleInputChange}
                    placeholder="Amount (LKR)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-4">
                  <label
                    htmlFor="internalNotes"
                    className="regular-12text-gray-500 block mb-2"
                  >
                    Internal Notes
                  </label>
                  <textarea
                    name="internalNotes"
                    value={newPayment.internalNotes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter notes or details here..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 gap-2 text-right space-x-2"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loading
                      ? "Processing..."
                      : selectedPayment
                      ? "Update Payment"
                      : "Add Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetails(!showDetails);
                      setSelectedPayment(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
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

export default InvoicePaymentsInterface;
