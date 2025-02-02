import ProjectsPage from "@/components/ViewProjects";
import { PROJECTS, COMPANY } from "@/constraints/index";

// Function to get all project data
async function getAllProjectData() {
  // Assuming PROJECTS is an array of projects
  if (!PROJECTS || PROJECTS.length === 0) {
    return null; // Return null if there are no projects
  }

  // Map through the projects to return the necessary data structure
  return PROJECTS.map((project) => ({
    id: project.id,
    projectName: project.projectName,
    clientId: project.clientId,
    projectDescription: project.description,
    projectStartDate: project.startDate,
    projectEndDate: project.endDate,
    projectFlatRate: project.flatRate,
    projectTotalHours: project.totalHours,
    projectStatus: project.status,
    projectServices: project.services || [],
    projectTeamMember: project.teamMembers || [],
  }));
}

// Main Page Component
export default async function Page() {
  const data = await getAllProjectData(); // Fetching all project data

  if (!data) {
    return <div>No projects found</div>; // Handle case where no data is found
  }

  return (
    <div className="pt-8">
      {/* Passing the data directly into the ProjectsPage component */}
      <ProjectsPage projectArray={data} company={COMPANY} />
    </div>
  );
}
