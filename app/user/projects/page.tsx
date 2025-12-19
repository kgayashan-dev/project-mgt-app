// app/projects/page.tsx

import ProjectsPage from "@/components/ViewProjects";

// Function to get all project data from API
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getAllProjectData() {
  try {
    const response = await fetch(`${API_URL}/project_pulse/Project/all`, {
      method: "GET",
      headers: {
        accept: "*/*",
        "Cache-Control": "no-cache",
      },
      // Disable caching for development
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data; // Return the actual data array
    } else {
      throw new Error(result.message || "Failed to fetch projects");
    }
  } catch (error) {
    console.log("Error fetching project data:", error);
    return null;
  }
}

// Main Page Component
export default async function Page() {
  const data = await getAllProjectData(); // Fetching all project data from API

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to load projects from the server
            </p>
            {/* <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8">
      {/* Passing the data directly into the ProjectsPage component */}
      <ProjectsPage initialData={data} />
    </div>
  );
}
