/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Eye,
  Download,
  MoreVertical,
  Calendar,
  Hash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/converts";

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
  outstandingRevenue?: number;
  overdueAmount?: number;
  draftAmount?: number;
  unbilledTime?: string;
  unbilledExpenses?: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  poNo: string | null;
  bankAccId: string;
  invoiceDate: string;
  quotationID: string | null;
  remarks: string;
  clientID: string;
  subtotal: number;
  tax: number;
  invoiceTotal: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  createdDate: string;
  status: string;
}

interface ClientDetailsProps {
  initialData: ClientData;
  clientId: string;
  initialInvoices?: Invoice[];
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
      <span className="text-lg font-bold">{value}</span>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const [showActions, setShowActions] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xs font-semibold text-gray-800">{invoice.invoiceNo}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>{invoice.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right mr-4">
          <div className="text-xs font-bold text-gray-900">
            {formatCurrency(invoice.invoiceTotal)}
          </div>
          <div className="text-xs text-gray-500">
            {invoice.items.length} items
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                className="w-full px-4 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2"
                onClick={() => router.push(`/user/invoices/${invoice.id}`)}
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button className="w-full px-4 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientDetailsUI({
  initialData,
  clientId,
  initialInvoices = [],
}: ClientDetailsProps) {
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [loading, setLoading] = useState(false);
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

  // Calculate financial data from invoices
  const financialData = {
    outstandingRevenue: invoices.reduce((sum, inv) => 
      inv.status.toLowerCase() === 'sent' ? sum + inv.invoiceTotal : sum, 0
    ),
    overdueAmount: invoices.reduce((sum, inv) => 
      inv.status.toLowerCase() === 'overdue' ? sum + inv.invoiceTotal : sum, 0
    ),
    draftAmount: invoices.reduce((sum, inv) => 
      inv.status.toLowerCase() === 'draft' ? sum + inv.invoiceTotal : sum, 0
    ),
    unbilledTime: "0h 00m", // You might need to calculate this separately
    unbilledExpenses: 0, // You might need to calculate this separately
  };

  const menuItems = [
    { 
      icon: <FileText className="w-5 h-5 text-gray-600" />, 
      label: "Invoice",
      onClick: () => router.push("/user/invoices/new")
    },
    { icon: <Pizza className="w-5 h-5 text-gray-600" />, label: "Expense" },
    { icon: <DollarSign className="w-5 h-5 text-gray-600" />, label: "Credit" },
    {
      icon: <Cloud className="w-5 h-5 text-gray-600" />,
      label: "Quotations",
      onClick: () => router.push("/user/estimates/new"),
    },
    {
      icon: <FlaskConical className="w-5 h-5 text-gray-600" />,
      label: "Projects",
    },
  ];

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Header - same as before */}
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

      {/* Main Content - same as before */}
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

        <div className="grid grid-cols-12 gap-4">
          {/* Client Info Card - same as before */}
          <div className="col-span-4 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg font-semibold">
                  {initialData.initials}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-semibold">{initialData.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  {initialData.location}
                </p>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-800">{initialData.contactEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-gray-800">{initialData.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Business Type</p>
                <p className="text-gray-800">{initialData.businessType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Billing Cycle</p>
                <p className="text-gray-800">{initialData.billingCycle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Client Since</p>
                <p className="text-gray-800">{formatDate(initialData.clientSince)}</p>
              </div>
            </div>
          </div>

          {/* Revenue Card - updated with real data */}
          <div className="col-span-8 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold">Outstanding Revenue</h3>
              <span className="text-2xl font-bold">
                ${financialData.outstandingRevenue.toFixed(2)}
              </span>
            </div>
            <div className="mb-6">
              <div className="h-2 bg-gray-100 rounded-full">
                {/* Progress bar would go here */}
              </div>
              <p className="text-gray-600 text-center mt-2">
                {financialData.overdueAmount === 0 ? "Invoices are all paid" : `$${financialData.overdueAmount.toFixed(2)} overdue`}
              </p>
            </div>

            <div className="flex items-center justify-between text-center">
              <MetricCard
                icon={<Receipt className="mx-auto mb-2" />}
                value={`$${financialData.draftAmount.toFixed(2)}`}
                label="in draft"
              />
              <MetricCard
                icon={<Clock className="mx-auto mb-2" />}
                value={financialData.unbilledTime}
                label="unbilled time"
              />
              <MetricCard
                icon={<WifiIcon className="mx-auto mb-2" />}
                value={`$${financialData.unbilledExpenses.toFixed(2)}`}
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
        
    

          "Expenses",
          "Quotations",
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
          <h2 className="text-lg font-bold">
            {activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)} for {initialData.name}
          </h2>
          <button 
            className="text-green-500 hover:text-green-600 transition-colors"
            onClick={() => router.push("/user/invoices/new")}
          >
            <PlusSquare size={24} />
          </button>
        </div>

        {/* Invoices List */}
        {activeSubTab === "invoices" && (
          <div>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xs font-semibold text-gray-600 mb-2">No invoices found</h3>
                <p className="text-gray-500">Create your first invoice for this client</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-xs text-gray-600">
                  Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                </div>
                {invoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeSubTab !== "invoices" && (
          <div className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg mb-4"></div>
            <div className="h-16 bg-gray-100 rounded-lg mb-4"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        )}
      </div>
    </div>
  );
}