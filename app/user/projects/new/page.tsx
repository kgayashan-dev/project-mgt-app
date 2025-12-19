import NewProject from "@/components/NewProject";
import {
  getAllClients,
  getAllActiveTeamMembers,
  // getQuotationdata,
  getQuotatoinData, // Fixed typo from getQuotatoinData
} from "@/utils/getdata";

export default async function NewProjectPage() {
  let clientData = [];
  let quotationData = [];
  let activeTeamMembersData = [];

  try {
    const [clientsResponse, quotationResponse, activeTeamMembersResponse] =
      await Promise.all([
        getAllClients(),
        getQuotatoinData(), // Make sure this function exists and works
        getAllActiveTeamMembers(),
      ]);

    if (clientsResponse.success) {
      clientData = clientsResponse.data;
    }

    if (quotationResponse.success) {
      quotationData = quotationResponse.data;
    }

    if (activeTeamMembersResponse.success) {
      activeTeamMembersData = activeTeamMembersResponse.data.data;
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  // Filter only approved or sent quotations (optional)


  return (
    <NewProject 
      clients={clientData} 
      teamMembers={activeTeamMembersData}
      quotations={quotationData} // Pass quotations to component
    />
  );
}