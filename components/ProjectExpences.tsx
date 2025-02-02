import React from "react";
import { ChevronDown, Search, Plus } from "lucide-react";
const ProjectExpences = () => {
  return (
    <div className="">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Expences</h1>
          <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 text-sm py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow">
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
            {/* {table.map((bill) => ( */}
            <tr className="hover:bg-gray-10">
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {/* {bill.description} */}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {/* {bill.description} */}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {/* {bill.issueDate} */}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="text-sm font-medium text-gray-900">
                  {/* Rs. {formatCurrency(bill.amount)} */}
                </div>
                <span className="inline-flex bg-slate-300 rounded-full px-2 text-xs font-semibold">
                  {/* {bill.status} */}
                </span>
              </td>
            </tr>
            {/* ))} */}
          </tbody>
        </table>
        <div className="flex justify-end px-4 py-2  border-t">
          <div className="text-sm text-gray-700">
            Grand Total: Rs.{" "}
            {/* {formatCurrency(
            table.reduce((total, bill) => total + bill.amount, 0)
          )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectExpences;
