
import ViewBillList from "@/components/ViewBillList";
import { BILLDATA, COMPANY } from "@/constraints/index";

// Function to get all invoice data
async function getAllInvoiceData() {
  // Assuming INVOICEDATA is an array of invoices
  if (!BILLDATA || BILLDATA.length === 0) {
    return null; // Return null if there are no invoices
  }

  // Map through the invoices to return the necessary data structure
  return BILLDATA.map((bill) => ({
    id: bill.id,
    billNumber: bill.billNumber,
    issueDate: bill.issueDate,
    dueDate: bill.dueDate,
    vendor:bill.vendor,
    amountDue: bill.amountDue,
    outstandingRevenue: bill.totalOutstanding,
    clientAddress: bill.clientAddress,
    phoneNumber: bill.phoneNumber,
    emailAddress: bill.emailAddress,
    subtotal: bill.subTotal,
    rows: bill.table.length, // Table length as rows
    table: bill.table,
    totalTax: bill.tax,
    category: bill.table[0].category,
    grandTotal: bill.grandTotal,
    discountPercentage: bill.discountPercentage || 0,
    discountAmount: bill.discountAmount || 0,
    taxPercentage: (bill.tax / bill.subTotal) * 100 || 0,
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
      <ViewBillList billArray={data} company={COMPANY} />
    </div>
  );
}
