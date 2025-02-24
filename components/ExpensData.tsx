import React from "react";
import Link from "next/link";
import { ChevronLeft, Printer, PenSquare } from "lucide-react";

interface expensArrayData {
  id: string;
  expenceType: string;
  expensMerchant: string;
  expensSubtotal: string;
  expensTax: string;
  expensTotal: string;
  dexpensDate: string;
}

interface ViewExpensArrayProps {
  expensData: expensArrayData;
}

const ExpenseDetailPage = ({ expensData }: ViewExpensArrayProps) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <Link
          href="/user/expenses"
          className="inline-flex items-center text-blue-600 mb-6 hover:text-blue-700"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Expenses</span>
        </Link>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-navy-900">
            Expense from {expensData.expensMerchant}
          </h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-10 rounded-lg flex items-center gap-2">
              More Actions
              <ChevronLeft className="w-4 h-4 rotate-270" />
            </button>
            <Link
              href={`/user/expenses/2/edit`} // change the params  ID accordingly
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <PenSquare className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* Icon and Type */}
        <div className="flex items-center gap-3 mb-6">
          <Printer className="text-blue-600 w-6 h-6" />
          <span className="text-gray-600">{expensData.expenceType}</span>
        </div>

        {/* Date and Merchant */}
        <div className="mb-16">
          <div className="text-gray-900">{expensData.dexpensDate}</div>
          <div className="text-2xl font-semibold mt-2">
            {expensData.expensMerchant}
          </div>
        </div>

        {/* Expense Details */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              Rs. {expensData.expensSubtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-gray-600">Tax Name</span>
            <span className="text-gray-900">
              Rs. {expensData.expensTax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-medium">
              Grand Total (USD):
            </span>
            <span className="text-2xl font-semibold">
              Rs. {expensData.expensTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bottom Wave Pattern */}
        <div className="mt-8">
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="w-full h-8 text-gray-200"
          >
            <path
              d="M0 5 Q 25 0, 50 5 T 100 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailPage;
