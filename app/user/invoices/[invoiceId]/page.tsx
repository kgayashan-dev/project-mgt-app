import InvoiceForm from "@/components/sampleInvoice";
import ViewInvoice from "@/components/ViewInvoice";
import { COMPANY, INVOICEDATA } from "@/constraints/index";
import AdditionalInvoicePayment from "@/components/AdditionalInvoicePayments";
import AttachementInvoice from "@/components/FileAttachementInvoice";
// Define invoiceId type if not already defined
async function getInvoiceData(id: string) {
  const invoice = INVOICEDATA.find((q) => q.id === id);

  if (!invoice) {
    return null; // Return null if no matching invoice is found
  }

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    invoiceDueDate: invoice.dueDate,
    client: invoice.client || "not em", // Default client name if missing
    location: "Not mentioned", // Default location if missing
    outstandingRevenue: 0, // Default if missing
    // Ensure this matches your table structure
    subtotal: invoice.subtotal,
    rows: invoice.table.length, // Table length as rows
    table: invoice.table,
    totalTax: invoice.totalTax,
    grandTotal: invoice.grandTotal,
    notes: invoice.notes || "No notes available.", // Default if missing
    terms: invoice.terms || "No terms available.", // Default if missing
    discountPercentage: invoice.discountPercentage || 0,
    discountAmount: invoice.discountAmount || 0,
    invoiceReference: "N/A", // Assuming there's no reference in your data; adjust as necessary
    taxPercentage: 0, // Default tax percentage if missing
    additionalInfo: invoice.additionalInfo || "No additional information.", // Default if missing
  };
}

export default async function Page({
  params,
}: {
  params: { invoiceId: string };
}) {
  // Correct way to extract params
  const { invoiceId } = params;

  // Get invoice data using the invoiceId
  const data = await getInvoiceData(invoiceId);

  if (!data) {
    return <div>Invoice not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] mt-4 font-bold">Invoice ID: {invoiceId}</p>
      {/* Pass the correct prop to ViewInvoice */}
      <ViewInvoice invoiceArray={data} myCompany={COMPANY} />

      <AdditionalInvoicePayment invoiceId={invoiceId} />
      <div className="m-8">
        <AttachementInvoice
          invoiceId={invoiceId}
          invoiceDate={data.invoiceDate}
        />
      </div>
    </div>
  );
}
