/* eslint-disable @typescript-eslint/no-explicit-any */
import EditInvoiceForm from "@/components/EditInvoiceForm";
import { getAllClients, getBankData, getCompanyData, getQuotatoinData } from "@/utils/getdata";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to fetch invoice data
async function fetchInvoiceData(id: string) {
  try {
    const response = await fetch(
      `${API_URL}/project_pulse/Invoice/getInvoice/${id}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch invoice: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    console.log("Invoice data fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return null;
  }
}

export default async function EditInvoicePage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const { invoiceId } = await params;

  // Fetch all required data in parallel
  const [clientsResponse,quotationResponse, banksResponse, companiesResponse, invoiceResponse] =
    await Promise.all([
      getAllClients(),
      getQuotatoinData(),
      getBankData(),
      getCompanyData(),
      fetchInvoiceData(invoiceId),
    ]);

  // Process responses
  const clientData = clientsResponse?.success ? clientsResponse.data : [];
  const bankData = banksResponse?.success ? banksResponse.data : [];
  const companyData = companiesResponse?.success
    ? companiesResponse.data.data
    : [];
    const quotationData = quotationResponse?.success ? quotationResponse.data : [];

  // If invoice not found, show error
  if (!invoiceResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Invoice Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The invoice with ID {invoiceId} does not exist.
          </p>
        </div>
      </div>
    );
  }

  console.log("Raw invoice response:", invoiceResponse);
  console.log("Company data:", companyData);

  // Transform invoice data for the form to match EditInvoiceForm interface
  const initialInvoice = {
    id: invoiceResponse.id || invoiceId,
    invoiceNumber: invoiceResponse.invoiceNo || invoiceResponse.invoiceNumber,
    invoiceDate: invoiceResponse.invoiceDate,
    clientId: invoiceResponse.clientID,
    companyID: invoiceResponse.companyID,
    discountPercentage: invoiceResponse.discountPercentage || 0,
    discountAmount: invoiceResponse.discountAmount || 0,
    subtotal: invoiceResponse.subtotal || 0,
    totalTax: invoiceResponse.tax || 0,
    terms: invoiceResponse.terms || "",
    notes: invoiceResponse.remarks || "",
    quotationID: invoiceResponse.quotationID || "",
    grandTotal: invoiceResponse.invoiceTotal || 0,
    invoiceItems:
      invoiceResponse.items?.map((item: any) => ({
        id: item.id || 0,
        description: item.description || "",
        unit: item.unit || "",
        qty: item.qty || 0,
        rate: item.rate || 0,
        invoiceId: invoiceResponse.id || invoiceId,
        total: item.total || item.rate * item.qty || 0,
        tax: 0, // Default tax percentage per item
        taxAmount: 0, // Will be calculated based on tax percentage
      })) || [],
    reference: invoiceResponse.poNo || invoiceResponse.reference || "",
    status: invoiceResponse.status || "Draft",
    dueDate: invoiceResponse.dueDate || "",
    clientLocation: invoiceResponse.clientLocation || "",
  };

  console.log("Transformed initialInvoice:", initialInvoice);

  return (
    <EditInvoiceForm
      invoiceId={invoiceId}
      initialInvoice={initialInvoice}
      initialData={clientData}
      bankData={bankData}
      companyData={companyData}
      quotationData={quotationData}
    />
  );
}
