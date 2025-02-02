import React from "react";
import { FileText, DollarSign, BarChart2, Scale } from "lucide-react";
import Link from "next/link";

const AccountingDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
        <div className="flex items-center gap-2">
          {/* <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Add Bank Account
          </button> */}
        </div>
      </div>

      {/* Bank Reconciliation Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bank Reconciliation
        </h2>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="relative">
              <img
                src="/image.png"
                alt="Bank reconciliation preview"
                className="rounded-lg shadow-md"
              />
            </div>
            <div>
              <h3 className="text-2xl text-blue-600 font-semibold mb-4">
                A little bookkeeping goes a long way
              </h3>
              <p className="text-gray-600 mb-4">
                Don&apos;t wait until crunch time to get your books organized.
                Use Bank Reconciliation on a regular basis to keep your books
                organized throughout the year.
                <a href="#" className="text-blue-600 ml-2">
                  Learn More
                </a>
              </p>
              <button className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800">
                Add Bank Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accounting Reports Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Accounting Reports
          </h2>
          <span className="text-blue-600 italic">
            Get a snapshot of your financial position
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Profit and Loss */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <Link href={"/user/reports/profit-loss"}>
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Profit and Loss
                  </h3>
                  <p className="text-gray-600">
                    Helps determine what you owe in taxes and if you&apos;re
                    making more than you&apos;re spending
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* General Ledger */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  General Ledger
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    UPDATED
                  </span>
                </h3>
                <p className="text-gray-600">
                  A complete record of transactions and balances for all your
                  accounts. Updated with new style and functionality.
                </p>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <BarChart2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Balance Sheet</h3>
                <p className="text-gray-600">
                  A snapshot of your company&apos;s assets, liabilities, and
                  equity at any given point in time
                </p>
              </div>
            </div>
          </div>

          {/* Trial Balance */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Trial Balance</h3>
                <p className="text-gray-600">
                  A quick gut check to make sure your books are balanced
                </p>
              </div>
            </div>
          </div>
          {/* Bank reconciliation */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Trial Balance</h3>
                <p className="text-gray-600">
                  Helps you see FreshBooks Entries and Bank Transactions that
                  have not been reconciled
                </p>
              </div>
            </div>
          </div>
          {/* Sales Tax Summary */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Sales Tax Summary
                </h3>
                <p className="text-gray-600">
                  Helps determine how much you owe the government in Sales Taxes
                </p>
              </div>
            </div>
          </div>
          {/* Cash Flow*/}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Cash Flow</h3>
                <p className="text-gray-600">
                  Overview of Cash coming in and going out of your business
                </p>
              </div>
            </div>
          </div>
          {/* Journal Entry*/}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="text-blue-600">
                <Scale size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Journal Entry</h3>
                <p className="text-gray-600">
                  Helps you see all the Manual Journal Entries and Adjustments
                  made to your books
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountingDashboard;
