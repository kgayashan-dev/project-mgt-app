import Project from "@/components/Project";
import { PROJECTS } from "@/constraints/index";

// Define projectId type if not already defined
async function getprojectData(id: string) {
  const project = PROJECTS.find((q) => q.id === id);

  if (!project) {
    return null; // Return null if no matching project is found
  }

  return {
    id: project.id,
    projectName: project.projectName,
    clientName: project.clientName,
    clientId: project.clientId,
    projectDescription: project.description,
    projectStartDate: project.startDate,
    projectEndDate: project.endDate,
    projectFlatRate: project.flatRate,
    projectTotalHours: project.totalHours,
    projectStatus: project.status,
    projectServices: project.services || [],
    projectTeamMember: project.teamMembers || [],
  };
}

export default async function Page({
  params,
}: {
  params: { projectId: string };
}) {
  // Correct way to extract params
  const { projectId } = params;

  // Get project data using the projectId
  const data = await getprojectData(projectId);

  if (!data) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] mt-4 font-bold">Project ID: {projectId}</p>
      {/* Pass the correct prop to Project */}
      <Project projectArray={data} />
    </div>
  );
}