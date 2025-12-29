// app/bills/page.tsx (or wherever your page is)
"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  MegaphoneIcon,
  ChevronDown,
  FileText,
  Upload,
  Eye,
  Download,
  MoreVertical,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrencyOrNA } from "@/utils/converts";

// Types
interface BillItem {
  id: number;
  billId: string;
  description: string;
  category: string;
  rate: number;
  qty: number;
  total: number;
}

interface Bill {
  id: string;
  billNumber: string;
  companyName: string;
  vendorId: string;
  issueDate: string;
  dueDate: string;
  emailAddress: string;
  phoneNumber: string;
  totalOutstanding: number;
  subTotal: number;
  tax: number;
  grandTotal: number;
  amountDue: number;
  totalTax: number;
  table: BillItem[];
  remarks?: string;
  status?: string;
  createdAt?: string;
}

interface BillListProps {
  bills: Bill[];
}

const BillsPage: React.FC<BillListProps> = ({ bills }) => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBills, setFilteredBills] = useState<Bill[]>(bills);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  // Calculate totals on component mount
  useEffect(() => {
    const now = new Date();
    let overdue = 0;
    let outstanding = 0;

    bills.forEach((bill) => {
      outstanding += bill.totalOutstanding;

      // Check if bill is overdue
      if (bill.status !== "Paid" && bill.dueDate) {
        const dueDate = new Date(bill.dueDate);
        if (dueDate < now) {
          overdue += bill.amountDue;
        }
      }
    });

    setOverdueAmount(overdue);
    setTotalOutstanding(outstanding);
  }, [bills]);

  // Filter bills based on search and status
  useEffect(() => {
    let result = bills;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (bill) =>
          bill.billNumber.toLowerCase().includes(query) ||
          bill.companyName.toLowerCase().includes(query) ||
          bill.vendorId.toLowerCase().includes(query)
      );
    }

    // Filter by status

    setFilteredBills(result);
  }, [searchQuery, selectedStatus, bills]);

  const redirectToNewBill = () => {
    router.push("/user/bills/new");
  };

  // const getBillStatus = (bill: Bill): string => {
  //   if (bill.amountDue === 0 || bill.totalOutstanding === 0) {
  //     return "Paid";
  //   }

  //   const now = new Date();
  //   const dueDate = new Date(bill.dueDate);

  //   if (dueDate < now && bill.amountDue > 0) {
  //     return "Overdue";
  //   }

  //   if (bill.amountDue > 0 && bill.amountDue < bill.grandTotal) {
  //     return "Partial";
  //   }

  //   return "Pending";
  // };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };


  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Partial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewBill = (billId: string) => {
    router.push(`/user/bills/${billId}`);
  };

  const handleDownloadBill = (bill: Bill) => {
    // Implement download functionality
    console.log("Downloading bill:", bill.billNumber);
    alert(`Downloading ${bill.billNumber}`);
  };

  const handleMoreActions = (bill: Bill, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("More actions for:", bill.billNumber);
    // Implement more actions menu
  };

  return (
    <div className="p-4 md:p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bills</h1>
          <p className="text-gray-600 mt-1">Manage and track your bills</p>
        </div>

        <div className="relative mt-4 md:mt-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="font-medium">New Bill</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-2">
              <button
                onClick={redirectToNewBill}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100  flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Create Bill</span>
              </button>
              <button className="w-full px-4 py-2.5 text-left hover:bg-gray-100  flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-medium">Upload Bill</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Overdue</p>
              <p className="text-lg font-bold text-red-600 mt-1">
                {formatCurrencyOrNA(overdueAmount)}
              </p>
            </div>
            <div className="bg-red-50 p-2 rounded-full">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Outstanding</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrencyOrNA(totalOutstanding)}
              </p>
            </div>
            <div className="bg-blue-50 p-2 rounded-full">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
         <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Expenses</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrencyOrNA(grandTotal += )}
              </p>
            </div>
            <div className="bg-blue-50 p-2 rounded-full">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>


      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-900">All Bills</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-3 py-1.5 text-xs rounded-full ${
                  selectedStatus === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus("Pending")}
                className={`px-3 py-1.5 text-xs rounded-full ${
                  selectedStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedStatus("Overdue")}
                className={`px-3 py-1.5 text-xs rounded-full ${
                  selectedStatus === "Overdue"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setSelectedStatus("Paid")}
                className={`px-3 py-1.5 text-xs rounded-full ${
                  selectedStatus === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              No bills found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Get started by creating your first bill"}
            </p>
            {!searchQuery && selectedStatus === "all" && (
              <button
                onClick={redirectToNewBill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Bill
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 ">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor / Bill Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => {
                  const categories = [
                    ...new Set(bill.table.map((item) => item.category)),
                  ];

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-gray-100  transition-colors cursor-pointer"
                      onClick={() => handleViewBill(bill.id)}
                    >
                      <td className="px-2 py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {bill.companyName || bill.vendorId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <MegaphoneIcon className="w-4 h-4 text-gray-400" />
                            <div className="flex gap-1">
                              {categories.map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {bill.billNumber}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-1">
                        <div className="space-y-1">
                          <div>
                            <span className="text-xs text-gray-500">
                              Issued:
                            </span>
                            <div className="text-xs font-medium">
                              {formatDate(bill.issueDate)}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Due:</span>
                            <div
                              className={`text-xs font-medium ${
                                status === "Overdue" ? "text-red-600" : ""
                              }`}
                            >
                              {formatDate(bill.dueDate)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-1">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-900">
                            {formatCurrencyOrNA(bill.grandTotal)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Tax: {formatCurrencyOrNA(bill.totalTax)}
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600">Due: </span>
                            <span className="font-medium">
                              {formatCurrencyOrNA(bill.amountDue)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            bill.status || "Pending"
                          )}`}
                        >
                          {bill.status}
                        </span>
                      </td>

                      <td className="px-2 py-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBill(bill.id);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadBill(bill);
                            }}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleMoreActions(bill, e)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredBills.length > 0 && (
        <div className="mt-4 text-xs text-gray-600">
          Showing {filteredBills.length} of {bills.length} bills
        </div>
      )}
    </div>
  );
};

export default BillsPage;
