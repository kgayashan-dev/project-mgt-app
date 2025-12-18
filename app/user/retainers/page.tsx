import React from "react";
import { Search, Handshake, Timer, LineChart } from 'lucide-react';

interface RetainerItem {
  client: string;
  nextInvoice: string;
  remaining: string;
  fee: string;
  period: string;
  totalRevenue: string;
  status: string;
}

const Retainers = () => {
  return (
    <div className="flex flex-col items-center  bg-gray-100 ">
      <div className="w-full  ">
        <h1 className="text-3xl font-bold mb-8 mt-6 text-start">
          Reccuring Template
        </h1>
        <div className="border-[1px] my-4"></div>
      </div>

      <div className=" mx-auto  space-y-8">
        {/* Get Started Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-center text-blue-500 mb-12">
            Get Started With Retainers
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-blue-500 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
                <Handshake className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-sm font-semibold">
                Set Terms and Send Invoice
              </h3>
              <p className="text-gray-600">
                Set retainer terms and billing schedule to create a recurring
                invoice.
              </p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                Let's Do It
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-pink-200 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
                <Timer className="w-12 h-12 text-pink-500" />
              </div>
              <h3 className="text-sm font-semibold">Track Time</h3>
              <p className="text-gray-600">
                Track hours against your retainer and invoice extra time spent
                for that period.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-yellow-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
                <LineChart className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-sm font-semibold">View Client Report</h3>
              <p className="text-gray-600">
                See how profitable you are and share work summaries with
                clients.
              </p>
            </div>
          </div>
        </div>

        {/* Retainers List Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">All Retainers</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-4 text-gray-600">Client</th>
                  <th className="text-left pb-4 text-gray-600">
                    Next Invoice / Remaining
                  </th>
                  <th className="text-left pb-4 text-gray-600">Fee / Period</th>
                  <th className="text-left pb-4 text-gray-600">
                    Total Revenue / Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Loading state placeholder rows */}
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Retainers;
