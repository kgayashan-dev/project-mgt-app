import InvoiceForm from "@/components/NewInvoicePage";
import {
  getAllClients,
  getBankData,
  getCompanyData,
  getQuotatoinData,
} from "@/utils/getdata"; // Add your bank data function

export default async function InvoicePage() {
  let clientData = [];
  let bankData = [];
  let quotationData = [];
  let myCompanyData = [];

  try {
    const [clientsResponse, banksResponse, quotationResponse, companyData] =
      await Promise.all([
        getAllClients(),
        getBankData(),
        getQuotatoinData(),
        getCompanyData(),
        // You'll need to create this function
      ]);

    if (clientsResponse.success) {
      clientData = clientsResponse.data;
    }

    if (banksResponse.success) {
      bankData = banksResponse.data;
    }

    if (banksResponse.success) {
      quotationData = quotationResponse.data;
    }
    if (banksResponse.success) {
      myCompanyData = companyData.data;
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  return (
    <>
      <InvoiceForm
        initialData={clientData}
        bankData={bankData}
        quotationData={quotationData}
        companyData={myCompanyData.data}
      />
    </>
  );
}
