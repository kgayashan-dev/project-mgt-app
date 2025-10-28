// components/clientDetails.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  FileText,

  Pizza,
  DollarSign,
  Cloud,

  FlaskConical,
  ChevronLeft,
  MoreHorizontal,
  PlusSquare,
  Clock,
  Receipt,
  WifiIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientData {
  id: string;
  name: string;
  initials: string;
  location: string;
  contactEmail: string;
  phoneNumber: string;
  businessType: string;
  billingCycle: string;
  createdAt: string;
  lastActive: string;
  clientSince: string;
  // Optional fields that might not be in your API yet
  outstandingRevenue?: number;
  overdueAmount?: number;
  draftAmount?: number;
  unbilledTime?: string;
  unbilledExpenses?: number;
}

interface ClientDetailsProps {
  initialData: ClientData;
  clientId: string;
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function TabButton({ isActive, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border-b-2 whitespace-nowrap ${
        isActive ? "border-blue-500 text-blue-500" : "border-transparent"
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({ icon, value, label }: MetricCardProps) {
  return (
    <div>
      {icon}
      <span className="text-xl font-bold">{value}</span>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

export default function ClientDetailsUI({
  initialData,
  clientId,
}: ClientDetailsProps) {
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("invoices");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: <FileText className="w-5 h-5 text-gray-600" />, label: "Invoice" },
    { icon: <Pizza className="w-5 h-5 text-gray-600" />, label: "Expense" },
    { icon: <DollarSign className="w-5 h-5 text-gray-600" />, label: "Credit" },
    {
      icon: <Cloud className="w-5 h-5 text-gray-600" />,
      label: "Estimate",
      onClick: () => router.push("/user/estimates/new"),
    },
    {
      icon: <FlaskConical className="w-5 h-5 text-gray-600" />,
      label: "Project",
    },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Default values for financial data (you can remove these once your API includes them)
  const financialData = {
    outstandingRevenue: initialData.outstandingRevenue || 0,
    overdueAmount: initialData.overdueAmount || 0,
    draftAmount: initialData.draftAmount || 0,
    unbilledTime: initialData.unbilledTime || "0h 00m",
    unbilledExpenses: initialData.unbilledExpenses || 0,
  };

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Clients</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="text-gray-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              More Actions
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              Create New...
              <ChevronDown size={16} />
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 text-gray-700 transition-colors"
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="text-base">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
          {clientId} , {initialData.name} 
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </h1>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-4 border-b mb-8">
          <TabButton
            isActive={activeMainTab === "overview"}
            onClick={() => setActiveMainTab("overview")}
            label="Overview"
          />
          <TabButton
            isActive={activeMainTab === "relationship"}
            onClick={() => setActiveMainTab("relationship")}
            label="Relationship"
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Client Info Card */}
          <div className="col-span-4 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl font-semibold">
                  {initialData.initials}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{initialData.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  {initialData.location}
                </p>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{initialData.contactEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800">{initialData.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="text-gray-800">{initialData.businessType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="text-gray-800">{initialData.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client Since</p>
                <p className="text-gray-800">{formatDate(initialData.clientSince)}</p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="col-span-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Outstanding Revenue</h3>
              <span className="text-2xl font-bold">
                ${financialData.outstandingRevenue}
              </span>
            </div>
            <div className="mb-6">
              <div className="h-2 bg-gray-100 rounded-full">
                {/* Progress bar would go here */}
              </div>
              <p className="text-gray-600 text-center mt-2">
                {financialData.overdueAmount === 0 ? "Invoices are all paid" : `$${financialData.overdueAmount} overdue`}
              </p>
            </div>

            <div className="flex items-center justify-between text-center">
              <MetricCard
                icon={<Receipt className="mx-auto mb-2" />}
                value={`$${financialData.draftAmount}`}
                label="in draft"
              />
              <MetricCard
                icon={<Clock className="mx-auto mb-2" />}
                value={financialData.unbilledTime}
                label="unbilled time"
              />
              <MetricCard
                icon={<WifiIcon className="mx-auto mb-2" />}
                value={`$${financialData.unbilledExpenses}`}
                label="unbilled expenses"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tabs Navigation */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto">
        {[
          "Invoices",
          "Recurring Templates",
          "Contacts",
          "Retainer",
          "Credits",
          "Checkout Links",
          "Expenses",
          "Estimates",
        ].map((tab) => (
          <TabButton
            key={tab}
            isActive={activeSubTab === tab.toLowerCase()}
            onClick={() => setActiveSubTab(tab.toLowerCase())}
            label={tab}
          />
        ))}
      </div>

      {/* Content Section based on active sub tab */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)} for {initialData.name}
          </h2>
          <button className="text-green-500 hover:text-green-600 transition-colors">
            <PlusSquare size={24} />
          </button>
        </div>

        {/* Placeholder content */}
        <div className="animate-pulse">
          <div className="h-16 bg-gray-100 rounded-lg mb-4"></div>
          <div className="h-16 bg-gray-100 rounded-lg mb-4"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}