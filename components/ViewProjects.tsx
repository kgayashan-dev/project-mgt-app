// components/ProjectsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";

interface Project {
  id: string;
  projectName: string;
  clientId: string;
  description: string;
  startDate: string;
  endDate: string;
  flatRate: number;
  totalHours: number;
  status: string;
  services: Service[];
  teamMembers: TeamMember[];
}

interface Service {
  id: number;
  description: string;
  hours: number;
  rate: number;
}

interface TeamMember {
  memId: string;
  role: string;
}

interface ProjectsPageProps {
  initialData: Project[];
  // company?: any;
}
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export default function ProjectsPage({ initialData }: ProjectsPageProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialData);
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter projects based on search and status
  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.projectName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

  // Handle project click
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  // Handle delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Project/delete/${projectId}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Project deleted successfully!");
        // Remove from local state
        setProjects(projects.filter((p) => p.id !== projectId));
      } else {
        alert(`Error: ${result.message || "Failed to delete project"}`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  // Calculate project statistics
  const getStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "Active").length;
    const completedProjects = projects.filter(
      (p) => p.status === "Completed"
    ).length;
    const totalRevenue = projects.reduce(
      (sum, project) => sum + project.flatRate,
      0
    );
    const totalTeamMembers = new Set(
      projects.flatMap((p) => p.teamMembers.map((tm) => tm.memId))
    ).size;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalRevenue,
      totalTeamMembers,
    };
  };

  const stats = getStats();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-navy-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all your projects in one place
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => router.push("/user/projects/new")}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Projects</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalProjects}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className="text-green-600 font-medium">
              {stats.activeProjects} active
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">
              {stats.completedProjects} completed
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Projects</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeProjects}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Currently in progress
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">From all projects</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Team Members</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalTeamMembers}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Working across projects
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Project
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Client
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Timeline
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Budget
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Team
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-sm font-medium">No projects found</p>
                      <p className="text-xs mt-1">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your filters or search term"
                          : "Create your first project to get started"}
                      </p>
                      {!searchTerm && statusFilter === "all" && (
                        <button
                          onClick={() => router.push("/projects/new")}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Create New Project
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  // const startDate = new Date(project.startDate);
                  const endDate = new Date(project.endDate);
                  const today = new Date();
                  const isOverdue =
                    endDate < today && project.status === "Active";
                  const daysRemaining = Math.ceil(
                    (endDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleProjectClick(project)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {project.projectName}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {project.id}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                              {project.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-purple-600">
                              {project.clientId.charAt(3)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium">
                              {project.clientId}
                            </p>
                            <p className="text-xs text-gray-500">Client ID</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-xs font-medium">
                            {formatDate(project.startDate)} -{" "}
                            {formatDate(project.endDate)}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isOverdue ? "text-red-600" : "text-gray-500"
                            }`}
                          >
                            {isOverdue ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Overdue by {Math.abs(daysRemaining)} days
                              </span>
                            ) : project.status === "Active" ? (
                              <span className="text-green-600">
                                {daysRemaining > 0
                                  ? `${daysRemaining} days remaining`
                                  : "Ending today"}
                              </span>
                            ) : (
                              <span className="capitalize">
                                {project.status.toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">
                            ${project.flatRate.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.totalHours} hours
                          </div>
                          <div className="text-xs text-gray-400">
                            $
                            {project.totalHours > 0
                              ? (project.flatRate / project.totalHours).toFixed(
                                  2
                                )
                              : "0.00"}
                            /hour
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex -space-x-2">
                          {project.teamMembers
                            .slice(0, 3)
                            .map((member, index) => (
                              <div
                                key={member.memId}
                                className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700"
                                style={{ zIndex: 3 - index }}
                              >
                                {member.memId.charAt(3)}
                              </div>
                            ))}
                          {project.teamMembers.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                              +{project.teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : project.status === "On Hold"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td
                        className="py-4 px-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProjectClick(project)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/user/projects/${project.id}`)
                            }
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit Project"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Project"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {filteredProjects.length} of {projects.length} projects
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProject.projectName}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-gray-500">{selectedProject.id}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedProject.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : selectedProject.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : selectedProject.status === "On Hold"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Project Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Project Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500">
                        Description
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedProject.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">
                          Start Date
                        </label>
                        <p className="mt-1 font-medium">
                          {formatDate(selectedProject.startDate)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          End Date
                        </label>
                        <p className="mt-1 font-medium">
                          {formatDate(selectedProject.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">
                          Client ID
                        </label>
                        <p className="mt-1 font-medium">
                          {selectedProject.clientId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">
                          Total Hours
                        </label>
                        <p className="mt-1 font-medium">
                          {selectedProject.totalHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Financial Summary
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flat Rate</span>
                        <span className="font-bold text-sm">
                          ${selectedProject.flatRate.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hourly Rate</span>
                        <span className="font-medium">
                          $
                          {selectedProject.totalHours > 0
                            ? (
                                selectedProject.flatRate /
                                selectedProject.totalHours
                              ).toFixed(2)
                            : "0.00"}
                          /hour
                        </span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-semibold">
                            Total Value
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            ${selectedProject.flatRate.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Services
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900">
                            Service
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900">
                            Hours
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900">
                            Rate
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-900">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedProject.services.map((service) => (
                          <tr key={service.id}>
                            <td className="py-3 px-4">{service.description}</td>
                            <td className="py-3 px-4">{service.hours}</td>
                            <td className="py-3 px-4">
                              ${service.rate.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              ${(service.hours * service.rate).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team Members */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Team Members
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.teamMembers.map((member) => (
                      <div
                        key={member.memId}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {member.memId.charAt(3)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {member.memId}
                          </h4>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-100">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    router.push(`/user/projects/${selectedProject.id}`);
                    setShowDetailsModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
