"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  Phone,
  Globe,
  MoreHorizontal,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Defining types for TypeScript
type Row = {
  description: string;
  amount: number;
  issueDate: string;
  status: string;
};

interface vendorArrayData {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  emailAddress: string;
  website: string;
  phoneNumber: string;
  totalOutstanding: number;
  rows: number;
  table: Row[];
}

interface CompanyData {
  name: string;
  // Add other company fields as needed
}

interface ViewvendorArrayProps {
  vendorArray: vendorArrayData;
  myCompany: CompanyData;
}

const ViewvendorArray = ({ vendorArray }: ViewvendorArrayProps) => {
  const {
    table = [], // Default to an empty array if table is undefined
  } = vendorArray;

  const router = useRouter();

  const initials = `${vendorArray.firstName.charAt(
    0
  )}${vendorArray.lastName.charAt(0)}`;
  const fullName = `${vendorArray.firstName} ${vendorArray.lastName}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handling search query (optional, if you want search functionality)
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/user/vendors"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Vendors</span>
              </Link>

              <button className="p-2 hover:bg-gray-100 rounded-md">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between  items-center px-8">
          <div>
            <h1 className="text-2xl font-bold">{vendorArray.firstName}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <span>More Actions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => router.push("/user/bills/new")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              New Bill
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button className="px-4 py-4 text-blue-600 border-b-2 border-blue-600 font-medium">
              Overview
            </button>
            <button className="px-4 py-4 text-gray-500 hover:text-gray-700">
              Relationship
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 regular-12">
        <div className="grid grid-cols-3 gap-6">
          {/* Vendor Info Card */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-800 text-xl font-semibold">
                    {initials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {vendorArray.firstName}
                  </h2>
                  <p className="text-gray-500">{fullName}</p>
                  <p className="text-gray-500 mt-1">
                    Account #: {vendorArray.accountNumber}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{vendorArray.emailAddress}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{vendorArray.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Globe className="w-4 h-4 mr-2" />
                      <span>{vendorArray.website}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outstanding Amount Card */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold">Total Outstanding</h2>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <span>LKR</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <span>All Time</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  Rs. {formatCurrency(vendorArray.totalOutstanding)}
                </div>
              </div>

              <div className="relative pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>0</span>
                  <span>2k</span>
                  <span>4k</span>
                  <span>6k</span>
                  <span>8k</span>
                  <span>10k</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-md flex items-center px-4">
                  <span className="text-gray-500 italic">
                    Bills are all paid
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                    <span className="text-gray-700">Overdue</span>
                    <span className="text-gray-500">Rs. {0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Bills Section */}
        <div className="space-y-4">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
                <button
                  onClick={() => router.push("/user/invoices/new")}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search(INV001, 7800, Partial...)"
                    className="pl-10 pr-4 text-sm py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table to list invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-10">
                  <th className="w-12 py-3 px-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Client / Invoice Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1">
                      Issued Date
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Amount / Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      No bills available
                    </td>
                  </tr>
                ) : (
                  table.map((bill) => (
                    <tr
                      key={bill.description}
                      className="hover:bg-gray-20 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-1">
                        <div className="font-medium text-gray-900">
                          {bill.description}
                        </div>
                      </td>
                      <td className="px-4 py-1 text-gray-500">
                        {bill.description}
                      </td>
                      <td className="px-4 py-1">
                        <div className="text-gray-900">{bill.issueDate}</div>
                      </td>
                      <td className="px-4 py-1 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {formatCurrency(bill.amount)}
                        </div>
                        <span
                          className={`inline-flex bg-slate-300 rounded-full px-2 text-xs font-semibold`}
                        >
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex justify-end px-4 py-2 bg-gray-100 border-t rounded-b-md border-gray-200">
              <div className="text-sm text-gray-700">
                Grand Total: Rs.{" "}
                {formatCurrency(
                  table.reduce((total, bill) => total + bill.amount, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewvendorArray;
