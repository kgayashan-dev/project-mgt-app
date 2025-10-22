"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Vendor {
  id: string;
  companyName: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  accountNumber?: string;
  website?: string;
  phoneNumber?: string;
  totalOutstanding: number;
}

interface VendorsDashboardProps {
  vendorArray: Vendor[];
}

const VendorsDashboard = ({ vendorArray }: VendorsDashboardProps) => {
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(
    new Set()
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter vendors based on search query
  const filteredVendors = vendorArray.filter(
    (vendor) =>
      vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${vendor.firstName} ${vendor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      vendor.emailAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.accountNumber?.includes(searchQuery) ||
      vendor.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVendor = (id: string) => {
    const newSelected = new Set(selectedVendors);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVendors(newSelected);
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const calculateTotalOutstanding = () => {
    return filteredVendors.reduce(
      (sum, vendor) => sum + vendor.totalOutstanding,
      0
    );
  };

  const router = useRouter();

  const reDirect = () => {
    router.push("/user/vendors/new");
  };
  return (
    <div className="space-y-4 px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
        <div></div>
        <div className="mt-6">
          <button
            onClick={reDirect}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            New Vendor
          </button>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search vendors"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="grid">
            <thead>
              <tr className="bg-gray-10">
                <th className="w-12 py-3 px-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={() => {
                      const allIds = filteredVendors.map((v) => v.id);
                      setSelectedVendors(
                        selectedVendors.size === filteredVendors.length
                          ? new Set()
                          : new Set(allIds)
                      );
                    }}
                    checked={
                      selectedVendors.size === filteredVendors.length &&
                      filteredVendors.length > 0
                    }
                    aria-label="Select all vendors"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center text-sm font-medium text-gray-900"
                    onClick={toggleSort}
                    // aria-sort={sortDirection}
                  >
                    Company Name / Contact
                    {sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown
                        className="ml-1 h-4 w-4"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Email Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Account Number
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Total Outstanding
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white regular-12">
              {filteredVendors.map((vendor) => (
                <tr
                  onClick={() => router.push(`/user/vendors/${vendor.id}`)}
                  key={vendor.id}
                  className="hover:bg-gray-10 hover:cursor-pointer"
                >
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={selectedVendors.has(vendor.id)}
                      onChange={() => toggleVendor(vendor.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select ${vendor.companyName}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.companyName}
                    </div>
                    {(vendor.firstName || vendor.lastName) && (
                      <div className="text-sm text-gray-500">
                        {`${vendor.firstName || ""} ${vendor.lastName || ""}`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {vendor.emailAddress}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {vendor.accountNumber}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    Rs. {vendor.totalOutstanding.toFixed(2)} LKR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              {filteredVendors.length
                ? `1–${filteredVendors.length} of ${vendorArray.length}`
                : "No results found"}
            </div>
            <div className="text-sm text-gray-700">
              Total Outstanding:{" "}
              <span className="font-medium">
                Rs. {calculateTotalOutstanding().toFixed(2)} LKR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorsDashboard;
