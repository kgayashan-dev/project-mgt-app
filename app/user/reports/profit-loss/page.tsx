// app/pnl/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

// Type definitions
interface PnLSummary {
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalExpenses: number;
  totalTax: number;
  netProfit: number;
  grossProfitMargin: number;
  netProfitMargin: number;
  periodStart: string;
  periodEnd: string;
}

interface PnLDetail {
  category: string;
  subCategory: string;
  amount: number;
  reference: string;
  description: string;
  clientVendor: string;
  transactionDate: string;
}

interface PnLData {
  summary: PnLSummary;
  details: PnLDetail[];
}

interface MonthlyPnL {
  periodName: string;
  periodStart: string;
  periodEnd: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CategoryBreakdown {
  type: string;
  category: string;
  amount: number;
}

interface PnLOverview {
  currentMonthRevenue: number;
  currentMonthExpenses: number;
  currentMonthProfit: number;
  yearToDateRevenue: number;
  yearToDateExpenses: number;
  yearToDateProfit: number;
  outstandingInvoices: number;
}

interface PnLSummaryData {
  currentMonthRevenue: number;
  currentMonthProfit: number;
  previousMonthRevenue: number;
  previousMonthProfit: number;
  revenueGrowth: number;
  profitGrowth: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CategoryChartData {
  name: string;
  value: number;
}

export default function PnLPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [overview, setOverview] = useState<PnLOverview | null>(null);
  const [summary, setSummary] = useState<PnLSummaryData | null>(null);
  const [history, setHistory] = useState<MonthlyPnL[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Set default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    
    // Fetch initial data
    fetchOverview();
    fetchSummary();
    fetchHistory();
    fetchCategoryBreakdown(firstDay, lastDay);
  }, []);

