import React from "react";
import Link from "next/link";
import { ChevronLeft, MoreHorizontal, Filter, Maximize2 } from "lucide-react";

const ProfitAndLoss = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const incomeData = [
    {
      name: "Sales",
      icon: "💰",
      values: [0.0, "-", "-", "-", "-", "-", "-"],
    },
    {
      name: "Less Cost of Goods Sold",
      icon: "📦",
      values: [0.0, "-", "-", "-", "-", "-", "-"],
    },
  ];

  const expenseData = [
    {
      name: "Advertising",
      icon: "📢",
      values: [1000.0, "-", "-", "-", "-", "-", "-"],
    },
    {
      name: "Office Expenses & Pos...",
      icon: "🏢",
      values: [490.2, "-", "-", "-", "-", "-", "-"],
      subItems: [
        {
          name: "Hardware",
          icon: "🔧",
          values: [490.2, "-", "-", "-", "-", "-", "-"],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-10 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/user/reports"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Reports
            </Link>
            <h1 className="text-2xl font-bold text-navy-900">
              Profit and Loss
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2">
              <MoreHorizontal className="w-4 h-4" />
              More Actions
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Send...
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Statement Card */}
        <div className="bg-white rounded-lg shadow flex-1 p-6 max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">
                Profit and Loss
              </h2>
              <div className="text-gray-600">
                <p>Lahiru&apos;s Company</p>
                <p>Income Billed (USD)</p>
                <p>For Jan 1, 2025 - Dec 31, 2025</p>
              </div>
            </div>
            <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg border border-gray-300">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto text-sm">
            <table className="w-48">
              <thead>
                <tr className="border-b overflow-x-scroll w-[60vh] ">
                  <th className="text-left py-3 "></th>
                  {months.map((month) => (
                    <th
                      key={month}
                      className="text-left py-3 px-4  text-blue-600"
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Income Section */}
                <tr className="font-medium">
                  <td colSpan={8} className="py-4">
                    Income (Billed)*
                  </td>
                </tr>
                {incomeData.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 flex items-center gap-2">
                      <span>{item.icon}</span>
                      {item.name}
                    </td>
                    {item.values.map((value, i) => (
                      <td key={i} className="py-2 px-4">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Gross Profit */}
                <tr className="border-t font-medium">
                  <td className="py-3">Gross Profit</td>
                  <td className="py-3 px-4">$0.00</td>
                  {Array(6)
                    .fill("-")
                    .map((_, i) => (
                      <td key={i} className="py-3 px-4">
                        -
                      </td>
                    ))}
                </tr>

                {/* Gross Margin */}
                <tr className="border-t">
                  <td className="py-3">Gross Margin</td>
                  <td className="py-3 px-4">0%</td>
                  {Array(6)
                    .fill("-")
                    .map((_, i) => (
                      <td key={i} className="py-3 px-4">
                        -
                      </td>
                    ))}
                </tr>

                {/* Expenses Section */}
                <tr className="font-medium">
                  <td colSpan={8} className="py-4">
                    Less Expenses
                  </td>
                </tr>
                {expenseData.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-t">
                      <td className="py-2 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.name}
                      </td>
                      {item.values.map((value, i) => (
                        <td key={i} className="py-2 px-4">
                          {value}
                        </td>
                      ))}
                    </tr>
                    {item.subItems?.map((subItem, subIndex) => (
                      <tr key={subIndex} className="text-gray-600">
                        <td className="py-2 pl-8 flex items-center gap-2">
                          <span>{subItem.icon}</span>
                          {subItem.name}
                        </td>
                        {subItem.values.map((value, i) => (
                          <td key={i} className="py-2 px-4">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

                {/* Total Expenses */}
                <tr className="border-t font-medium">
                  <td className="py-3">Total Expenses</td>
                  <td className="py-3 px-4">$1,490.20</td>
                  {Array(6)
                    .fill("-")
                    .map((_, i) => (
                      <td key={i} className="py-3 px-4">
                        -
                      </td>
                    ))}
                </tr>

                {/* Net Profit */}
                <tr className="border-t font-medium text-red-600">
                  <td className="py-3">Net Profit</td>
                  <td className="py-3 px-4">($1,490.20)</td>
                  {Array(6)
                    .fill("-")
                    .map((_, i) => (
                      <td key={i} className="py-3 px-4">
                        -
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Settings</h2>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-10 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium">Filters</h3>
                  <p className="text-sm text-gray-600">No filters applied</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;
