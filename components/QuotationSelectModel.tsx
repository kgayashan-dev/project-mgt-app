"use client";
import { Search, X, Loader2, FileText, CheckCircle, DollarSign, Calendar } from "lucide-react";

// Update interface to match your actual API response
interface Quotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  clientId: string;
  companyID?: string;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  totalTax: number;
  terms?: string;
  grandTotal: number;
  qItems?: {
    id: number;
    description: string;
    quotationId: string;
    unit: string;
    qty: number;
    rate: number;
  }[];
  clientName?: string; // You might want to add this from your clients data
}

interface QuotationSelectionModalProps {
  showModal: boolean;
  onClose: () => void;
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  onSelectQuotation: (quotation: Quotation) => void;
  isLoading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

const QuotationSelectionModal = ({
  showModal,
  onClose,
  quotations,
  selectedQuotation,
  onSelectQuotation,
  isLoading,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: QuotationSelectionModalProps) => {
  if (!showModal) return null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Calculate expiry date (30 days from quotation date)
  const calculateExpiryDate = (quotationDate: string) => {
    if (!quotationDate) return "N/A";
    try {
      const date = new Date(quotationDate);
      date.setDate(date.getDate() + 30);
      return formatDate(date.toISOString());
    } catch {
      return "N/A";
    }
  };

  // Calculate tax percentage (if not provided)
  const calculateTaxPercentage = (subtotal: number, totalTax: number) => {
    if (subtotal === 0) return 0;
    return ((totalTax / subtotal) * 100).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-18 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden m-4 border border-gray-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2">
          <div className="flex justify-between items-center">
            {/* Left: Title and Icon */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Select Quotation
                </h2>
                <p className="text-white/80 text-sm">
                  Choose a quotation to convert into a project
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-full mx-2 py-2">
          <div className="relative flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-2 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Search by quotation number, client ID..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchValue.trim()) {
                  onSearchSubmit();
                }
              }}
            />
            <button
              onClick={() => onSearchSubmit()}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-auto max-h-[calc(85vh-120px)]">
          {quotations.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Quotation No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Client ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {quotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className={`hover:bg-blue-50 transition-colors duration-200 ${
                      selectedQuotation?.id === quotation.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectQuotation(quotation)}
                        disabled={
                          isLoading && selectedQuotation?.id === quotation.id
                        }
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-sm rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 ${
                          isLoading && selectedQuotation?.id === quotation.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isLoading && selectedQuotation?.id === quotation.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Select
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="text-sm font-semibold text-gray-900">
                            {quotation.quotationNumber}
                          </span>
                          {quotation.terms && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              Terms: {quotation.terms}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {quotation.clientId}
                        </p>
                        {quotation.clientName && (
                          <p className="text-xs text-gray-500">
                            {quotation.clientName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(quotation.grandTotal)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>Subtotal: {formatCurrency(quotation.subtotal)}</div>
                          <div>Tax: {formatCurrency(quotation.totalTax)}</div>
                          {quotation.discountAmount > 0 && (
                            <div>Discount: -{formatCurrency(quotation.discountAmount)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {formatDate(quotation.quotationDate)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires: {calculateExpiryDate(quotation.quotationDate)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex gap-2">
                          <span className="text-gray-500">Items:</span>
                          <span>{quotation.qItems?.length || 0}</span>
                        </div>
                        {quotation.discountPercentage > 0 && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">Discount:</span>
                            <span>{quotation.discountPercentage}%</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <span className="text-gray-500">Tax Rate:</span>
                          <span>{calculateTaxPercentage(quotation.subtotal, quotation.totalTax)}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-sm text-gray-900 mb-2">
                No quotations found
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                {searchValue
                  ? "No quotations match your search criteria. Try a different search."
                  : "There are no quotations available to convert to projects."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationSelectionModal;