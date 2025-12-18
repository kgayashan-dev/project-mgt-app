"use client";
import React from "react";
import {
  FileText,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart2,
  TrendingUp,
  List,
  Clipboard,
  CheckSquare,
  Clock,
  PieChart,
  CheckCircle,
  Wallet,
  Star,
} from "lucide-react";

const Page = () => {
  // Define all report data internally
  const invoiceAndExpenseReports = [
    {
      id: 1,
      title: "Invoice Details",
      description:
        "A detailed summary of all invoices you've sent over a period of time",
      icon: FileText,
      isStarred: false,
    },
    {
      id: 2,
      title: "Expense Report",
      description:
        "See how much money you're spending, and where you're spending it",
      icon: DollarSign,
      isStarred: true,
    },
    {
      id: 3,
      title: "Item Sales",
      description: "See how much money you're making from each item you sell",
      icon: ShoppingCart,
      isStarred: false,
    },
    {
      id: 4,
      title: "Revenue by Client",
      description:
        "A breakdown of how much revenue each of your clients is bringing in",
      icon: Users,
      isStarred: false,
    },
  ];

  const paymentReports = [
    {
      id: 5,
      title: "Accounts Aging",
      description: "Find out which clients are taking a long time to pay",
      icon: BarChart2,
      isStarred: false,
    },
    {
      id: 6,
      title: "Payments Collected",
      description:
        "A summary of all the payments you have collected over a period of time",
      icon: DollarSign,
      isStarred: true,
    },
    {
      id: 7,
      title: "Accounts Payable Aging",
      description: "Find out how much each vendor needs to be paid",
      icon: Clipboard,
      isStarred: false,
    },
    {
      id: 8,
      title: "Credit Balance",
      description: "Find out how much each vendor needs to be paid",
      icon: CheckSquare,
      isStarred: false,
    },
  ];

  const accountingReports = [
    {
      id: 1,
      title: "Balance Sheet",
      description:
        "A snapshot of your company's assets, liabilities, and equity at any given point in time",
      icon: PieChart,
      isStarred: false,
    },
    {
      id: 2,
      title: "Profit and Loss",
      description:
        "Helps determine what you owe in taxes and if you're making more than you're spending",
      icon: TrendingUp,
      isStarred: true,
    },
    {
      id: 3,
      title: "General Ledger",
      description:
        "A complete record of transactions and balances for all your accounts",
      icon: List,
      isStarred: false,
    },
    {
      id: 4,
      title: "Trial Balance",
      description: "A quick gut check to make sure your books are balanced",
      icon: CheckCircle,
      isStarred: false,
    },
    {
      id: 5,
      title: "Bank Reconciliation Summary",
      description:
        "Helps you see FreshBooks Entries and Bank Transactions that have not been reconciled",
      icon: BarChart2,
      isStarred: false,
    },
    {
      id: 6,
      title: "Sales Tax Summary",
      description:
        "Helps determine how much you owe the government in Sales Taxes",
      icon: DollarSign,
      isStarred: false,
    },
    {
      id: 7,
      title: "Cash Flow",
      description: "Overview of Cash coming in and going out of your business",
      icon: Wallet,
      isStarred: false,
    },
    {
      id: 8,
      title: "Journal Entry",
      description:
        "Helps you see all the Manual Journal Entries and Adjustments made to your books",
      icon: FileText,
      isStarred: false,
    },
  ];

  const timeTrackingProjectReports = [
    {
      id: 1,
      title: "Time Entry Details",
      description:
        "A detailed summary of how much time you and / or your team tracked over a period of time",
      icon: Clock,
      isStarred: false,
    },
    {
      id: 2,
      title: "Retainer Summary",
      description: "A detailed work summary for your retainer clients",
      icon: Users,
      isStarred: true,
    },
    {
      id: 3,
      title: "Profitability Summary",
      description:
        "View a summary of a client's profitability across all their projects",
      icon: TrendingUp,
      isStarred: false,
    },
    {
      id: 4,
      title: "Profitability Details",
      description:
        "Get a detailed breakdown of project profitability by service and expense categories",
      icon: BarChart2,
      isStarred: false,
    },
    {
      id: 5,
      title: "Team Utilization",
      description:
        "Overview of billable hours from team members against their expected capacity",
      icon: Users,
      isStarred: false,
    },
  ];
  const logs = [
    {
      id: 1,
      title: "Audit Logs",
      description: "View changes",
      icon: Clock,
      isStarred: false,
    },
  ];
  const payroll = [
    {
      id: 1,
      title: "Payroll Journal",
      description: "Get detailed information about payroll",
      icon: Clock,
      isStarred: false,
    },
    {
      id: 2,
      title: "Contractor Payment",
      description: "Get detailed information for eacg contracts",
      icon: Clock,
      isStarred: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-12">Reports</h1>

      {/* Favorite Reports Section */}
      {/* <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Favorite Reports
        </h2>
        <div className="grid grid-cols-6 gap-2">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-100 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="text-blue-600 italic text-xs mt-2">
          Easy access to your favorite reports
        </div>
      </section> */}

      {/* Invoice and Expense Reports */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Invoice and Expense Reports
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {invoiceAndExpenseReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all relative"
            >
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <report.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="regular-14 font-semibold mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 regular-12">{report.description}</p>
                </div>
                <button
                  className={`absolute top-4 right-4 hover:scale-110 transition-transform ${
                    report.isStarred ? "text-yellow-400" : "text-gray-300"
                  }`}
                  aria-label={
                    report.isStarred
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    size={20}
                    fill={report.isStarred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payments Reports */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Payments Reports
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {paymentReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all relative"
            >
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <report.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="regular-14 font-semibold mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 regular-12">{report.description}</p>
                </div>
                <button
                  className={`absolute top-4 right-4 hover:scale-110 transition-transform ${
                    report.isStarred ? "text-yellow-400" : "text-gray-300"
                  }`}
                  aria-label={
                    report.isStarred
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    size={20}
                    fill={report.isStarred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Accounting Reports
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {accountingReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all relative"
            >
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <report.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="regular-14 font-semibold mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 regular-12">{report.description}</p>
                </div>
                <button
                  className={`absolute top-4 right-4 hover:scale-110 transition-transform ${
                    report.isStarred ? "text-yellow-400" : "text-gray-300"
                  }`}
                  aria-label={
                    report.isStarred
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    size={20}
                    fill={report.isStarred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Time tracking and project reports */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Time Tracking and Project Reports
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {timeTrackingProjectReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all relative"
            >
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <report.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="regular-14 font-semibold mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 regular-12">
                    {report.description}
                  </p>
                </div>
                <button
                  className={`absolute top-4 right-4 hover:scale-110 transition-transform ${
                    report.isStarred ? "text-yellow-400" : "text-gray-300"
                  }`}
                  aria-label={
                    report.isStarred
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    size={20}
                    fill={report.isStarred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Logs */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Logs</h2>
        <div className="grid grid-cols-2 gap-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all relative"
            >
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <log.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="regular-14 font-semibold mb-2">{log.title}</h3>
                  <p className="text-gray-600 regular-12">{log.description}</p>
                </div>
                <button
                  className={`absolute top-4 right-4 hover:scale-110 transition-transform ${
                    log.isStarred ? "text-yellow-400" : "text-gray-300"
                  }`}
                  aria-label={
                    log.isStarred ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Star
                    size={20}
                    fill={log.isStarred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Payroll */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Logs</h2>
        <div className="grid grid-cols-2 gap-2">
          {payroll.map((payroll) => (
            <div
              key={payroll.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all relative"
            >
              <div className="flex gap-4">
                <div className="text-blue-600">
                  <payroll.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="regular-14 font-semibold mb-2">
                    {payroll.title}
                  </h3>
                  <p className="text-gray-600 regular-12">
                    {payroll.description}
                  </p>
                </div>
                <button
                  className={`absolute top-4 right-4 hover:scale-110 transition-transform ${
                    payroll.isStarred ? "text-yellow-400" : "text-gray-300"
                  }`}
                  aria-label={
                    payroll.isStarred
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    size={20}
                    fill={payroll.isStarred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
