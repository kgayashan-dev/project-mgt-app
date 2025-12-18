import React, { useState } from "react";
import {
  Plus,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { formatDate2 } from "@/utils/converts";

interface TeamMember {
  memId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joinDate: string;
  isActive: boolean;
  createdDate: string;
}

interface TeamMembersProps {
  teamMembersData: TeamMember[];
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const TeamMembers: React.FC<TeamMembersProps> = ({
  teamMembersData = [],
  onRefresh = () => {},
  loading = false,
  error = null,
}) => {

  console.log(teamMembersData)
  // State management for UI components only
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showDeletedMembers, setShowDeletedMembers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    joinDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  // ============ API FUNCTIONS ============

  // Create a new team member
  const createTeamMember = async () => {
    try {
      setApiLoading(true);
      setApiError(null);

      const response = await fetch(
        `${API_URL}/project_pulse/TeamMembers/createTeamMember`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            joinDate: new Date(formData.joinDate).toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Team member created successfully!");
        setShowAddMemberModal(false);
        resetForm();
        onRefresh(); // Refresh the data from parent
      } else {
        throw new Error(result.message || "Failed to create team member");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating team member";
      setApiError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Update an existing team member
  const updateTeamMember = async () => {
    if (!selectedMember) return;

    try {
      setApiLoading(true);
      setApiError(null);

      const response = await fetch(
        `${API_URL}/project_pulse/TeamMembers/updateTeamMember/${selectedMember.memId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            joinDate: new Date(formData.joinDate).toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Team member updated successfully!");
        setShowEditMemberModal(false);
        resetForm();
        setSelectedMember(null);
        onRefresh(); // Refresh the data from parent
      } else {
        throw new Error(result.message || "Failed to update team member");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating team member";
      setApiError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Delete a team member
  const deleteTeamMember = async () => {
    if (!selectedMember) return;

    try {
      setApiLoading(true);
      setApiError(null);

      const response = await fetch(
        `${API_URL}/project_pulse/TeamMembers/deleteTeamMember/${selectedMember.memId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Team member deleted successfully!");
        setShowDeleteConfirm(false);
        setSelectedMember(null);
        onRefresh(); // Refresh the data from parent
      } else {
        throw new Error(result.message || "Failed to delete team member");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting team member";
      setApiError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (member: TeamMember) => {
    try {
      setApiLoading(true);
      setApiError(null);

      const updatedMember = { ...member, isActive: !member.isActive };

      const response = await fetch(
        `${API_URL}/project_pulse/TeamMembers/updateTeamMember/${member.memId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMember),
        }
      );

      const result = await response.json();

      if (result.success) {
        onRefresh(); // Refresh the data from parent
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating status";
      setApiError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setApiLoading(false);
    }
  };

  // ============ UI FUNCTIONS ============

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    });
    setApiError(null);
  };

  // Open edit modal with member data
  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      department: member.department || "",
      role: member.role || "",
      joinDate: new Date(member.joinDate).toISOString().split("T")[0],
      isActive: member.isActive,
    });
    setShowEditMemberModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteConfirm(true);
  };

  // Handle form submission for add
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validateForm()) return;

    await createTeamMember();
  };

  // Handle form submission for edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) return;

    // Validation
    if (!validateForm()) return;

    await updateTeamMember();
  };

  // Handle delete team member
  const handleDelete = async () => {
    if (!selectedMember) return;

    await deleteTeamMember();
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Name validation
    if (!formData.name.trim()) {
      alert("Name is required.");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      alert("Email is required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // Filter team members based on search and filter criteria
  const filteredMembers = teamMembersData.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === "" || member.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter dropdown
  const departments = [
    ...new Set(
      teamMembersData
        .map((member) => member.department)
        .filter((dept) => dept && dept.trim() !== "")
    ),
  ];

  // Get active members count
  const activeMembersCount = teamMembersData.filter((member) => member.isActive).length;

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Combined loading state
  const isLoading = loading || apiLoading;

  return (
    <div className="mx-auto p-4">
      {/* Header with Stats and Refresh Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">
            {activeMembersCount} active members • {teamMembersData.length} total members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh data"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              resetForm();
              setShowAddMemberModal(true);
            }}
            disabled={isLoading}
          >
            <Plus size={20} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* API Error State */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">API Error: {apiError}</p>
          <button
            onClick={() => setApiError(null)}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Parent Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">Error: {error}</p>
          <button
            onClick={onRefresh}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
            disabled={isLoading}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !apiLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      )}

      {/* Team Members List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-7 p-4 bg-gray-50 border-b font-medium text-gray-700 text-xs">
            <div className="col-span-1">ID</div>
            <div>Name</div>
            <div>Email</div>
            <div>Department</div>
            <div>Role</div>
            <div>Join Date</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No team members found.</p>
              {(searchTerm || filterDepartment) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDepartment("");
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.memId}
                className={`grid grid-cols-7 p-4 border-b hover:bg-gray-50 transition-colors ${
                  !member.isActive ? "bg-gray-100 opacity-75" : ""
                }`}
              >
                <div className="col-span-1 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-medium ${
                      member.isActive ? "bg-blue-600" : "bg-gray-400"
                    }`}
                  >
                    {getInitials(member.name)}
                  </span>
                  <span className="font-mono text-xs">{member.memId}</span>
                </div>
                <div className="flex items-center font-medium">
                  {member.name}
                  {!member.isActive && (
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-600 truncate">
                  {member.email}
                </div>
                <div className="flex items-center">
                  {member.department || "-"}
                </div>
                <div className="flex items-center">{member.role || "-"}</div>
                <div className="flex items-center text-xs text-gray-600">
                  {formatDate2(member.joinDate)}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => toggleActiveStatus(member)}
                    className={`p-2 rounded-md hover:bg-opacity-20 ${
                      member.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-600 hover:bg-gray-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={member.isActive ? "Deactivate" : "Activate"}
                    disabled={apiLoading}
                  >
                    {member.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit"
                    disabled={apiLoading}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(member)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                    disabled={apiLoading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Add Team Member
              </h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={apiLoading}
              >
                <X size={20} />
              </button>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-xs">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={apiLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={apiLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="+94 77 123 4567"
                  disabled={apiLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="e.g., IT, HR, Sales"
                    disabled={apiLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="e.g., Developer, Manager"
                    disabled={apiLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={apiLoading}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded disabled:opacity-50"
                  disabled={apiLoading}
                />
                <label className="ml-2 text-xs text-gray-700">
                  Active Member
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={apiLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={apiLoading}
                >
                  {apiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      {showEditMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Edit Team Member
              </h2>
              <button
                onClick={() => setShowEditMemberModal(false)}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={apiLoading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Member ID:{" "}
                <span className="font-mono font-bold">
                  {selectedMember.memId}
                </span>
              </p>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-xs">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={apiLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={apiLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={apiLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    disabled={apiLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    disabled={apiLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={apiLoading}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded disabled:opacity-50"
                  disabled={apiLoading}
                />
                <label className="ml-2 text-xs text-gray-700">
                  Active Member
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditMemberModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={apiLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={apiLoading}
                >
                  {apiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Member"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Delete Team Member
              </h2>
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{selectedMember.name}</strong> ({selectedMember.memId})?
              </p>
              <p className="text-red-600 text-xs mt-2">
                This action cannot be undone.
              </p>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-xs">{apiError}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={apiLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={apiLoading}
              >
                {apiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Deleted Members Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowDeletedMembers(!showDeletedMembers)}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {showDeletedMembers ? "Hide" : "Show"} Inactive Members
          {showDeletedMembers ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Inactive Members Table */}
      {showDeletedMembers && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Inactive Team Members
          </h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 p-4 bg-gray-50 border-b font-medium text-gray-700 text-xs">
              <div className="col-span-1">ID</div>
              <div>Name</div>
              <div>Email</div>
              <div>Department</div>
              <div>Role</div>
              <div>Join Date</div>
              <div className="text-right">Status</div>
            </div>
            {teamMembersData.filter((member) => !member.isActive).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No inactive team members found.
              </div>
            ) : (
              teamMembersData
                .filter((member) => !member.isActive)
                .map((member) => (
                  <div
                    key={member.memId}
                    className="grid grid-cols-7 p-4 border-b hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-1 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white text-xs font-medium">
                        {getInitials(member.name)}
                      </span>
                      <span className="font-mono text-xs">{member.memId}</span>
                    </div>
                    <div className="flex items-center font-medium">
                      {member.name}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      {member.email}
                    </div>
                    <div className="flex items-center">
                      {member.department || "-"}
                    </div>
                    <div className="flex items-center">
                      {member.role || "-"}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      {formatDate2(member.joinDate)}
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => toggleActiveStatus(member)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={apiLoading}
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;