import ViewQuotation from "@/components/ViewQuotation";
// import { COMPANY } from "@/constraints/index";
const API_URL =  process.env.NEXT_PUBLIC_API_BASE_URL
// Function to fetch quotation data from your API
async function getQuotationData(id: string) {
  try {
    const response = await fetch(`${API_URL}/project_pulse/Quotation/getQuotation/${id}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Important for dynamic data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quotation: ${response.status}`);
    }

    const quotation = await response.json();

    console.log(quotation,"Quotations")
    if (!quotation) {
      return null;
    }
    // Transform the  to match your ViewQuotation component's expected format
    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      quotationDate: quotation.quotationDate,
      clientName: quotation.clientName,
      clientAddress: quotation.clientLocation , // Map location to clientAddress
      location: quotation.clientLocation ,
      outstandingRevenue: quotation.outstandingRevenue || 0,
      rows: quotation.qItems?.length || 0, // Use qItems length as rows
      table: quotation.qItems || [], // Map qItems to table
      subtotal: quotation.subtotal,
      totalTax: quotation.totalTax,
      grandTotal: quotation.grandTotal,
      notes: quotation.notes || "No notes available.",
      terms: quotation.terms || "Standard terms apply",
      phoneNumber: quotation.phoneNumber || "Not provided",
      emailAddress: quotation.emailAddress || "Not provided",
      discountPercentage: quotation.discountPercentage,
      discountAmount: quotation.discountAmount,
      reference: quotation.reference || "N/A",
      taxPercentage: quotation.taxPercentage || 0,
      additionalInfo: quotation.additionalInfo || "",
    };
  } catch (error) {
    console.log("Error fetching quotation:", error);
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: { quotationId: string };
}) {
  const { quotationId } = await params;

  const data = await getQuotationData(quotationId);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-4">Quotation Not Found</h1>
          <p className="text-gray-600">The quotation with ID {quotationId} was not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-bold pt-8">Quotation ID: {quotationId}</p>
      <ViewQuotation quoteArray={data}  />
    </div>
  );
}