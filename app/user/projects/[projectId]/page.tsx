import EditProject from "@/components/EditProject";
import {
  getAllClients,
  getAllActiveTeamMembers,
} from "@/utils/getdata";

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id: projectId } = params;
  
  let clientData = [];
  let activeTeamMembersData = [];

  try {
    const [clientsResponse, activeTeamMembersResponse] = await Promise.all([
      getAllClients(),
      getAllActiveTeamMembers(),
    ]);

    if (clientsResponse.success) {
      clientData = clientsResponse.data;
    }

    if (activeTeamMembersResponse.success) {
      activeTeamMembersData = activeTeamMembersResponse.data;
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  return (
    <EditProject 
      clients={clientData} 
      teamMembers={activeTeamMembersData} 
      projectId={projectId}
    />
  );
}