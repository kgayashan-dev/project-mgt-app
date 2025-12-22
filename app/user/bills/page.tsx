"use client";
import ViewBillList from "@/components/ViewBillList";
import { getAllBills } from "@/utils/getdata";
import { useEffect, useState } from "react";

interface BillItem {
  id: number;
  billId: string;
  description: string;
  category: string;
  rate: number;
  qty: number;
  total: number;
}
interface Bill {
  id: string;
  billNumber: string;
  companyName: string;
  vendorId: string;
  issueDate: string;
  dueDate: string;
  emailAddress: string;
  phoneNumber: string;
  totalOutstanding: number;
  subTotal: number;
  tax: number;
  grandTotal: number;
  amountDue: number;
  totalTax: number;
  table: BillItem[];
  remarks?: string;
  status?: string;
  createdAt?: string;
}
// Page component that fetches data
export default function BillsListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await getAllBills(); // Adjust API endpoint
        if (!response || !response.success || !Array.isArray(response.data)) {
          throw new Error("Failed to fetch bills or invalid data format");
        }
        const data: Bill[] = response.data;
        setBills(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bills");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading bills...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return <ViewBillList bills={bills} />;
}
