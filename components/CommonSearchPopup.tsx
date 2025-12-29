/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Calendar, User, DollarSign, Receipt } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface SearchItem {
  id: string;
  number: string; // QuotationNumber or InvoiceNo
  date: string; // QuotationDate or InvoiceDate
  clientId: string;
  clientName: string;
  companyID: string;
  companyName: string;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  tax: number; // TotalTax for quotes, Tax for invoices
  total: number; // GrandTotal for quotes, InvoiceTotal for invoices
  terms?: string;
  status?: string;
  createdDate?: string;
  poNo?: string; // For invoices
  type: 'quotation' | 'invoice'; // Add type to identify
}

interface CommonSearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  searchType: 'quotation' | 'invoice'; // Required prop
  title?: string; // Optional custom title
}

const CommonSearchPopup = ({ 
  isOpen, 
  onClose, 
  searchType,
  title 
}: CommonSearchPopupProps) => {
  const router = useRouter();
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, searchType]); // Add searchType to dependencies

  const getApiEndpoint = () => {
    return searchType === 'quotation' 
      ? `${API_URL}/project_pulse/Quotation/searchQuotations`
      : `${API_URL}/project_pulse/Invoice/searchInvoices`;
  };

  const getDetailRoute = (id: string) => {
    return searchType === 'quotation' 
      ? `/user/quotations/${id}`
      : `/user/invoices/${id}`;
  };

  const getPlaceholderText = () => {
    return searchType === 'quotation'
      ? "Search by quotation #, client name, ID, company..."
      : "Search by invoice #, PO #, client name, ID, company...";
  };

  const getDefaultTitle = () => {
    return searchType === 'quotation' 
      ? "Search Quotations" 
      : "Search Invoices";
  };

  const fetchItems = async (searchParam = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        getApiEndpoint(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            searchValue: searchParam.toString(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`HTTP error! status: ${error.message || response.status}`);
      }

      const data = await response.json();
      
      // Transform data to common SearchItem format
      const transformedData = data.map((item: any) => ({
        id: item.id || item.Id,
        number: searchType === 'quotation' ? item.quotationNumber : item.invoiceNo,
        date: searchType === 'quotation' ? item.quotationDate : item.invoiceDate,
        clientId: item.clientId || item.clientID,
        clientName: item.clientName,
        companyID: item.companyID || item.companyId,
        companyName: item.companyName,
        discountPercentage: item.discountPercentage || 0,
        discountAmount: item.discountAmount || 0,
        subtotal: item.subtotal || 0,
        tax: searchType === 'quotation' ? item.totalTax : item.tax,
        total: searchType === 'quotation' ? item.grandTotal : item.invoiceTotal,
        terms: item.terms,
        status: item.status,
        createdDate: item.createdDate,
        poNo: item.poNo, // Only for invoices
        type: searchType
      }));

      setItems(transformedData);
    } catch (error) {
      console.log(`Error fetching ${searchType}s:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchItems(searchValue);
  };

  const handleReset = () => {
    setSearchValue("");
    fetchItems();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRowClick = (itemId: string) => {
    onClose();
    router.push(getDetailRoute(itemId));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status?: string) => {
    if (!status || status === "") return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("approved") || statusLower === "paid") 
      return "bg-green-100 text-green-800";
    if (statusLower.includes("pending") || statusLower === "unpaid") 
      return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("rejected") || statusLower === "cancelled") 
      return "bg-red-100 text-red-800";
    if (statusLower.includes("draft") || statusLower === "draft") 
      return "bg-blue-100 text-blue-800";
    if (statusLower.includes("overdue")) 
      return "bg-red-100 text-red-800";
    
    return "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = () => {
    return searchType === 'quotation' ? FileText : Receipt;
  };

  const getTypeSingular = () => {
    return searchType === 'quotation' ? 'quotation' : 'invoice';
  };

  const getTypePlural = () => {
    return searchType === 'quotation' ? 'quotations' : 'invoices';
  };

  const TypeIcon = getTypeIcon();
  const displayTitle = title || getDefaultTitle();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${searchType === 'quotation' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                <TypeIcon size={24} className={searchType === 'quotation' ? 'text-blue-600' : 'text-purple-600'} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{displayTitle}</h2>
                <p className="text-gray-600 mt-1">
                  Find {getTypePlural()} by any field
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={getPlaceholderText()}
                    autoFocus
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Search across all {getTypeSingular()} fields
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap transition-colors font-medium"
              >
                Show All
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap transition-colors font-medium"
              >
                <Search size={20} />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="p-6 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${searchType === 'quotation' ? 'border-blue-600' : 'border-purple-600'} mb-4`}></div>
                <p className="text-gray-600">Loading {getTypePlural()}...</p>
              </div>
            ) : items.length > 0 ? (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-medium text-gray-700">
                          {searchType === 'quotation' ? 'Quotation #' : 'Invoice #'}
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-700">
                          Date
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-700">
                          Client
                        </th>
                        {searchType === 'invoice' && (
                          <th className="p-4 text-left text-sm font-medium text-gray-700">
                            PO #
                          </th>
                        )}
                        <th className="p-4 text-left text-sm font-medium text-gray-700">
                          Total
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => handleRowClick(item.id)}
                          className={`border-b hover:${searchType === 'quotation' ? 'bg-blue-50' : 'bg-purple-50'} cursor-pointer transition-colors`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <TypeIcon
                                size={16}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {item.number || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  ID: {item.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar
                                size={16}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <div>{formatDate(item.date)}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <User
                                size={16}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="truncate">
                                  {item.clientName || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {item.clientId}
                                </div>
                              </div>
                            </div>
                          </td>
                          {searchType === 'invoice' && (
                            <td className="p-4">
                              <div className="text-sm">
                                {item.poNo || "N/A"}
                              </div>
                            </td>
                          )}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <DollarSign
                                size={16}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <div>
                                {formatCurrency(item.total || 0)}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status || (searchType === 'invoice' ? "Unpaid" : "Draft")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Found {items.length} {getTypeSingular()}
                  {items.length !== 1 ? "s" : ""} • Click any row to view
                  details
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <TypeIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No {getTypePlural()} found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchValue
                    ? `No results for "${searchValue}"`
                    : `No ${getTypePlural()} available`}
                </p>
                {searchValue && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Show all {getTypePlural()}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonSearchPopup;