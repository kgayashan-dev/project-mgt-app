"use client";
import React, { useState } from "react";
import {
  Search,
  MegaphoneIcon,
  ChevronDown,
  FileText,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Row = {
  description: string;
  rate: number;
  tax: number;
  qty: number;
  total: number;
  unit: string;
  taxAmount: number;
  category: string; // Add category property
};

interface BillArray {
  id: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  client: string;
  table: Row[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  emailAddress: string;
  invoiceReference: string;
  taxPercentage: number;
  totalOutstanding: number;
  amountDue: number;
  vendor: string;
}

interface BillDetailsProps {
  billArray: BillArray;
  // myCompany: any; // Define myCompany prop
}

const ViewBillList: React.FC<BillDetailsProps> = ({ billArray }) => {
  const route = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const redirect = () => {
    route.push("/user/bills/new");
  };

  console.log(billArray)
  return (
    <div className="mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center w-full px-8">
        <h1 className="text-xl font-bold text-navy-900">Bills</h1>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            New Bill
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-2">
              <button
                onClick={redirect}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Manually Create
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Bill
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xl font-bold text-navy-900 mb-2">Rs. 0</h1>
            <p className="text-gray-600 regular-14">overdue</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-navy-900 mb-2">Rs. 0</h1>
            <p className="text-gray-600 regular-14">total outstanding</p>
          </div>
        </div>

        {/* All Bills Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">All Bills</h2>
              <button
                onClick={redirect}
                className="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Bills Table */}
          <div className="bg-white border border-gray-200 rounded-lg  regular-12 shadow-sm">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-3 text-gray-600 border-b">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    className="rounded"
                    aria-label="Select all"
                  />
                </div>
                <div className="col-span-3">Vendor / Category / Bill No.</div>
                <div className="col-span-2">Issue Date / Due Date</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-3 text-right">
                  Amount / Tax / Status
                </div>
              </div>

              {/* Bill Rows */}
              <div className="divide-y divide-gray-200">
                {billArray.map((bill) => (
                  <Link key={bill.id} href={`/user/bills/${bill.id}`}>
                    <div className="grid grid-cols-12 px-4 py-3 hover:bg-gray-10">
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          className="rounded"
                          aria-label={`Select ${bill.vendor}`}
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{bill.vendor}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MegaphoneIcon size={16} />
                            <span>{bill.category}</span>
                          </div>
                          <div className="text-sm text-gray-600">{bill.id}</div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex flex-col">
                          <span>{bill.issueDate}</span>
                          <span className="text-sm text-gray-600">
                            {bill.dueDate}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <span>{bill.description}</span>
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="flex flex-col items-end">
                          <span>Rs. {bill.amount}</span>
                          <span className="text-sm text-gray-600">
                            Rs. {bill.tax} tax
                          </span>
                          <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillList;
