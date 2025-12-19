"use client";
import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronLeft, 
  PenSquare, 
  Download, 
  Printer, 
  Mail, 
  Calendar, 
  Clock,
  FileText,
  DollarSign,
  User,
  Building,
  Phone,
  Mail as MailIcon,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type BillItem = {
  id?: number;
  description: string;
  rate: number;
  qty: number;
  total: number;
  category: string;
};

interface BillDetails {
  id: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  vendor?: string;
  companyName?: string;
  vendorId?: string;
  emailAddress?: string;
  phoneNumber?: string;
  clientAddress?: string;
  table: BillItem[];
  subtotal: number;
  tax: number;
  totalTax?: number;
  grandTotal: number;
  amountDue: number;
  totalOutstanding?: number;
  remarks?: string;
  status?: string;
}

interface BillDetailsProps {
  billArray: BillDetails;
}

const BillDetailsPage: React.FC<BillDetailsProps> = ({ billArray }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
 
  
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    notes: "",
  });

  // Calculate status
  const getBillStatus = () => {
    if (billArray.amountDue === 0) return { status: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle };
    const dueDate = new Date(billArray.dueDate);
    const today = new Date();
    if (dueDate < today) return { status: "Overdue", color: "bg-red-100 text-red-800", icon: AlertCircle };
    return { status: "Pending", color: "bg-yellow-100 text-yellow-800", icon: ClockIcon };
  };

  const billStatus = getBillStatus();
  const StatusIcon = billStatus.icon;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate payment summary
  const paidAmount = billArray.grandTotal - billArray.amountDue;
  const paidPercentage = (paidAmount / billArray.grandTotal) * 100;

  const handleAddPayment = () => {
    if (!paymentForm.amount || !paymentForm.paymentMethod) {
      alert("Please fill in all required fields.");
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount > billArray.amountDue) {
      alert("Payment amount cannot exceed the amount due.");
      return;
    }

    const newPayment = {
      id: payments.length + 1,
      date: paymentForm.paymentDate,
      type: paymentForm.paymentMethod,
      notes: paymentForm.notes,
      amount: amount,
      status: "Completed",
    };

    setPayments([...payments, newPayment]);
    
    // Reset form
    setPaymentForm({
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      notes: "",
    });
    
    setIsPaymentModalOpen(false);
    
    // In a real app, you would send this to your API
    console.log("New payment added:", newPayment);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log("Downloading bill:", billArray.billNumber);
  };

  const handleSendEmail = () => {
    // Implement email functionality
    console.log("Sending bill via email");
  };

  return (
    <div className="min-h-screen bg-gray-100  p-4 md:p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/bills"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">Back to Bills</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-gray-900">
                Bill: {billArray.billNumber}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${billStatus.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {billStatus.status}
                </span>
                <span className="text-xs text-gray-600">
                  Issued: {formatDate(billArray.issueDate)}
                </span>
                <span className="text-xs text-gray-600">
                  Due: {formatDate(billArray.dueDate)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100  text-gray-700"
              >
                <Printer className="w-4 h-4" />
                <span className="text-xs font-medium">Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100  text-gray-700"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs font-medium">Download</span>
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100  text-gray-700"
              >
                <Mail className="w-4 h-4" />
                <span className="text-xs font-medium">Email</span>
              </button>
              <Link
                href={`/dashboard/bills/${billArray.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PenSquare className="w-4 h-4" />
                <span className="text-xs font-medium">Edit</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Bill Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bill Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-sm font-semibold text-gray-900">Bill Information</h2>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(billArray.grandTotal)}
                  </div>
                  <div className="text-xs text-gray-600">Total Amount</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Issue Date</span>
                  </div>
                  <div className="font-medium">{formatDate(billArray.issueDate)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Due Date</span>
                  </div>
                  <div className={`font-medium ${billStatus.status === 'Overdue' ? 'text-red-600' : ''}`}>
                    {formatDate(billArray.dueDate)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Bill Number</span>
                  </div>
                  <div className="font-medium">{billArray.billNumber}</div>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Payment Progress</span>
                  <span>{paidPercentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${paidPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-gray-600">
                    Paid: {formatCurrency(paidAmount)}
                  </span>
                  <span className="text-gray-600">
                    Due: {formatCurrency(billArray.amountDue)}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700">Description</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700">Category</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700">Rate</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700">Qty</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {billArray.table.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100 ">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {item.qty}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Amount Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(billArray.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(billArray.tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Grand Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(billArray.grandTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Amount Due</span>
                    <span className={`text-sm font-bold ${billArray.amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(billArray.amountDue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Vendor Info & Payments */}
          <div className="space-y-6">
            {/* Vendor Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Vendor Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">{billArray.companyName || billArray.vendor}</div>
                    <div className="text-xs text-gray-600">Company</div>
                  </div>
                </div>
                {billArray.vendorId && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{billArray.vendorId}</div>
                      <div className="text-xs text-gray-600">Vendor ID</div>
                    </div>
                  </div>
                )}
                {billArray.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{billArray.phoneNumber}</div>
                      <div className="text-xs text-gray-600">Phone</div>
                    </div>
                  </div>
                )}
                {billArray.emailAddress && (
                  <div className="flex items-center gap-3">
                    <MailIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{billArray.emailAddress}</div>
                      <div className="text-xs text-gray-600">Email</div>
                    </div>
                  </div>
                )}
                {billArray.clientAddress && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{billArray.clientAddress}</div>
                      <div className="text-xs text-gray-600">Address</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Payment History</h3>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                  disabled={billArray.amountDue === 0}
                >
                  <span>+ Add Payment</span>
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No payments recorded yet</p>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                    disabled={billArray.amountDue === 0}
                  >
                    Record First Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-100 ">
                      <div>
                        <div className="font-medium text-gray-900">{formatDate(payment.date)}</div>
                        <div className="text-xs text-gray-600">{payment.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                        <div className="text-xs text-gray-600">{payment.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remarks Card */}
            {billArray.remarks && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Remarks</h3>
                <p className="text-gray-700">{billArray.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Amount due: <span className="font-bold">{formatCurrency(billArray.amountDue)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  max={billArray.amountDue}
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 "
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={!paymentForm.amount || !paymentForm.paymentMethod}
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetailsPage;