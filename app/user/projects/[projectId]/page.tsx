import EditProject from "@/components/EditProject";
import { getAllClients, getAllActiveTeamMembers } from "@/utils/getdata";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EditProjectPageProps {
  params: {
    projectId: string;
  };
}

// Function to fetch project data
async function getProjectData(projectId: string) {
  console.log("Fetching project data for projectId:", projectId);

  // Get API URL from environment variable

  // console.log("API_URL:", API_URL);

  if (!API_URL) {
    // console.error("API_URL is not defined in environment variables");
    return null;
  }

  if (!projectId || projectId.trim() === "") {
    console.warn("Project projectId is empty");
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

    // console.log("Response status:", response.status);

    if (!response.ok) {
      console.error(
        `Failed to fetch project data: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const result = await response.json();
    console.log("API Response:", result);
    return result;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  // Debug params
  console.log("Page params:", params);
  const { projectId: projectId } = params;

  // console.log("Project projectId from params:", projectId);

  // Check if projectId is valid
  if (!projectId || projectId.trim() === "") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Project projectId
          </h1>
          <p className="text-gray-600">
            The project projectId is missing or invalid.
          </p>
          <a
            href="/projects"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  let clientData = [];
  let activeTeamMembersData = [];
  let projectData = null;

  try {
    // Fetch all data in parallel
    const [clientsResponse, activeTeamMembersResponse, projectResponse] =
      await Promise.all([
        getAllClients(),
        getAllActiveTeamMembers(),
        getProjectData(projectId),
      ]);

    // console.log("Clients response:", clientsResponse);
    // console.log("Team members response:", activeTeamMembersResponse);
    // console.log("Project response:", projectResponse);

    if (clientsResponse?.success) {
      clientData = clientsResponse.data;
    }

    if (activeTeamMembersResponse?.success) {
      activeTeamMembersData =
        activeTeamMembersResponse.data?.data ||
        activeTeamMembersResponse.data ||
        [];
    }

    if (projectResponse && projectResponse.success) {
      projectData = projectResponse.data;
      console.log("Project data received:", projectData);
    } else {
      console.error("Failed to fetch project data:", projectResponse);
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 mb-2">
            The project with projectId{" "}
            <span className="font-mono font-bold">{projectId}</span> could not
            be found.
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Please check:
            <br />
            1. The project projectId is correct
            <br />
            2. The API server is running
            <br />
            3. You have proper permissions
          </p>
          <a
            href="/projects"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </a>
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
    />
  );
}
