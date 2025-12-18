import NewProject from "@/components/NewProject";
import {
  getAllClients,
  getAllActiveTeamMembers,
  // getAllTeamMembers,
} from "@/utils/getdata";


export default async function NewProjectPage() {
  let clientData = [];
  // let teamMembersData = [];
  let activeTeamMembersData = [];

  try {
    const [
      clientsResponse,
      // teamMembersResponse,
      activeTeamMembersResponse,
    ] = await Promise.all([
      getAllClients(),
      // getAllTeamMembers(),
      getAllActiveTeamMembers(),
    ]);

    if (clientsResponse.success) {
      clientData = clientsResponse.data;
    }

    
    // if (teamMembersResponse.success) {
    //   teamMembersData = teamMembersResponse.data; // Not teamMembersResponse.data.data
    // }

    if (activeTeamMembersResponse.success) {
      activeTeamMembersData = activeTeamMembersResponse.data; // Not activeTeamMembersResponse.data.data
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  // console.log(activeTeamMembersData)

  // Pass teamMembersData (not teamMembersData.data) to NewProject
  return (
    <NewProject clients={clientData} teamMembers={activeTeamMembersData} />
  );
}
