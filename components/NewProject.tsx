"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  ChevronRight,
  Beaker,
  Check,
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Clock4,
  Save,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect"; // Import the component

// Types
interface Service {
  id?: number;
  description: string;
  hours: number;
  rate: number;
}

interface TeamMember {
  memId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  isActive: boolean;
}

interface Client {
  id: string;
  name: string;
  initials: string;
  location: string;
  contactEmail: string;
  phoneNumber: string;
  businessType: string;
}

interface NewProjectProps {
  clients: Client[];
  teamMembers: TeamMember[];
}

type ProjectType = "flat-rate" | "hourly";

const NewProject: React.FC<NewProjectProps> = ({ clients, teamMembers }) => {
  const router = useRouter();

  console.log(teamMembers, "ss");

  // State management
  const [client, setClient] = useState<Client | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>(
    []
  );
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flatRate, setFlatRate] = useState("0.00");
  const [totalHours, setTotalHours] = useState("0");
  const [status, setStatus] = useState("Active");
  const [isProjectTypeOpen, setIsProjectTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ProjectType>("flat-rate");
  const [services, setServices] = useState<Service[]>([
    { description: "", hours: 0, rate: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [searchTeamMember, setSearchTeamMember] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Team Member");

  // Status options
  const statusOptions = ["Active", "On Hold", "Completed", "Cancelled"];

  // Project types
  const projectTypes = [
    { id: "flat-rate", label: "Flat Rate Project", icon: DollarSign },
    { id: "hourly", label: "Hourly Project", icon: Clock4 },
  ];

  // Convert clients to SearchableSelect format
  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.name} (${client.id}) - ${client.businessType}`,
  }));

  // Convert status options to SearchableSelect format
  const statusSelectOptions = statusOptions.map((status) => ({
    value: status,
    label: status,
  }));

  // Initialize with default dates
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setEndDate(futureDate.toISOString().split("T")[0]);

    // Set first client by default if available
    if (clients.length > 0) {
      setClient(clients[0]);
    }
  }, [clients]);

  // Filter team members based on search
  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTeamMember.toLowerCase()) ||
      member.memId.toLowerCase().includes(searchTeamMember.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTeamMember.toLowerCase())
  );

  // Handle client selection from SearchableSelect
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find((client) => client.id === clientId);
    setClient(selectedClient || null);
  };

  // Calculate total hours for hourly projects
  const calculateTotalHours = () => {
    return services.reduce((total, service) => total + (service.hours || 0), 0);
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (selectedType === "flat-rate") {
      return parseFloat(flatRate) || 0;
    } else {
      return services.reduce(
        (total, service) => total + service.hours * service.rate,
        0
      );
    }
  };

  // Handle service changes
  const handleServiceChange = (
    index: number,
    field: keyof Service,
    value: string | number
  ) => {
    const updatedServices = [...services];
    const service = updatedServices[index];

    if (field === "hours" || field === "rate") {
      service[field] =
        typeof value === "string" ? parseFloat(value) || 0 : value;
    } else if (field === "description") {
      service.description = value as string;
    }
    setServices(updatedServices);

    // Update total hours for hourly projects
    if (selectedType === "hourly") {
      setTotalHours(calculateTotalHours().toString());
    }
  };

  // Add new service
  const addService = () => {
    setServices([...services, { description: "", hours: 0, rate: 0 }]);
  };

  // Delete service
  const deleteService = (index: number) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index);
      setServices(newServices);
    }
  };

  // Add team member
  const addTeamMember = (member: TeamMember) => {
    if (!selectedTeamMembers.some((m) => m.memId === member.memId)) {
      setSelectedTeamMembers([...selectedTeamMembers, { ...member }]);
    }
  };

  // Remove team member
  const removeTeamMember = (memId: string) => {
    setSelectedTeamMembers(
      selectedTeamMembers.filter((member) => member.memId !== memId)
    );
  };

  // Update team member role
  const updateTeamMemberRole = (memId: string, role: string) => {
    setSelectedTeamMembers(
      selectedTeamMembers.map((member) =>
        member.memId === memId ? { ...member, role } : member
      )
    );
  };

  // Handle project type selection
  const handleSelect = (type: ProjectType) => {
    setSelectedType(type);
    setIsProjectTypeOpen(false);
    // Reset values based on type
    if (type === "flat-rate") {
      setFlatRate("0.00");
    } else {
      setFlatRate("0.00");
      setTotalHours(calculateTotalHours().toString());
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle save project
  const handleSave = async () => {
    // Validation
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    if (!client) {
      alert("Please select a client");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return;
    }

    setIsLoading(true);

    const projectData = {
      id: "",
      projectName: projectName.trim(),
      clientId: client.id,
      description: description.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      flatRate: parseFloat(flatRate) || 0,
      totalHours:
        selectedType === "hourly"
          ? calculateTotalHours()
          : parseInt(totalHours) || 0,
      status,
      services: services
        .map((service) => ({
          id: 0,
          description: service.description,
          hours: service.hours,
          rate: service.rate,
        }))
        .filter((service) => service.description.trim() !== ""), // Filter out empty services
      teamMembers: selectedTeamMembers.map((member) => ({
        memId: member.memId,
        role: member.role,
      })),
    };
    // console.log(projectData)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_URL}/project_pulse/Project/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        alert(`✅ ${result.message}!\nProject ID: ${result.id}`);
        // console.log(result);
        // router.push('/projects');
      } else {
        // console.log(result);
        alert(`❌ Error: ${result.message}\n Msg: ${result.error}`);
      }
    } catch (error) {
      console.warn("Error creating project:", error);
      alert("❌ Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Calculate project duration in days
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-8">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-900">New Project</h1>
          <p className="text-gray-500 mt-2">
            Create a new project with all necessary details
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !projectName || !client}
            className="bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Project
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - Main Form */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4">
          {/* Client Selection - Using SearchableSelect */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Client</h2>
              {client && (
                <button
                  onClick={() => setClient(null)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            {client ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                        {client.initials}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {client.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {client.businessType} • {client.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-xs font-medium">
                          {client.contactEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-xs font-medium">
                          {client.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <SearchableSelect
                      options={clientOptions}
                      value={client?.id || ""}
                      onChange={handleClientSelect}
                      placeholder="Select a client..."
                      label="Assign Client"
                      icon={Users}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Team Members
              </h2>
              <button
                onClick={() => setShowTeamMemberModal(true)}
                className="flex items-center text-sm gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <UserPlus size={18} />
                Add Member
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedTeamMembers.length === 0 ? (
                <div className="text-gray-500 italic">
                  No team members assigned yet
                </div>
              ) : (
                selectedTeamMembers.map((member) => (
                  <div
                    key={member.memId}
                    className="group relative border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              updateTeamMemberRole(member.memId, e.target.value)
                            }
                            className="text-xs text-blue-600 bg-transparent border-none focus:ring-0"
                          >
                            <option value="Team Member">Team Member</option>
                            <option value="Project Manager">
                              Project Manager
                            </option>
                            <option value="Lead Developer">
                              Lead Developer
                            </option>
                            <option value="Designer">Designer</option>
                            <option value="QA">QA</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTeamMember(member.memId)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full text-lg font-medium text-gray-900 p-2 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Project Dates & Financials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 text-sm py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left- top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedType === "flat-rate" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Flat Rate *
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={flatRate}
                      onChange={(e) => setFlatRate(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 text-sm py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Total Hours
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 text-sm transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    value={
                      selectedType === "hourly"
                        ? calculateTotalHours()
                        : totalHours
                    }
                    onChange={(e) => setTotalHours(e.target.value)}
                    readOnly={selectedType === "hourly"}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Status - Using SearchableSelect */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Status
              </label>
              <SearchableSelect
                options={statusSelectOptions}
                value={status}
                onChange={setStatus}
                placeholder="Select status..."
                className="w-full"
              />
            </div>
          </div>

          {/* Services Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Services</h2>
              <button
                onClick={addService}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 group hover:border-blue-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Service description"
                      className="flex-1 text-sm font-medium border-none focus:outline-none focus:ring-0"
                    />
                    {services.length > 1 && (
                      <button
                        onClick={() => deleteService(index)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={service.hours || ""}
                        onChange={(e) =>
                          handleServiceChange(index, "hours", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Rate ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={service.rate || ""}
                        onChange={(e) =>
                          handleServiceChange(index, "rate", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {service.hours > 0 && service.rate > 0 && (
                    <div className="mt-3 text-right text-xs text-gray-600">
                      Total: {formatCurrency(service.hours * service.rate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Summary */}
        <div className="w-full lg:w-80">
          {/* Settings Card */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-md font-bold text-gray-900 mb-2">Settings</h2>
            <p className="text-gray-500 text-sm mb-6">For This Project</p>

            {/* Project Type */}
            <div className="mb-6">
              <div className="relative">
                <div
                  className="group cursor-pointer"
                  onClick={() => setIsProjectTypeOpen(!isProjectTypeOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500">
                        <Beaker size={20} />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-sm">
                          Project Type
                        </h3>
                        <p className="text-blue-600 text-sm">
                          {
                            projectTypes.find(
                              (type) => type.id === selectedType
                            )?.label
                          }
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`text-gray-400 group-hover:text-gray-600 transition-transform ${
                        isProjectTypeOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {isProjectTypeOpen && (
                  <div className="absolute left-0  text-sm right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {projectTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleSelect(type.id as ProjectType)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className="text-gray-500" />
                            <span
                              className={
                                selectedType === type.id
                                  ? "text-blue-600 font-medium"
                                  : "text-gray-700"
                              }
                            >
                              {type.label}
                            </span>
                          </div>
                          {selectedType === type.id && (
                            <Check size={16} className="text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Project Summary */}
            <div className="border-t pt-6">
              <h3 className="text-gray-900 text-sm font-medium mb-4">
                Project Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {calculateDuration()} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium">
                    {selectedTeamMembers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Services</span>
                  <span className="font-medium">{services.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours</span>
                  <span className="font-medium">
                    {selectedType === "hourly"
                      ? calculateTotalHours()
                      : totalHours}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">
                      Total Cost
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculateTotalCost())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Member Modal */}
      {showTeamMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Add Team Members
                </h2>
                <button
                  onClick={() => {
                    setShowTeamMemberModal(false);
                    setSearchTeamMember("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Select team members to add to this project
              </p>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search team members by name, ID, or role..."
                  value={searchTeamMember}
                  onChange={(e) => setSearchTeamMember(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {filteredTeamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No team members found
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTeamMembers.map((member) => (
                    <div
                      key={member.memId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {member.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {member.role} • {member.department}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="Team Member">Team Member</option>
                          <option value="Project Manager">
                            Project Manager
                          </option>
                          <option value="Lead Developer">Lead Developer</option>
                          <option value="Designer">Designer</option>
                          <option value="QA">QA</option>
                        </select>

                        {selectedTeamMembers.some(
                          (m) => m.memId === member.memId
                        ) ? (
                          <button
                            onClick={() => removeTeamMember(member.memId)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              addTeamMember({ ...member, role: newMemberRole });
                              setNewMemberRole("Team Member");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">
                    Selected:{" "}
                    <span className="font-medium">
                      {selectedTeamMembers.length}
                    </span>{" "}
                    members
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTeamMemberModal(false);
                    setSearchTeamMember("");
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProject;
