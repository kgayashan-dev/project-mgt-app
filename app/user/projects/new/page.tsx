import NewProject from "@/components/NewProject";
import {
  getAllClients,
  getAllActiveTeamMembers,
  getQuotatoinData,
  getAllInvoices,
  // getAllTeamMembers,
} from "@/utils/getdata";

export default async function NewProjectPage() {
  let clientData = [];
  let quotationData = [];
  let invoiceData = [];
  let activeTeamMembersData = [];

  try {
    const [
      clientsResponse,
      quotationResponse,

      invoiceResponse,
      // teamMembersResponse,
      activeTeamMembersResponse,
    ] = await Promise.all([
      getAllClients(),
      getQuotatoinData(),
      getAllInvoices(),
      getAllActiveTeamMembers(),
    ]);

    if (clientsResponse.success) {
      clientData = clientsResponse.data;
    }

    if (quotationResponse.success) {
      quotationData = quotationResponse.data; // Not quotationResponse.data.data
    }
    if (invoiceResponse.success) {
      invoiceData = invoiceResponse.data; // Not invoiceResponse.data.data
    }
    if (activeTeamMembersResponse.success) {
      activeTeamMembersData = activeTeamMembersResponse.data.data; // Not activeTeamMembersResponse.data.data
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  console.log(invoiceData, quotationData)

  // Pass teamMembersData (not teamMembersData.data) to NewProject
  return (
    <NewProject clients={clientData} teamMembers={activeTeamMembersData} />
  );
}
