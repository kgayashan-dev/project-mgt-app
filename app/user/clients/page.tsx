"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
const ClientsPage = () => {
  const router = useRouter();

  const handleNextPage = () => {
    router.push("/user/clients/new");
  };

  const [searchTerm, setSearchTerm] = useState("");

  const clients = {
    "123": {
      id: "123",
      name: "AIT Information Tech",
      initials: "KS",
      location: "United States",
      outstandingRevenue: 200,
      overdueAmount: 0,
      draftAmount: 0,
      unbilledTime: "10h 00m",
      unbilledExpenses: 0,
      contactEmail: "info@aittech.com",
      phoneNumber: "+1 (800) 123-4567",
      businessType: "Information Technology",
      billingCycle: "Monthly",
      createdAt: "2023-01-01",
      lastActive: "2025-01-22",
      clientSince: "2018",
    },
    "456": {
      id: "456",
      name: "Tech Innovations Ltd.",
      initials: "LP",
      location: "Canada",
      outstandingRevenue: 5000,
      overdueAmount: 2000,
      draftAmount: 1500,
      unbilledTime: "5h 30m",
      unbilledExpenses: 300,
      contactEmail: "contact@techinnovations.com",
      phoneNumber: "+1 (900) 987-6543",
      businessType: "Software Development",
      billingCycle: "Quarterly",
      createdAt: "2021-06-15",
      lastActive: "2025-01-19",
      clientSince: "2021",
    },
    "789": {
      id: "789",
      name: "Global Solutions LLC",
      initials: "GS",
      location: "United Kingdom",
      outstandingRevenue: 12000,
      overdueAmount: 3000,
      draftAmount: 2000,
      unbilledTime: "10h 00m",
      unbilledExpenses: 150,
      contactEmail: "info@globalsolutions.com",
      phoneNumber: "+44 (0) 123 456 789",
      businessType: "Consulting",
      billingCycle: "Annually",
      createdAt: "2019-05-10",
      lastActive: "2025-01-20",
      clientSince: "2019",
    },
  };

  const filteredClients = Object.values(clients).filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = Object.values(clients).reduce(
    (sum, client) => sum + client.outstandingRevenue,
    0
  );
  return (
    <div className="p-6  min-h-screen my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Clients</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-xl font-medium text-gray-700">Rs0</p>
          <p className="text-gray-500 regular-14">overdue</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-xl font-medium text-gray-700">Rs0</p>
          <p className="text-gray-500 regular-14">total outstanding</p>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <p className="text-xl font-medium text-gray-700">Rs0</p>
          <p className="text-gray-500 regular-14">in draft</p>
        </div>
      </div>

      {/* Recently Active */}

      <div className="p-6  min-h-screen">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button className="px-4 py-2 text-blue-600 font-semibold border-b-2 border-blue-600">
            Clients
          </button>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="regular-14 font-semibold text-gray-800">All Clients</h1>
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
        <div className="space-y-4 regular-12 ">
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
          {filteredClients.map((client) => (
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
                Rs. {client.outstandingRevenue.toLocaleString()} LKR
              </div>
            </div>
          ))}

          {/* Total Row */}
          <div className="flex justify-end px-4 py-2 bg-gray-20">
            <div className="font-medium">
              Total Outstanding: Rs.{totalOutstanding.toLocaleString()} LKR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
