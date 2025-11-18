import ArchivedIncome from "@/components/ArchivedIncome";
import InvoicePaymentsInterface from "@/components/InvoicePayment";
import { getAllInvoices, getAllPayments } from "@/utils/getdata";

// Helper function to map API status to component status
function getStatusFromInvoiceStatus(
  status: string | null
): "Paid" | "Partial" | "Overdue" | "Pending" {
  if (!status) return "Pending";

  const statusMap: {
    [key: string]: "Paid" | "Partial" | "Overdue" | "Pending";
  } = {
    Paid: "Paid",
    Partial: "Partial",
    Overdue: "Overdue",
    Draft: "Pending",
    Sent: "Pending",
    Pending: "Pending",
  };

  return statusMap[status] || "Pending";
}

// Main Page Component
export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isArchived = searchParams.archived === "true";
  const isDeleted = searchParams.deleted === "true";

  try {
    const response = await getAllInvoices();

    // Check if the response is successful and has data
    if (!response || !response.success || !Array.isArray(response.data)) {
      return (
        <div className="pt-8 flex justify-center items-center min-h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              No invoices found
            </h1>
            <p className="text-gray-600">Unable to load invoices at this time.</p>
          </div>
        </div>
      );
    }

    const data = response.data;

    // Transform the API data to match the component's expected format
    const transformedInvoices = data.map((invoice: any) => ({
      id: invoice.id,
      clientID: invoice.clientID,
      invoiceNumber: invoice.invoiceNo,
      description: invoice.remarks || "No description",
      invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString("en-US"),
      invoiceDueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("en-US")
        : undefined,
      client: invoice.clientID,
      amount: invoice.subtotal,
      invoiceStatus: invoice.status || "Draft",
      grandTotal: invoice.invoiceTotal,
      status: getStatusFromInvoiceStatus(invoice.status),
    }));

    // Fetch payments data if needed
    let paymentsData = [];
    try {
      const paymentsResponse = await getAllPayments();
      if (paymentsResponse && paymentsResponse.success && Array.isArray(paymentsResponse.data)) {
        paymentsData = paymentsResponse.data;
      }
    } catch (paymentError) {
      console.error("Error fetching payments:", paymentError);
      // Continue without payments data
    }

    return (
      <div className="pt-8">
        {isArchived ? (
          <ArchivedIncome />
        )  : (
          <InvoicePaymentsInterface invoiceArray={transformedInvoices} paymentsData={paymentsData}/>
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
          <p className="text-gray-600">Something went wrong. Please try again later.</p>
        </div>
      </div>
    );
  }
}