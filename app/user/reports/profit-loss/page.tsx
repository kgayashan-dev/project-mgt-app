"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MoreHorizontal, Filter, Maximize2, ChevronDown, ChevronUp } from "lucide-react";

const ProfitAndLoss = () => {
  // Sample data for each month
  const sampleData = {
    Jan: {
      income: [
        { name: "Sales", icon: "💰", values: [12000.0, 13000.0, 14000.0, 15000.0, 16000.0, 17000.0] },
        { name: "Less Cost of Goods Sold", icon: "📦", values: [5000.0, 5500.0, 6000.0, 6500.0, 7000.0, 7500.0] },
      ],
      expenses: [
        { name: "Advertising", icon: "📢", values: [1000.0, 1100.0, 1200.0, 1300.0, 1400.0, 1500.0] },
        {
          name: "Office Expenses & Pos...",
          icon: "🏢",
          values: [490.2, 500.0, 510.0, 520.0, 530.0, 540.0],
          subItems: [
            { name: "Hardware", icon: "🔧", values: [200.0, 210.0, 220.0, 230.0, 240.0, 250.0] },
            { name: "Software", icon: "💻", values: [290.2, 290.0, 290.0, 290.0, 290.0, 290.0] },
          ],
        },
      ],
    },
    Feb: {
      income: [
        { name: "Sales", icon: "💰", values: [14000.0, 15000.0, 16000.0, 17000.0, 18000.0, 19000.0] },
        { name: "Less Cost of Goods Sold", icon: "📦", values: [6000.0, 6500.0, 7000.0, 7500.0, 8000.0, 8500.0] },
      ],
      expenses: [
        { name: "Advertising", icon: "📢", values: [1200.0, 1300.0, 1400.0, 1500.0, 1600.0, 1700.0] },
        {
          name: "Office Expenses & Pos...",
          icon: "🏢",
          values: [500.0, 510.0, 520.0, 530.0, 540.0, 550.0],
          subItems: [
            { name: "Hardware", icon: "🔧", values: [220.0, 230.0, 240.0, 250.0, 260.0, 270.0] },
            { name: "Software", icon: "💻", values: [280.0, 280.0, 280.0, 280.0, 280.0, 280.0] },
          ],
        },
      ],
    },
    Mar: {
      income: [
        { name: "Sales", icon: "💰", values: [16000.0, 17000.0, 18000.0, 19000.0, 20000.0, 21000.0] },
        { name: "Less Cost of Goods Sold", icon: "📦", values: [7000.0, 7500.0, 8000.0, 8500.0, 9000.0, 9500.0] },
      ],
      expenses: [
        { name: "Advertising", icon: "📢", values: [1400.0, 1500.0, 1600.0, 1700.0, 1800.0, 1900.0] },
        {
          name: "Office Expenses & Pos...",
          icon: "🏢",
          values: [520.0, 530.0, 540.0, 550.0, 560.0, 570.0],
          subItems: [
            { name: "Hardware", icon: "🔧", values: [240.0, 250.0, 260.0, 270.0, 280.0, 290.0] },
            { name: "Software", icon: "💻", values: [280.0, 280.0, 280.0, 280.0, 280.0, 280.0] },
          ],
        },
      ],
    },
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [currentMonth, setCurrentMonth] = useState("Jan");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (name: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const currentIndex = months.indexOf(currentMonth);
    if (direction === "prev" && currentIndex > 0) {
      setCurrentMonth(months[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < months.length - 1) {
      setCurrentMonth(months[currentIndex + 1]);
    }
  };

  const { income, expenses } = sampleData[currentMonth];

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
            <h1 className="text-2xl font-bold text-navy-900">Profit and Loss</h1>
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
                <p>For {currentMonth} 1, 2025 - {currentMonth} 31, 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange("prev")}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg border border-gray-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMonthChange("next")}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg border border-gray-300"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3"></th>
                  {months.map((month) => (
                    <th key={month} className="text-left py-3 px-4 text-blue-600">
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
                {income.map((item, index) => (
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

                {/* Expenses Section */}
                <tr className="font-medium">
                  <td colSpan={8} className="py-4">
                    Less Expenses
                  </td>
                </tr>
                {expenses.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-t">
                      <td className="py-2 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.name}
                        {item.subItems && (
                          <button
                            onClick={() => toggleRow(item.name)}
                            className="ml-2 text-gray-600 hover:text-gray-800"
                          >
                            {expandedRows[item.name] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                      {item.values.map((value, i) => (
                        <td key={i} className="py-2 px-4">
                          {value}
                        </td>
                      ))}
                    </tr>
                    {item.subItems && expandedRows[item.name] && item.subItems.map((subItem, subIndex) => (
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;