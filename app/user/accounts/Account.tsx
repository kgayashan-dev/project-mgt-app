"use client";
import React, { useState } from "react";
import { ChevronDown, X, DollarSign, Filter } from "lucide-react";

const ChartOfAccounts = () => {
  const [activeTab, setActiveTab] = useState("All Accounts");

  const accounts = [
    {
      id: "1000",
      name: "Cash",
      type: "Asset",
      subType: "Cash & Bank",
      balance: 0.0,
      isParent: true,
    },
    {
      id: "1000-1",
      name: "Petty Cash",
      type: "Asset",
      subType: "Cash & Bank",
      balance: 0.0,
      parentId: "1000",
      subLabel: "Cash",
    },
    {
      id: "1200",
      name: "Accounts Receivable",
      type: "Asset",
      subType: "Current Asset",
      balance: 0.0,
    },
    {
      id: "1201",
      name: "Customer Deposits",
      type: "Asset",
      subType: "Current Asset",
      balance: 0.0,
    },
    {
      id: "1202",
      name: "Deferred Discounts",
      type: "Asset",
      subType: "Current Asset",
      balance: 0.0,
    },
    {
      id: "1203",
      name: "Deposits",
      type: "Asset",
      subType: "Current Asset",
      balance: 0.0,
    },
  ];

  const tabs = [
    "All Accounts",
    "Asset",
    "Liability",
    "Equity",
    "Income",
    "Expense",
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          More Actions
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Pro Tip Alert */}
      <div className="mb-6 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0">
            <span className="text-pink-500 text-lg">✨</span>
          </div>
          <div className="flex-1">
            <span className="font-semibold">Pro Tip:</span> Turn on{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Advanced Accounting
            </a>{" "}
            to manage your accounts. We recommend turning this on only if you
            have accounting experience or in collaboration with an accountant.{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Learn more
            </a>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`py-2 px-1 -mb-px ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Accounts</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  Account / Parent Account
                </th>
                <th className="text-left py-3 px-4">Account Number</th>
                <th className="text-left py-3 px-4">
                  Account Type
                  <ChevronDown size={16} className="inline ml-1" />/ Account Sub
                  Type
                </th>
                <th className="text-right py-3 px-4">ProjectPulse Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={20} className="text-purple-600" />
                      <div>
                        <div className="font-medium">{account.name}</div>
                        {account.subLabel && (
                          <div className="text-sm text-gray-500">
                            {account.subLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{account.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div>{account.type}</div>
                      <div className="text-sm text-gray-500">
                        {account.subType}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    Rs.{account.balance.toFixed(2)} LKR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
