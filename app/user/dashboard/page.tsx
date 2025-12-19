"use client";
import React from "react";
import RevenueStreams from "@/components/RevenueStreams";
import { FaUsers, FaChartBar, FaClipboardList, FaBuilding, FaFileInvoice, FaMoneyBillWave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const Dashboard = () => {
  const router = useRouter();
  const userName = "John Doe";

  const data = [
    { name: "Product Sales", value: 400, color: "#3B82F6" },
    { name: "Subscriptions", value: 300, color: "#10B981" },
    { name: "Services", value: 200, color: "#F59E0B" },
    { name: "Partnerships", value: 100, color: "#EF4444" },
  ];

  const statsCards = [
    {
      title: "Total Revenue",
      value: "$24,580",
      change: "+12.5%",
      trend: "up",
      icon: <FaMoneyBillWave className="text-green-500" />,
      color: "bg-gradient-to-r from-green-50 to-green-100",
    },
    {
      title: "Active Projects",
      value: "8",
      change: "+2",
      trend: "up",
      icon: <FaClipboardList className="text-blue-500" />,
      color: "bg-gradient-to-r from-blue-50 to-blue-100",
    },
    {
      title: "Outstanding Invoices",
      value: "$5,430",
      change: "-$320",
      trend: "down",
      icon: <FaFileInvoice className="text-amber-500" />,
      color: "bg-gradient-to-r from-amber-50 to-amber-100",
    },
    {
      title: "Clients",
      value: "24",
      change: "+3",
      trend: "up",
      icon: <FaUsers className="text-purple-500" />,
      color: "bg-gradient-to-r from-purple-50 to-purple-100",
    },
  ];

  const quickActions = [
    {
      icon: <FaUsers />,
      title: "Quotations",
      url: "quotations",
      value: "Create a Quotation",
      img: "/Estimate.png",
      htag: "Win New Clients",
      ptag: "Get on the same page as your clients with a few clicks, before the work kicks off.",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <FaChartBar />,
      title: "Expenses",
      url: "expenses",
      value: "Add an Expense",
      img: "/Expenses.png",
      htag: "Track All Your Expenses",
      ptag: "Take a picture of your receipt on your phone or log it manually to track expenses.",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: <FaClipboardList />,
      title: "Bank",
      url: "mybank-details",
      value: "Connect Your Bank",
      img: "/Bank.png",
      htag: "Your Bank Details",
      ptag: "Get real-time insights into your cash flow and spending with bank integration.",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: <FaBuilding />,
      title: "My Company",
      url: "mycompany-details",
      value: "Company Details",
      img: "/Company.png",
      htag: "Company Profile",
      ptag: "Manage your company information and settings in one place.",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-blue-600">{userName}</span>! Here is your overview.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => router.push("/user/invoices/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + New Invoice
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className={`${stat.color} p-5 rounded-xl shadow-sm border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
            <div className="flex items-center mt-4">
              {stat.trend === "up" ? (
                <FiTrendingUp className="text-green-500 mr-1" />
              ) : (
                <FiTrendingDown className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 text-sm ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue and Expenses Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Revenue & Expenses</h2>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-72 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">📈</div>
                <p className="text-gray-500">Interactive chart will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Revenue vs Expenses over time</p>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          {/* Outstanding Invoices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Outstanding Invoices</h2>
              <button
                onClick={() => router.push("/user/invoices")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {[
                { client: "Acme Corp", amount: "$2,500", days: 15 },
                { client: "Globex Inc", amount: "$1,800", days: 30 },
                { client: "Soylent Corp", amount: "$3,200", days: 45 },
                { client: "Initech", amount: "$950", days: 60 },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FaFileInvoice className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invoice.client}</p>
                      <p className="text-sm text-gray-500">{invoice.days} days overdue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{invoice.amount}</p>
                    <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                      Send Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions and Revenue Streams */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <SummaryCard key={index} {...action} router={router} />
              ))}
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Streams</h2>
            <RevenueStreams data={data} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "Invoice paid", client: "Acme Corp", time: "2 hours ago", type: "success" },
                { action: "New quotation sent", client: "Globex Inc", time: "1 day ago", type: "info" },
                { action: "Expense added", client: "Office Supplies", time: "2 days ago", type: "warning" },
                { action: "Client added", client: "Soylent Corp", time: "3 days ago", type: "success" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === "success" ? "bg-green-500" :
                    activity.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.client} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  htag: string;
  img: string;
  ptag: string;
  url: string;
  value: string;
  router: ReturnType<typeof useRouter>;
  bgColor: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  url,
  value,
  htag,
  ptag,
  img,
  router,
  bgColor,
  iconColor,
}) => (
  <div className={`${bgColor} p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg ${iconColor} bg-white`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="h-32 rounded-lg overflow-hidden mb-3 bg-white flex items-center justify-center">
      <img src={img} alt={title} className="h-full object-cover" />
    </div>
    <h4 className="font-medium text-gray-900 mb-2 text-sm">{htag}</h4>
    <p className="text-gray-600 text-xs mb-4 line-clamp-2">{ptag}</p>
    <button
      onClick={() => router.push(`/user/${url}`)}
      className="w-full py-2 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition border border-gray-300 text-sm"
    >
      {value}
    </button>
  </div>
);

export default Dashboard;