  // Fetch PnL Overview
  const fetchOverview = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/project_pulse/pnl/overview`);
      const result: ApiResponse<PnLOverview> = await response.json();
      if (result.success) {
        setOverview(result.data);
      } else {
        setError(result.message || 'Failed to fetch overview');
      }
    } catch (error: any) {
      setError('Error fetching overview: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch PnL Summary
  const fetchSummary = async (): Promise<void> => {
    setError('');
    try {
      const response = await fetch(`${API_BASE}/project_pulse/PnL/summary`);
      const result: ApiResponse<PnLSummaryData> = await response.json();
      if (result.success) {
        setSummary(result.data);
      } else {
        console.error('Failed to fetch summary:', result.message);
      }
    } catch (error: any) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch PnL History
  const fetchHistory = async (): Promise<void> => {
    setError('');
    try {
      const response = await fetch(`${API_BASE}/project_pulse/PnL/history?months=12`);
      const result: ApiResponse<MonthlyPnL[]> = await response.json();
      if (result.success) {
        setHistory(result.data);
      } else {
        console.error('Failed to fetch history:', result.message);
      }
    } catch (error: any) {
      console.error('Error fetching history:', error);
    }
  };

  // Fetch Category Breakdown
  const fetchCategoryBreakdown = async (start: Date, end: Date): Promise<void> => {
    setError('');
    try {
      const response = await fetch(
        `${API_BASE}/project_pulse/PnL/category-breakdown?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const result: ApiResponse<CategoryBreakdown[]> = await response.json();
      if (result.success) {
        setCategoryBreakdown(result.data);
      } else {
        console.error('Failed to fetch category breakdown:', result.message);
      }
    } catch (error: any) {
      console.error('Error fetching category breakdown:', error);
    }
  };

  // Calculate PnL for custom period
  const fetchPnLCalculation = async (): Promise<void> => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const requestBody = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        includeDetails: true
      };
      
      const response = await fetch(`${API_BASE}/project_pulse/PnL/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result: ApiResponse<PnLData> = await response.json();
      if (result.success) {
        setPnlData(result.data);
        // Also fetch category breakdown for this period
        fetchCategoryBreakdown(new Date(startDate), new Date(endDate));
      } else {
        setError(result.message || 'Failed to calculate PnL');
      }
    } catch (error: any) {
      setError('Error calculating PnL: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export PnL Report
  const exportReport = async (): Promise<void> => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    try {
      const requestBody = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      };
      
      const response = await fetch(`${API_BASE}/project_pulse/PnL/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PnL_Report_${startDate}_to_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const error: ApiResponse<null> = await response.json();
        setError(error.message || 'Failed to export report');
      }
    } catch (error: any) {
      setError('Error exporting report: ' + error.message);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercent = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return '0.00%';
    return `${value.toFixed(2)}%`;
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Get category data for pie chart
  const getCategoryChartData = (): CategoryChartData[] => {
    const categories: Record<string, number> = {};
    
    categoryBreakdown.forEach((item: CategoryBreakdown) => {
      if (!categories[item.type]) {
        categories[item.type] = 0;
      }
      categories[item.type] += item.amount;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: Math.abs(value)
    }));
  };

  const renderCategoryBadge = (category: string): JSX.Element => {
    const baseClasses = "px-2 py-1 rounded text-xs";
    
    switch (category) {
      case 'Revenue':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{category}</span>;
      case 'COGS':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>{category}</span>;
      case 'Expense':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{category}</span>;
      default:
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>{category}</span>;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Revenue': return 'text-green-600';
      case 'COGS': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const renderEmptyState = (icon: JSX.Element, title: string, description?: string): JSX.Element => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-4">{icon}</div>
        <p className="text-gray-600 mb-2">{title}</p>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  );

  const chartIcon = (
    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Profit & Loss Statement</h1>
            <p className="text-gray-600 mt-1">Track your business profitability</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportReport} 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !startDate || !endDate}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex flex-col md:flex-row gap-2">
                <button 
                  onClick={fetchPnLCalculation} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !startDate || !endDate}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </span>
                  ) : 'Calculate PnL'}
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    
                    setStartDate(firstDay.toISOString().split('T')[0]);
                    setEndDate(lastDay.toISOString().split('T')[0]);
                    fetchPnLCalculation();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  This Month
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    
                    setStartDate(lastMonth.toISOString().split('T')[0]);
                    setEndDate(lastMonthEnd.toISOString().split('T')[0]);
                    fetchPnLCalculation();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Last Month
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !pnlData && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'calculation', 'history', 'breakdown'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'calculation' && 'PnL Calculation'}
                {tab === 'history' && 'History'}
                {tab === 'breakdown' && 'Breakdown'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Month Revenue</h3>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(overview.currentMonthRevenue)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Month Profit</h3>
                <div className={`text-2xl font-bold ${overview.currentMonthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(overview.currentMonthProfit)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Net</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Year to Date Profit</h3>
                <div className={`text-2xl font-bold ${overview.yearToDateProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(overview.yearToDateProfit)}
                </div>
                <div className="text-sm text-gray-500 mt-1">{new Date().getFullYear()} YTD</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Outstanding Invoices</h3>
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(overview.outstandingInvoices)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Unpaid</div>
              </div>
            </div>

            {/* Detailed Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Month Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Revenue:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(overview.currentMonthRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Expenses:</span>
                      <span className="text-red-600">
                        {formatCurrency(overview.currentMonthExpenses)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-800">Net Profit:</span>
                        <span className={overview.currentMonthProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(overview.currentMonthProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Year to Date Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Revenue:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(overview.yearToDateRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Expenses:</span>
                      <span className="text-red-600">
                        {formatCurrency(overview.yearToDateExpenses)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-800">Net Profit:</span>
                        <span className={overview.yearToDateProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(overview.yearToDateProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PnL Calculation Tab */}
        {activeTab === 'calculation' && (
          pnlData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Total Revenue</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(pnlData.summary.totalRevenue)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Gross Profit</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(pnlData.summary.grossProfit)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Margin: {formatPercent(pnlData.summary.grossProfitMargin)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Net Profit</h3>
                  <div className={`text-2xl font-bold ${pnlData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(pnlData.summary.netProfit)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Margin: {formatPercent(pnlData.summary.netProfitMargin)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Period</h3>
                  <div className="text-sm text-gray-800">
                    {new Date(pnlData.summary.periodStart).toLocaleDateString()} -<br />
                    {new Date(pnlData.summary.periodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total Revenue</span>
                      <span className="text-green-600 font-bold">
                        {formatCurrency(pnlData.summary.totalRevenue)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-red-600">
                      <span>Cost of Goods Sold (COGS)</span>
                      <span>-{formatCurrency(pnlData.summary.totalCOGS)}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-800">Gross Profit</span>
                        <span className="text-blue-600">
                          {formatCurrency(pnlData.summary.grossProfit)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {formatPercent(pnlData.summary.grossProfitMargin)} margin
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-red-600">
                      <span>Operating Expenses</span>
                      <span>-{formatCurrency(pnlData.summary.totalExpenses)}</span>
                    </div>
                    
                    <div className="flex justify-between text-red-600">
                      <span>Tax</span>
                      <span>-{formatCurrency(pnlData.summary.totalTax)}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-gray-800">Net Profit</span>
                        <span className={pnlData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(pnlData.summary.netProfit)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {formatPercent(pnlData.summary.netProfitMargin)} net margin
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {pnlData.details && pnlData.details.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
                      <span className="text-sm text-gray-500">
                        {pnlData.details.length} transactions found
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Category</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Description</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Client/Vendor</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Date</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pnlData.details.map((item: PnLDetail, index: number) => (
                            <tr key={index} className="border-b hover:bg-gray-100">
                              <td className="py-2 px-2">
                                {renderCategoryBadge(item.category)}
                              </td>
                              <td className="py-2 px-2 text-sm text-gray-700">
                                {item.description}
                                {item.reference && (
                                  <div className="text-xs text-gray-500">Ref: {item.reference}</div>
                                )}
                              </td>
                              <td className="py-2 px-2 text-sm text-gray-700">{item.clientVendor || '-'}</td>
                              <td className="py-2 px-2 text-sm text-gray-700">
                                {new Date(item.transactionDate).toLocaleDateString()}
                              </td>
                              <td className={`py-2 px-2 font-medium ${
                                item.category === 'Revenue' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.category === 'Revenue' ? '+' : '-'}{formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderEmptyState(
              chartIcon,
              "No PnL data calculated yet.",
              "Select a date range and click 'Calculate PnL' to see results."
            )
          )
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          history.length > 0 ? (
            <div className="space-y-6">
              {/* Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly PnL Trends</h3>
                  <p className="text-sm text-gray-500 mb-4">12-month history</p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="periodName" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tickFormatter={(value: number) => formatCurrency(value).replace('$', '')}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Amount']}
                          labelFormatter={(label: string) => `Period: ${label}`}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Revenue" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          name="Expenses" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          name="Profit" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Month</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Revenue</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Expenses</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Profit</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((month: MonthlyPnL, index: number) => {
                          const margin = month.revenue > 0 ? ((month.profit / month.revenue) * 100) : 0;
                          return (
                            <tr key={index} className="border-b hover:bg-gray-100">
                              <td className="py-2 px-2">
                                <div className="font-medium text-gray-800">{month.periodName}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(month.periodStart).toLocaleDateString('en-US', { day: 'numeric' })} - 
                                  {new Date(month.periodEnd).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-green-600 font-medium">
                                {formatCurrency(month.revenue)}
                              </td>
                              <td className="py-2 px-2 text-red-600">
                                {formatCurrency(month.expenses)}
                              </td>
                              <td className={`py-2 px-2 font-bold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(month.profit)}
                              </td>
                              <td className={`py-2 px-2 ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {margin.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderEmptyState(chartIcon, "No history data available.")
          )
        )}

        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && (
          categoryBreakdown.length > 0 ? (
            <div className="space-y-6">
              {/* Category Pie Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Category Distribution</h3>
                  <p className="text-sm text-gray-500 mb-4">By type</p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCategoryChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCategoryChartData().map((entry: CategoryChartData, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Category Breakdown</h3>
                  <div className="space-y-4">
                    {['Revenue', 'COGS', 'Expense', 'Tax'].map((type: string) => {
                      const items = categoryBreakdown.filter((item: CategoryBreakdown) => item.type === type);
                      if (items.length === 0) return null;
                      
                      const total = items.reduce((sum: number, item: CategoryBreakdown) => sum + item.amount, 0);
                      
                      return (
                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-gray-800">{type}</h3>
                            <span className={`font-bold ${getTypeColor(type)}`}>
                              {formatCurrency(total)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {items.map((item: CategoryBreakdown, index: number) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                <span className="text-gray-700">{item.category}</span>
                                <span className={`font-medium ${getTypeColor(type)}`}>
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderEmptyState(
              chartIcon,
              "No category breakdown available.",
              "Calculate PnL for a period to see category breakdown."
            )
          )
        )}
      </div>
    </div>
  );
}