import NewProject from "@/components/NewProject";
import {
  getAllClients,

  getAllTeamMembers,
} from "@/utils/getdata";

export default async function NewProjectPage() {
  let clientData = [];
  let teamMembersData = [];

  try {
    const [clientsResponse, teamMembersResponse] = await Promise.all([
      getAllClients(),
      getAllTeamMembers(),
    ]);

    if (clientsResponse.success) {
      clientData = clientsResponse.data;
    }

    if (teamMembersResponse.success) {
      teamMembersData = teamMembersResponse.data; // Not teamMembersResponse.data.data
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  // Pass teamMembersData (not teamMembersData.data) to NewProject
  return <NewProject clients={clientData} teamMembers={teamMembersData} />;
}
