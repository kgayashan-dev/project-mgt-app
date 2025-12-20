import ViewQuotation from "@/components/ViewQuotation";
import { Pencil } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to fetch quotation data from your API
async function getQuotationData(id: string) {
  try {
    const response = await fetch(
      `${API_URL}/project_pulse/Quotation/getQuotation/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Important for dynamic data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quotation: ${response.status}`);
    }

    const quotation = await response.json();

    console.log(quotation, "Quotations");
    if (!quotation) {
      return null;
    }
    // Transform the  to match your ViewQuotation component's expected format
    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      quotationDate: quotation.quotationDate,
      clientName: quotation.clientName,
      clientAddress: quotation.clientLocation, // Map location to clientAddress
      location: quotation.clientLocation,
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
      status: quotation.status || "Draft",
      clientId: quotation.clientId || "",
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
          <h1 className="text-lg font-bold text-gray-900 mb-4">
            Quotation Not Found
          </h1>
          <p className="text-gray-600">
            The quotation with ID {quotationId} was not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Header with Edit Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quotation Details
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm font-medium text-gray-700">
                ID: {quotationId}
              </p>
              <span className="text-gray-400">•</span>
              <p className="text-sm font-medium text-gray-700">
                {data.quotationNumber}
              </p>
              <span className="text-gray-400">•</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  data.status === "Accepted"
                    ? "bg-green-200 text-green-800"
                    : data.status === "Sent"
                    ? "bg-blue-200 text-blue-800"
                    : data.status === "Draft"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {data.status || "Draft"}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/user/quotations"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              Back to List
            </Link>
            <Link
              href={`/user/quotations/${quotationId}/edit`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Quotation
            </Link>
          </div>
        </div>
      </div>

      {/* View Quotation Component */}
      <ViewQuotation quoteArray={data} />
    </div>
  );
}