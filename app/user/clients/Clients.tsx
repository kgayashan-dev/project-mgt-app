"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  initials: string;
  location: string;
  contactEmail: string;
  phoneNumber: string;
  businessType: string;
  billingCycle: string;
  createdAt: string;
  lastActive: string;
  clientSince: string;
}

interface ClientComponentProps {
  clientDataResponse: {
    success: boolean;
    data?: Client[];
    message?: string;
  };
}

const ClientComponent = ({ clientDataResponse }: ClientComponentProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleNextPage = () => {
    router.push("/user/clients/new");
  };

  // Use API data directly
  const clients = clientDataResponse.success && clientDataResponse.data 
    ? clientDataResponse.data 
    : [];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics based on actual data
  const totalOutstanding = 0; // You can add this field to your API if needed
  const totalOverdue = 0; // You can add this field to your API if needed
  const totalDraft = 0; // You can add this field to your API if needed

  return (
    <div className="p-4 min-h-screen my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-lg font-semibold text-gray-800">Clients</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNextPage}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            New Client
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-lg font-medium text-gray-700">Rs{totalOverdue}</p>
          <p className="text-gray-500 regular-14">overdue</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-lg font-medium text-gray-700">Rs{totalOutstanding}</p>
          <p className="text-gray-500 regular-14">total outstanding</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-lg font-medium text-gray-700">Rs{totalDraft}</p>
          <p className="text-gray-500 regular-14">in draft</p>
        </div>
      </div>

      {/* Recently Active */}
      <div className="p-4 min-h-screen">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button className="px-4 py-2 text-blue-600 font-semibold border-b-2 border-blue-600">
            Clients
          </button>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="regular-14 font-semibold text-gray-800">
            All Clients ({clients.length})
          </h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 regular-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="flex regular-12 items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
              Advanced Search
              <svg
                className="w-4 h-4 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Table/Client List */}
        <div className="space-y-4 regular-12">
          {/* Table Header */}
          <div className="grid grid-cols-4 items-center px-4 py-2 bg-gray-10 border-b">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="font-medium">Client Name / Primary Contact</span>
            </div>
            <span className="font-medium">Internal Note</span>
            <span className="font-medium text-right">Credit</span>
            <span className="font-medium text-right">Total Outstanding</span>
          </div>

          {/* Client Rows */}
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => router.push(`/user/clients/${client.id}`)}
                className="grid grid-cols-4 items-center px-4 py-1 hover:bg-gray-200 border-b hover:cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-gray-500">{client.initials}</div>
                  </div>
                </div>
                <div></div>
                <div className="text-right">—</div>
                <div className="text-right">
                  Rs. {totalOutstanding.toLocaleString()} LKR
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {clients.length === 0 ? "No clients found" : "No clients match your search"}
            </div>
          )}

          {/* Total Row */}
          <div className="flex justify-end px-4 py-2 bg-gray-20">
            <div className="font-medium">
              Total Clients: {filteredClients.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientComponent;