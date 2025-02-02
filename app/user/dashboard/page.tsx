"use client";
import React from "react";

import RevenueStreams from "@/components/RevenueStreams";
import { FaUsers, FaChartBar, FaClipboardList } from "react-icons/fa";

const Dashboard = () => {
  const data = [
    { name: "Product Sales", value: 400, color: "#3B82F6" },
    { name: "Subscriptions", value: 300, color: "#10B981" },
    { name: "Services", value: 200, color: "#F59E0B" },
    { name: "Partnerships", value: 100, color: "#EF4444" },
  ];

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <main className="w-full  ">
        <h1 className="text-3xl font-bold mb-8 mt-6 text-start">Dashboard</h1>
        <div className="border-[1px] my-4"></div>

        <div className="my-8">
          <h1>
            Welcome, Gayashan! Here's how to get the most out of ProjectPulse.
          </h1>
        </div>
        {/* Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SummaryCard
            icon={<FaUsers />}
            title="Estimate"
            value="Create an Estimate"
            img="/Estimate.png"
            htag="Win New Clients With Winning Estimates"
            ptag="Get on the same page as your clients with a few clicks, before the work kicks off."
          />
          <SummaryCard
            icon={<FaChartBar />}
            title="Expenses"
            value="Add an Expense"
            img="/Expenses.png"
            htag="Track All Your Expenses, From Anywhere"
            ptag="Let FreshBooks track your receipts so you don’t have to. Take a picture of your receipt on your phone or log it manually to track it as an expense."
          />
          <SummaryCard
            icon={<FaClipboardList />}
            title="Bank"
            value="Connect Your Bank"
            img="/Bank.png"
            htag="Connect Your Bank to Track Transactions"
            ptag="Easily sync your bank account and get real-time insights into your cash flow and spending."
          />
        </div>

        {/* Revenue Section */}
        <div className="flex flex-col justify-normal gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Outstanding invoices</h2>
            {/* Placeholder for Bar Chart */}
            <div className="h-40 bg-gray-200 flex items-center justify-center rounded">
              <p className="text-gray-500"></p>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Revenue and Expences</h2>
            {/* Placeholder for Bar Chart */}
            <div className="h-64 bg-gray-200 flex items-center justify-center rounded">
              <p className="text-gray-500">Bar chart coming soon...</p>
            </div>
          </div>
          {/* profit section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Totoal profit</h2>
            {/* Placeholder for Bar Chart */}
            <div className="h-64 bg-gray-200 flex items-center justify-center rounded">
              <p className="text-gray-500">Chart coming soon...</p>
            </div>
          </div>

          <div>
            <RevenueStreams data={data} />
          </div>
        </div>
      </main>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  htag: string;
  img: string;
  ptag: string;
  value: string | number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  htag,
  ptag,
  img,
}) => (
  <div>
    <div className="bg-white p-6 rounded-lg shadow-lg h-[65vh] flex flex-col justify-between hover:shadow-2xl transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-500 text-3xl">{icon}</span>
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="bg-gray-100 rounded-lg overflow-hidden h-36 mb-4 flex items-center justify-center">
        <img src={img} alt={title} className="h-full object-cover" />
      </div>
      <div>
        <h2 className="text-lg font-bold mb-2 text-gray-800">{htag}</h2>
        <p className="text-gray-600 text-sm">{ptag}</p>
      </div>
      <button className="mt-6 py-3 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">
        {value}
      </button>
    </div>

    <div></div>
  </div>
);

export default Dashboard;
