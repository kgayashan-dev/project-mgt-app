import AllInvoicePage from "@/components/AllInvoicePage";
import { INVOICEDATA, COMPANY } from "@/constraints/index";

// Function to get all invoice data
async function getAllInvoiceData() {
  // Assuming INVOICEDATA is an array of invoices
  if (!INVOICEDATA || INVOICEDATA.length === 0) {
    return null; // Return null if there are no invoices
  }

  // Map through the invoices to return the necessary data structure
  return INVOICEDATA.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    invoiceDueDate: invoice.dueDate,
    client: invoice.client || "Not specified", // Default client name if missing
    location: "Not mentioned", // Default location if missing
    outstandingRevenue: 0, // Default if missing
    table: invoice.table || [], // Ensure this matches your table structure
    subtotal: invoice.subtotal,
    totalTax: invoice.totalTax,
    grandTotal: invoice.grandTotal,
    notes: invoice.notes || "No notes available.", // Default if missing
    terms: invoice.terms || "No terms available.", // Default if missing
    discountPercentage: invoice.discountPercentage || 0,
    discountAmount: invoice.discountAmount || 0,
    taxPercentage: 0, // Default tax percentage if missing
    additionalInfo: invoice.additionalInfo || "No additional information.", // Default if missing
    invoiceStatus: invoice.invoiceStatus,
  }));
}

// Main Page Component
export default async function Page() {
  const data = await getAllInvoiceData(); // Fetching all invoices

  if (!data) {
    return <div>No invoices found</div>; // Handle case where no data is found
  }

  return (
    <div className="pt-8">
      {/* Passing the data directly into the AllInvoicePage component */}
      <AllInvoicePage invoiceArray={data} company={COMPANY} />
    </div>
  );
}
