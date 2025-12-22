// import Viewbill from "@/components/ViewBill";

// import { Edit } from "lucide-react";
import { getAllCategories, getAllVendors } from "@/utils/getdata";
import EditBillPage from "./edit/page";

type BillItem = {
  id: number;
  billId: string;
  description: string;
  categoryID: string;
  rate: number;
  qty: number;
  total: number;
};

type BillData = {
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
  status: string;
  totalTax: number;
  remarks: string;
  imagePath: string;
  imageUrl: string;
  table: BillItem[];
};

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getBillData(id: string): Promise<BillData | null> {
  try {
    // Example with your API
    const res = await fetch(`${API_URL}/project_pulse/Bill/getBill/${id}`, {
      cache: "no-store", // or 'force-cache' for static data
      headers: {
        "Content-Type": "application/json",
        // Add auth headers if needed
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch bill: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: BillData = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching bill data:", error);
    return null;
  }
}

export default async function Page({ params }: { params: { billId: string } }) {
  const { billId } = params;

  const [vendorArray, categoryArray] = await Promise.all([
    getAllVendors(),
    getAllCategories(),
  ]);

  try {
    const data = await getBillData(billId);
    console.log("Bill Data:", data);

    if (!data) {
      return (
        <div className="p-4 text-red-500">Bill not found</div>
      );
    }

    return (
      <div className="p-4">
        {/* <p className="text-[10px] mt-4 font-bold">Bill ID: {billId}</p> */}
        <EditBillPage
          billData={data}
          vendorArray={vendorArray.data}
          categoryArray={categoryArray.data}
        />
      </div>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <div className="p-4 text-red-500">Error loading bill {errorMessage}</div>
    );
  }
}
