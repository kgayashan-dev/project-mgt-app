import EditQuotation from "@/components/EditQuotation";
import { QUOTATION, COMPANY } from "@/constraints/index";

// Define QuotationId type if not already defined
async function getQuotationData(id: string) {
  const quotation = QUOTATION.find((q) => q.id === id); // Assuming QUOTATION is an array of quotations

  if (!quotation) {
    return null; // Return null if no matching quotation is found
  }

  return {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    quotationDate: quotation.quotationDate,
    client: quotation.client,
    location: quotation.location || "Not mensioned", // Default location if missing
    outstandingRevenue: quotation.outstandingRevenue || 0, // Default if missing
    rows: quotation.table.length, // Table length as rows
    table: quotation.table, // The table data
    subtotal: quotation.subtotal,
    totalTax: quotation.totalTax,
    grandTotal: quotation.grandTotal,
    notes: quotation.notes || "No notes available.", // Default if missing
    terms: quotation.terms || "No terms available.", // Default if missing
    discountPercentage: quotation.discountPercentage,
    discountAmount: quotation.discountAmount,
    reference: quotation.reference || "N/A",
    taxPercentage: quotation.taxPercentage || 0, // Default tax percentage if missing
    additionalInfo: quotation.additionalInfo || "No additional information.", // Default if missing
  };
}

export default async function Page({
  params,
}: {
  params: { quotationId: string };
}) {
  const { quotationId } = params; // Remove 'await'

  const data = await getQuotationData(quotationId);

  if (!data) {
    return <div>Quotation not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] font-bold pt-8">Quotation ID: {quotationId}</p>
      {/* Passing the data directly into the EditQuotation component */}
      <EditQuotation quoteArray={data} myCompany={COMPANY} />
    </div>
  );
}
