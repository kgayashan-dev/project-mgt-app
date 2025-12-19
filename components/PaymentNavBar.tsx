"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();

  
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <Link
      href={href}
      className={`py-4 px-1 border-b-2 font-medium text-xs ${
        isActive(href)
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {children}
    </Link>
  );
};

const PaymentNavBar = () => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        <NavLink href="/user/payments/invoice_payment">
          Invoice Payment
        </NavLink>
        {/* <NavLink href="/user/payments/bill_payments">
          Bill Payment
        </NavLink> */}
        <NavLink href="/user/payments/other_income">
          Other Income
        </NavLink>
      </nav>
    </div>
  );
};

export default PaymentNavBar;