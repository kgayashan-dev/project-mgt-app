/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";

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

interface BillsProps {
  BillArray: Bill[];
  paymentsData: ApiPayment[];
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BillPaymentsInterface: React.FC<BillsProps> = ({
  BillArray,
  paymentsData,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for new payment
  const [newPayment, setNewPayment] = useState({
    billNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    type: "",
    amount: 0,
    internalNotes: "",
    status: "Pending",
    vendor: "",
    billId: "",
  });

  console.log(BillArray, "payment data 74");

  // Convert API payments to component payments
  const convertApiPaymentsToComponentPayments = (apiPayments: ApiPayment[]): Payment[] => {
    return apiPayments.map(apiPayment => {
      // Find the related bill to get vendor and bill number
      const relatedBill = BillArray.find(bill => bill.id === apiPayment.referenceId);
      
      return {
        id: apiPayment.id,
        vendor: relatedBill?.vendor || "Unknown Vendor",
        billNumber: relatedBill?.billNumber || apiPayment.referenceId,
        paymentDate: apiPayment.paymentDate.split('T')[0], // Extract date part only
        type: apiPayment.paymentMethod,
        internalNotes: apiPayment.notes,
        amount: apiPayment.amount,
        status: apiPayment.status === "Completed" ? "Paid" : 
                apiPayment.status === "Pending" ? "Pending" : "Failed",
        billId: apiPayment.referenceId
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

  console.log(paymentsData)

  // Handle bill selection
  const handleBillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBillId = e.target.value;
    const selectedBill = BillArray.find(
      (bill) => bill.id === selectedBillId
    );

    console.log(selectedBill, "selected");

    if (selectedBill) {
      setNewPayment((prev) => ({
        ...prev,
        billId: selectedBill.id,
        billNumber: selectedBill.billNumber,
        vendor: selectedBill.vendor,
        amount: selectedBill.amountDue || selectedBill.grandTotal,
      }));
    }
  };

  // Create new payment
  const createPayment = async (paymentData: any) => {
    try {
      console.log("Creating payment with data:", {
        paymentType: "bill_payment",
        referenceId: paymentData.billId,
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
        const errorText = await response.text();
        throw new Error(`Failed to create payment: ${errorText}`);
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
        paymentType: "bill_payment",
        referenceId: paymentData.billId,
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
    if (!newPayment.billId) {
      alert("Please select a bill");
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await updatePayment(selectedPayment.id, newPayment);
        
        // Update local state
        const updatedPayments = payments.map((payment) =>
          payment.id === selectedPayment.id
            ? {
                ...payment,
                vendor: newPayment.vendor || payment.vendor,
                billNumber: newPayment.billNumber || payment.billNumber,
                paymentDate: newPayment.paymentDate || payment.paymentDate,
                type: newPayment.type || payment.type,
                internalNotes: newPayment.internalNotes || payment.internalNotes,
                amount: Number(newPayment.amount) || payment.amount,
                status: (newPayment.status as "Paid" | "Pending" | "Failed") || payment.status,
              }
            : payment
        );
        setPayments(updatedPayments);
      } else {
        // Create new payment
        const result = await createPayment(newPayment);
        
        // Find the related bill for the new payment
        const relatedBill = BillArray.find(bill => bill.id === newPayment.billId);
        
        const payment: Payment = {
          id: result.id || `PAY${Date.now()}`,
          vendor: newPayment.vendor || relatedBill?.vendor || "New Vendor",
          billNumber: newPayment.billNumber || relatedBill?.billNumber || "",
          paymentDate: newPayment.paymentDate || new Date().toISOString().split("T")[0],
          type: newPayment.type || "",
          internalNotes: newPayment.internalNotes || "",
          amount: Number(newPayment.amount) || 0,
          status: "Paid",
          billId: newPayment.billId,
        };

        setPayments((prev) => [...prev, payment]);
      }

      // Reset form
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

      // Close details form
      setShowDetails(false);
      setSelectedPayment(null);

      alert(
        selectedPayment
          ? "Payment updated successfully!"
          : "Payment created successfully!"
      );
    } catch (error) {
      console.error("Error processing payment:", error);
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
      billNumber: payment.billNumber,
      paymentDate: payment.paymentDate.includes('T') ? payment.paymentDate.split('T')[0] : payment.paymentDate,
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex justify-start items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            All Bill Payments
          </h2>
          <button
            onClick={() => {
              setShowDetails(!showDetails);
              setSelectedPayment(null);
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
            placeholder="Search by vendor, bill, or type"
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
                Vendor / Bill Number
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
              {paymentsData.length === 0 ? (
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
                        {payment.vendor}
                      </div>
                      <div className="regular-12 text-gray-500">
                        {payment.billNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 regular-12 text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4">sss
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

      {/* Form for new payment */}
      {showDetails && (
        <form onSubmit={handleSubmit} className="overflow-x-auto regular-12">
          <table className="min-w-full divide-y border-none divide-gray-200 bg-white rounded-md shadow-md">
            <tbody className="divide-y divide-gray-200">
              <tr className="border-none">
                <td className="px-6 py-4">
                  <label
                    htmlFor="bill"
                    className="regular-12 text-gray-500 block mb-2"
                  >
                    Select Bill
                  </label>
                  <select
                    value={newPayment.billId}
                    onChange={handleBillChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a bill</option>
                    {BillArray.map((bill) => (
                      <option key={bill.id} value={bill.id}>
                        {bill.billNumber} - Rs.{" "}
                        {bill.amountDue.toFixed(2)} - {bill.vendor}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <label
                    htmlFor="paymentDate"
                    className="regular-12 text-gray-500 block mb-2"
                  >
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={newPayment.paymentDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </td>
                <td className="px-6 py-4">
                  <label
                    htmlFor="type"
                    className="regular-12 text-gray-500 block mb-2"
                  >
                    Payment Type
                  </label>
                  <select
                    name="type"
                    value={newPayment.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="regular-12 text-gray-500 block mb-2"
                  >
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={newPayment.amount}
                    onChange={handleInputChange}
                    placeholder="Amount (LKR)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="regular-12 text-gray-500 block mb-2"
                  >
                    Internal Notes
                  </label>
                  <textarea
                    name="internalNotes"
                    value={newPayment.internalNotes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter notes or details here..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 regular-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

export default BillPaymentsInterface;