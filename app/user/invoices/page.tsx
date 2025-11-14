// app/user/invoices/page.tsx
import AllInvoiceData from "@/components/AllInvoicePage"; // Make sure this import is correct
import { getAllInvoices } from "@/utils/getdata";

// Function to get all invoice data
async function getInvoicesData() {
  try {
    const response = await getAllInvoices();
    // console.log("API Response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { success: false, data: [] };
  }
}

// Main Page Component
export default async function Page() {
  const response = await getInvoicesData(); // Fetching all invoices



  // Check if the response is successful and has data
  if (!response || !response.success || !Array.isArray(response.data)) {
    return (
      <div className="pt-8 flex justify-center items-center min-h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No invoices found</h1>
          <p className="text-gray-600">Unable to load invoices at this time.</p>
        </div>
      </div>
    );
  }

  const data = response.data;
;

  // Transform the API data to match the component's expected format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedInvoices = data.map((invoice: any) => ({
    id: invoice.id,
    clientID: invoice.clientID, // You might want to fetch client name separately
    invoiceNumber: invoice.invoiceNo,
    description: invoice.remarks || "No description",
    invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-US'),
    invoiceDueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : undefined,
    client: invoice.clientID,
    amount: invoice.subtotal,
    invoiceStatus: invoice.status || "Draft",
    grandTotal: invoice.invoiceTotal,
    status: getStatusFromInvoiceStatus(invoice.status) // Map to the expected status type
  }));

  return (
    <div className="pt-8">
      {/* Passing the transformed data into the AllInvoiceData component */}
      <AllInvoiceData invoiceArray={transformedInvoices} />
    </div>
  );
}

// Helper function to map API status to component status
function getStatusFromInvoiceStatus(status: string | null): "Paid" | "Partial" | "Overdue" | "Pending" {
  if (!status) return 'Pending';
  
  const statusMap: { [key: string]: "Paid" | "Partial" | "Overdue" | "Pending" } = {
    'Paid': 'Paid',
    'Partial': 'Partial',
    'Overdue': 'Overdue',
    'Draft': 'Pending',
    'Sent': 'Pending',
    'Pending': 'Pending'
  };
  
  return statusMap[status] || 'Pending';
}