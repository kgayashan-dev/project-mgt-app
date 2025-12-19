import EditProject from "@/components/EditProject";
import {
  getAllClients,
  getAllActiveTeamMembers,
  getQuotatoinData,
} from "@/utils/getdata";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EditProjectPageProps {
  params: {
    projectId: string;
  };
}

// Function to fetch project data
async function getProjectData(projectId: string) {
  if (!API_URL) {
    // console.error("API_URL is not defined in environment variables");
    return null;
  }

  if (!projectId || projectId.trim() === "") {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/project_pulse/Project/${projectId}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    // console.log(result)
    return result;
  } catch (error) {
    console.warn("Error fetching project:", error);
    return null;
  }
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  // Debug params
  // console.log("Page params:", params);
  const { projectId: projectId } = params;

  // console.log("Project projectId from params:", projectId);

  let clientData = [];
  let activeTeamMembersData = [];
  let projectData = null;
  let quotationData = [];

  try {
    // Fetch all data in parallel
    const [
      clientsResponse,
      activeTeamMembersResponse,
      projectResponse,
      quotationResponse,
    ] = await Promise.all([
      getAllClients(),
      getAllActiveTeamMembers(),
      getProjectData(projectId),
      getQuotatoinData(), // Make sure this function exists and works
    ]);

    console.log("Clients response:", clientsResponse);
    console.log("Team members response:", activeTeamMembersResponse);
    console.log("Project response:", projectResponse);

    if (clientsResponse?.success) {
      clientData = clientsResponse.data;
    }

    if (activeTeamMembersResponse?.success) {
      activeTeamMembersData =
        activeTeamMembersResponse.data?.data ||
        activeTeamMembersResponse.data ||
        [];
    }
    if (quotationResponse.success) {
      quotationData = quotationResponse.data;
    }

    if (projectResponse && projectResponse.success) {
      projectData = projectResponse.data;
      // console.log("Project data received:", projectData);
    } else {
      console.warn("Failed to fetch project data:", projectResponse);
    }
  } catch (error) {
    console.warn("Error fetching data:", error);
  }

  console.log("Final projectData:", projectData);

  // If project data is not found, show an error message
  if (!projectData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-red-600 mb-4">
            Project Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <EditProject
      clients={clientData}
      teamMembers={activeTeamMembersData}
      projectId={projectId}
      initialProjectData={projectData}
      quotations={quotationData} // Pass quotations to component
    />
  );
}
