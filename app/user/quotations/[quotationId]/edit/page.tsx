/* eslint-disable @typescript-eslint/no-explicit-any */
import EditQuotationForm from "@/components/EditQuotationForm";
import {
  getAllClients,
  getBankData,
  getCompanyData,
} from "@/utils/getdata";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to fetch quotation data
async function fetchQuotationData(id: string) {
  try {
    const response = await fetch(`${API_URL}/project_pulse/Quotation/getQuotation/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch quotation: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Quotation data fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    return null;
  }
}

export default async function EditQuotationPage({
  params,
}: {
  params: { quotationId: string };
}) {
  const { quotationId } = await params;

  // Fetch all required data in parallel
  const [clientsResponse, banksResponse, companiesResponse, quotationResponse] =
    await Promise.all([
      getAllClients(),
      getBankData(),
      getCompanyData(),
      fetchQuotationData(quotationId),
    ]);

  // Process responses
  const clientData = clientsResponse?.success ? clientsResponse.data : [];
  const bankData = banksResponse?.success ? banksResponse.data : [];
  // FIX: Access the data property correctly
  const companyData = companiesResponse?.success ? companiesResponse.data : [];

  // If quotation not found, show error
  if (!quotationResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Quotation Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The quotation with ID {quotationId} does not exist.
          </p>
       
        </div>
      </div>
    );
  }

  console.log('Raw quotation response:', quotationResponse);
  console.log('Company data:', companyData);

  // Transform quotation data for the form - match the interface name
  const initialQuotation = {
    id: quotationResponse.id || quotationId,
    quotationNumber: quotationResponse.quotationNumber,
    quotationDate: quotationResponse.quotationDate,
    clientId: quotationResponse.clientId,
    companyID: quotationResponse.companyID, // Note: keep as companyID to match interface
    discountPercentage: quotationResponse.discountPercentage || 0,
    discountAmount: quotationResponse.discountAmount || 0,
    subtotal: quotationResponse.subtotal || 0,
    totalTax: quotationResponse.totalTax || 0,
    terms: quotationResponse.terms || "",
    grandTotal: quotationResponse.grandTotal || 0,
    qItems: quotationResponse.qItems?.map((item: any) => ({
      id: item.id || 0,
      description: item.description || "",
      unit: item.unit || "",
      qty: item.qty || 0,
      rate: item.rate || 0,
      quotationId: quotationResponse.id || quotationId,
      // Optional fields
      total: item.total || item.rate * item.qty || 0,
      tax: item.tax || 0,
      taxAmount: item.taxAmount || 0,
    })) || [],
    reference: quotationResponse.reference || "",
    status: quotationResponse.status || "Draft",
    // Note: Ensure these match your API response
    dueDate: quotationResponse.dueDate || "",
    clientLocation: quotationResponse.clientLocation || "",
    notes: quotationResponse.notes || "",
  };

  console.log('Transformed initialQuotation:', initialQuotation);

  return (
    <EditQuotationForm
      quotationId={quotationId}
      initialQuotation={initialQuotation} // Changed to match component prop name
      initialData={clientData} // This prop might not be needed if you have clientData
      bankData={bankData}
      companyData={companyData.data} // Fixed: removed .data
    />
  );
}