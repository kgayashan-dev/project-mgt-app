"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PaymentNavBar = () => {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {/* Invoice Payments Tab */}
        {/* <Link
          href="/user/payments"
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            pathname === "/user/payments"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          All Payment
        </Link> */}
        <Link
          href="/user/payments/invoice_payment"
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            pathname === "/user/payments/invoice_payment"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Invoice Payment
        </Link>
        <Link
          href="/user/payments/bill_payments"
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            pathname === "/user/payments/bill_payments"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Bill Payment
        </Link>
        {/* <Link
          href="/user/payments/checkout"
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            pathname === "/user/payments/checkout"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Checkout Links
        </Link> */}

        {/* Other Income Tab */}
        <Link
          href="/user/payments/other_income"
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            pathname === "/user/payments/other_income"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Other Income
        </Link>
      </nav>
    </div>
  );
};

export default PaymentNavBar;
