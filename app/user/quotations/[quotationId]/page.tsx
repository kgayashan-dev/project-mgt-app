import ViewQuotation from "@/components/ViewQuotation";
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
    clientName: quotation.clientName,
    clientAddress: quotation.clientAddress,
    location: quotation.location || "Not mensioned", // Default location if missing
    outstandingRevenue: quotation.outstandingRevenue || 0, // Default if missing
    rows: quotation.table.length, // Table length as rows
    table: quotation.table, // The table data
    subtotal: quotation.subtotal,
    totalTax: quotation.totalTax,
    grandTotal: quotation.grandTotal,
    notes: quotation.notes || "No notes available.", // Default if missing
    terms: quotation.terms, // Default if missing
    phoneNumber: quotation.phoneNumber, // Default if missing
    emailAddress: quotation.emailAddress, 
    discountPercentage: quotation.discountPercentage,
    discountAmount: quotation.discountAmount,
    reference: quotation.reference || "N/A",
    taxPercentage: quotation.taxPercentage || 0, // Default tax percentage if missing
    additionalInfo: quotation.additionalInfo, // Default if missing
  
  };
}

export default async function Page({
  params,
}: {
  params: { quotationId: string };
}) {
  // Await params.quotationId
  const { quotationId } = await params;  // Add await here to resolve the params

  const data = await getQuotationData(quotationId);

  if (!data) {

    return <div>Quotation not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] font-bold pt-8">Quotation ID: {quotationId}</p>
      {/* Passing the data directly into the ViewQuotation component */}
      <ViewQuotation quoteArray={data} myCompany={COMPANY} />
    </div>
  );
}
