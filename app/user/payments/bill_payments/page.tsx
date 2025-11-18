/* eslint-disable @typescript-eslint/no-explicit-any */
import {  getAllPayments , getPaymentByTypeBill, getAllBills} from "@/utils/getdata";
import BillPayments from "./BillPayments";

// Helper function to map API status to component status
// function getStatusFromBillStatus(
//   status: string | null
// ): "Paid" | "Partial" | "Overdue" | "Pending" {
//   if (!status) return "Pending";

//   const statusMap: {
//     [key: string]: "Paid" | "Partial" | "Overdue" | "Pending";
//   } = {
//     Paid: "Paid",
//     Partial: "Partial",
//     Overdue: "Overdue",
//     Draft: "Pending",
//     Sent: "Pending",
//     Pending: "Pending",
//   };

//   return statusMap[status] || "Pending";
// }

// Helper function to determine bill status based on amount due and dates
function determineBillStatus(bill: any): "Paid" | "Partial" | "Overdue" | "Pending" {
  const now = new Date();
  const dueDate = new Date(bill.dueDate);
  
  // If amount due is 0, bill is paid
  if (bill.amountDue === 0 || bill.totalOutstanding === 0) {
    return "Paid";
  }
  
  // If amount due is less than grand total but not zero, it's partial
  if (bill.amountDue > 0 && bill.amountDue < bill.grandTotal) {
    return "Partial";
  }
  
  // If due date has passed and there's amount due, it's overdue
  if (dueDate < now && bill.amountDue > 0) {
    return "Overdue";
  }
  
  // Default to pending
  return "Pending";
}

// Helper function to format date safely
function formatDateSafe(dateString: string): string {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-US");
  } catch {
    return "Invalid Date";
  }
}

// Main Page Component
export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isArchived = searchParams.archived === "true";

  try {
    const response = await getAllBills();

    console.log("API Response:", response);

    // Check if the response is successful and has data
    if (!response || !response.success || !Array.isArray(response.data)) {
      return (
        <div className="pt-8 flex justify-center items-center min-h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              No bills found
            </h1>
            <p className="text-gray-600">Unable to load bills at this time.</p>
          </div>
        </div>
      );
    }

    const data = response.data;
    console.log("Raw bill data:", data);

    // Transform the API data to match the component's expected format for bills
    const transformedBills = data.map((bill: any) => {
      // Determine status based on amount due and dates
      const calculatedStatus = determineBillStatus(bill);
      
      return {
        id: bill.id || "",
        vendorID: bill.vendorId || "",
        billNumber: bill.billNumber || "",
        description: bill.remarks || "No description",
        billDate: formatDateSafe(bill.issueDate),
        billDueDate: bill.dueDate ? formatDateSafe(bill.dueDate) : undefined,
        vendor: bill.companyName || "",
        amount: bill.subTotal || 0, // Note: API uses subTotal (camelCase)
        billStatus: calculatedStatus, // Use calculated status since API doesn't provide status
        grandTotal: bill.grandTotal || 0,
        totalOutstanding: bill.totalOutstanding || 0,
        amountDue: bill.amountDue || 0,
        status: calculatedStatus,
        // Include additional bill-specific fields
        vendorId: bill.vendorId || "",
        emailAddress: bill.emailAddress || "",
        phoneNumber: bill.phoneNumber || "",
        tax: bill.tax || 0,
        totalTax: bill.totalTax || 0,
        table: bill.table || [] // Line items table
      };
    });

    

    // Fetch payments data if needed
    let paymentsData = [];
    try {
      const paymentsResponse = await getPaymentByTypeBill();
      if (paymentsResponse && paymentsResponse.success && Array.isArray(paymentsResponse.data)) {
        paymentsData = paymentsResponse.data;
        console.log("Payments data:", paymentsData);
      }
    } catch (paymentError) {
      console.error("Error fetching payments:", paymentError);
      // Continue without payments data
    }

    console.log("Transformed bills:", transformedBills);
    
    // Check if we have any valid bills after transformation
    if (transformedBills.length === 0) {
      return (
        <div className="pt-8 flex justify-center items-center min-h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              No bills available
            </h1>
            <p className="text-gray-600">No bill data could be processed.</p>
          </div>
        </div>
      );
    }

    console.log(paymentsData,'payment data')
    return (
      <div className="pt-8">
        {isArchived ? (
          "" // You can add archived bills component here if needed
        ) : (
          <BillPayments BillArray={transformedBills} paymentsData={paymentsData}/>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in page component:", error);
    return (
      <div className="pt-8 flex justify-center items-center min-h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Page
          </h1>
          <p className="text-gray-600">
            Something went wrong. Please try again later.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}