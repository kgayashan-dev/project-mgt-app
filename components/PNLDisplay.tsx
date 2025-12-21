// services/pnlService.ts
import api from './api';

export interface PnLCalculation {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  operatingExpenses: number;
  otherIncome: number;
  otherExpenses: number;
  netProfitBeforeTax: number;
  taxExpense: number;
  netProfitAfterTax: number;
  calculatedAt: string;
  revenueDetails: PnLDetailItem[];
  expenseDetails: PnLDetailItem[];
  cogsDetails: PnLDetailItem[];
}

export interface PnLDetailItem {
  id: string;
  itemType: string;
  sourceType: string;
  reference: string;
  description: string;
  clientVendor: string;
  amount: number;
  date: string;
  category: string;
}

export interface PnLHistory {
  periodName: string;
  periodStart: string;
  periodEnd: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

export interface PnLSummary {
  currentMonthRevenue: number;
  currentMonthProfit: number;
  previousMonthRevenue: number;
  previousMonthProfit: number;
  revenueGrowth: number;
  profitGrowth: number;
  topRevenueSources: Array<{ key: string; value: number }>;
  topExpenseCategories: Array<{ key: string; value: number }>;
}

class PnLService {
  async calculatePnL(startDate: string, endDate: string): Promise<PnLCalculation> {
    const response = await api.get('/api/pnl/calculate', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }

  async getHistory(months: number = 12): Promise<PnLHistory[]> {
    const response = await api.get('/api/pnl/history', { params: { months } });
    return response.data.data;
  }

  async getSummary(): Promise<PnLSummary> {
    const response = await api.get('/api/pnl/summary');
    return response.data.data;
  }

  async getBreakdown(startDate: string, endDate: string): Promise<PnLDetailItem[]> {
    const response = await api.get('/api/pnl/breakdown', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }

  async exportPnL(startDate: string, endDate: string, format: string = 'csv'): Promise<void> {
    const response = await api.get('/api/pnl/export', {
      params: { startDate, endDate, format },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pnl-${startDate}-${endDate}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export default new PnlService();