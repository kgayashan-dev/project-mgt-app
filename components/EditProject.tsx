"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Edit,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";
import QuotationSelectionModal from "@/components/QuotationSelectModel";

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

interface Quotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  clientId: string;
  companyID?: string;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  totalTax: number;
  terms?: string;
  grandTotal: number;
  status?: string;
  qItems?: {
    id: number;
    description: string;
    quotationId: string;
    unit: string;
    qty: number;
    rate: number;
  }[];
  ClientName?: string;
  Items?: any[];
}

interface ProjectData {
  id: string;
  projectName: string;
  clientId: string;
  clientName?: string;
  description: string;
  startDate: string;
  endDate: string;
  flatRate: number;
  totalHours: number;
  status: string;
  services: Service[];
  teamMembers: Array<{
    memId: string;
    name?: string;
    role: string;
  }>;
  quotationId?: string;
  quotationNumber?: string;
}

interface EditProjectProps {
  clients: Client[];
  teamMembers: TeamMember[];
  projectId: string;
  initialProjectData?: ProjectData;
  quotations?: Quotation[];
}

type ProjectType = "flat-rate" | "hourly";

const EditProject: React.FC<EditProjectProps> = ({
  clients,
  teamMembers,
  projectId,
  initialProjectData,
  quotations = [],
}) => {
  const router = useRouter();

  // State management
  const [client, setClient] = useState<Client | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>(
    []
  );
  const [projectName, setProjectName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [flatRate, setFlatRate] = useState<string>("0.00");
  const [totalHours, setTotalHours] = useState<string>("0");
  const [status, setStatus] = useState<string>("Active");
  const [isProjectTypeOpen, setIsProjectTypeOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<ProjectType>("flat-rate");
  const [services, setServices] = useState<Service[]>([
    { description: "", hours: 0, rate: 0 },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(!initialProjectData);
  const [showTeamMemberModal, setShowTeamMemberModal] =
    useState<boolean>(false);
  const [searchTeamMember, setSearchTeamMember] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<string>("Team Member");
  const [showQuotationModal, setShowQuotationModal] = useState<boolean>(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );
  const [searchQuotation, setSearchQuotation] = useState<string>("");

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    if (!searchQuotation.trim()) {
      return quotations;
    }
    const searchLower = searchQuotation.toLowerCase();
    return quotations.filter(
      (q) =>
        q.quotationNumber?.toLowerCase().includes(searchLower) ||
        (q.ClientName && q.ClientName.toLowerCase().includes(searchLower)) ||
        q.clientId?.toLowerCase().includes(searchLower) ||
        (q.terms && q.terms.toLowerCase().includes(searchLower))
    );
  }, [searchQuotation, quotations]);

  // Status options
  const statusOptions = ["Active", "On Hold", "Completed", "Cancelled"];

  // Project types
  const projectTypes = [
    { id: "flat-rate", label: "Flat Rate Project", icon: DollarSign },
    { id: "hourly", label: "Hourly Project", icon: Clock4 },
  ];

  // Convert clients to SearchableSelect format
  const clientOptions = useMemo(
    () =>
      clients.map((client: Client) => ({
        value: client.id,
        label: `${client.name} (${client.id}) - ${client.businessType}`,
      })),
    [clients]
  );

  // Convert status options to SearchableSelect format
  const statusSelectOptions = useMemo(
    () =>
      statusOptions.map((status) => ({
        value: status,
        label: status,
      })),
    []
  );

  // Helper function to safely format dates
  const formatDateForInput = useCallback(
    (dateString: string | Date | undefined | null): string => {
      if (!dateString) {
        const today = new Date().toISOString().split("T")[0];
        return today;
      }

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date");
        }
        return date.toISOString().split("T")[0];
      } catch (error) {
        console.warn("Error formatting date:", dateString, error);
        const today = new Date().toISOString().split("T")[0];
        return today;
      }
    },
    []
  );

  // Populate form with existing data
  const populateForm = useCallback(
    (project: ProjectData) => {
      console.log("Populating form with:", project);

      // Set basic fields
      setProjectName(project.projectName || "");
      setDescription(project.description || "");

      // Set dates
      const startDateValue = formatDateForInput(project.startDate);
      setStartDate(startDateValue);

      let endDateValue = formatDateForInput(project.endDate);

      // Ensure end date is not before start date
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);
      if (end < start) {
        const newEnd = new Date(start);
        newEnd.setDate(start.getDate() + 30);
        endDateValue = newEnd.toISOString().split("T")[0];
      }
      setEndDate(endDateValue);

      // Set numeric values
      setFlatRate(project.flatRate?.toString() || "0.00");
      setTotalHours(project.totalHours?.toString() || "0");
      setStatus(project.status || "Active");

      // Determine project type based on services
      const hasServices = project.services && project.services.length > 0;
      const hasHourlyServices =
        hasServices &&
        project.services.some((s) => (s.hours || 0) > 0 && (s.rate || 0) > 0);

      setSelectedType(hasHourlyServices ? "hourly" : "flat-rate");

      // Set services
      if (project.services && project.services.length > 0) {
        const safeServices = project.services.map((service) => ({
          id: service.id || 0,
          description: service.description || "",
          hours: service.hours || 0,
          rate: service.rate || 0,
        }));
        setServices(safeServices);
      } else {
        setServices([{ description: "", hours: 0, rate: 0 }]);
      }

      // Set client
      const foundClient = clients.find((c) => c.id === project.clientId);
      if (foundClient) {
        setClient(foundClient);
      } else {
        console.warn(
          `Client with ID ${project.clientId} not found in clients list`
        );
      }

      // Set team members
      if (project.teamMembers && project.teamMembers.length > 0) {
        const populatedMembers = project.teamMembers
          .map((member) => {
            const fullMember = teamMembers.find(
              (tm) => tm.memId === member.memId
            );
            return {
              memId: member.memId || "",
              name:
                fullMember?.name || member.name || member.memId || "Unknown",
              email: fullMember?.email || "",
              phone: fullMember?.phone || "",
              department: fullMember?.department || "",
              role: member.role || "Team Member",
              isActive: fullMember?.isActive || true,
            };
          })
          .filter(
            (member): member is TeamMember =>
              member !== undefined && member.memId !== undefined
          );

        setSelectedTeamMembers(populatedMembers);
      } else {
        setSelectedTeamMembers([]);
      }

      // Set quotation if exists
      if (project.quotationId) {
        const foundQuotation = quotations.find(
          (q) => q.id === project.quotationId
        );
        if (foundQuotation) {
          setSelectedQuotation(foundQuotation);
        }
      }
    },
    [clients, teamMembers, quotations, formatDateForInput]
  );

  // Initialize form with data
  useEffect(() => {
    if (initialProjectData) {
      populateForm(initialProjectData);
      setIsFetching(false);
    } else {
      fetchProjectData();
    }
  }, [initialProjectData]);

  // Handle quotation selection
  const handleSelectQuotation = useCallback(
    (quotation: Quotation) => {
      setSelectedQuotation(quotation);

      const selectedClient = clients.find((c) => c.id === quotation.clientId);
      if (selectedClient) {
        setClient(selectedClient);
      }

      setProjectName(`Project from ${quotation.quotationNumber || ""}`);
      setDescription(
        `Project created from quotation ${quotation.quotationNumber}${
          quotation.terms ? ` - Terms: ${quotation.terms}` : ""
        }`
      );

      const items = quotation.qItems || quotation.Items || [];
      if (items && items.length > 0) {
        const newServices = items.map((item: any) => ({
          description: item.description || item.Description || "",
          hours: item.qty || item.Quantity || 1,
          rate: item.rate || item.UnitPrice || 0,
        }));
        setServices(newServices);

        const totalHrs = newServices.reduce(
          (total, service) => total + (service.hours || 0),
          0
        );
        setTotalHours(totalHrs.toString());
      } else {
        const newServices = [
          {
            description: `Services from quotation ${quotation.quotationNumber}`,
            hours: 1,
            rate: quotation.grandTotal || 0,
          },
        ];
        setServices(newServices);
        setTotalHours("1");
      }

      setFlatRate(quotation.grandTotal?.toFixed(2) || "0.00");

      if (quotation.quotationDate) {
        const date = new Date(quotation.quotationDate);
        setStartDate(date.toISOString().split("T")[0]);

        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 30);
        setEndDate(endDate.toISOString().split("T")[0]);
      }

      setTimeout(() => {
        setShowQuotationModal(false);
      }, 500);
    },
    [clients]
  );

  // Clear quotation selection
  const clearQuotationSelection = useCallback(() => {
    setSelectedQuotation(null);
    setProjectName("");
    setDescription("");
    setServices([{ description: "", hours: 0, rate: 0 }]);
    setFlatRate("0.00");
    setTotalHours("0");
  }, []);

  // Fetch project data
  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsFetching(true);
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${API_URL}/project_pulse/Project/${projectId}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const project = result.data;
          populateForm(project);
        } else {
          alert("Failed to fetch project data");
          router.back();
        }
      } else {
        alert("Project not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      router.back();
    } finally {
      setIsFetching(false);
    }
  }, [projectId, router]);

  // Filter team members based on search
  const filteredTeamMembers = useMemo(
    () =>
      teamMembers.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchTeamMember.toLowerCase()) ||
          member.memId
            ?.toLowerCase()
            .includes(searchTeamMember.toLowerCase()) ||
          member.role?.toLowerCase().includes(searchTeamMember.toLowerCase())
      ),
    [teamMembers, searchTeamMember]
  );

  // Handle client selection from SearchableSelect
  const handleClientSelect = useCallback(
    (clientId: string) => {
      const selectedClient = clients.find((client) => client.id === clientId);
      setClient(selectedClient || null);
    },
    [clients]
  );

  // Calculate total hours for hourly projects
  const calculateTotalHours = useCallback(() => {
    return services.reduce((total, service) => total + (service.hours || 0), 0);
  }, [services]);

  // Calculate total cost
  const calculateTotalCost = useCallback(() => {
    if (selectedType === "flat-rate") {
      return parseFloat(flatRate) || 0;
    } else {
      return services.reduce(
        (total, service) => total + (service.hours || 0) * (service.rate || 0),
        0
      );
    }
  }, [selectedType, flatRate, services]);

  // Calculate service total
  const calculateServiceTotal = useCallback((hours: number, rate: number) => {
    return hours * rate;
  }, []);

  // Handle service changes
  const handleServiceChange = useCallback(
    (index: number, field: keyof Service, value: string | number) => {
      setServices((prevServices) => {
        const updatedServices = [...prevServices];
        const service = updatedServices[index];

        if (field === "hours" || field === "rate") {
          service[field] =
            typeof value === "string" ? parseFloat(value) || 0 : value;
        } else if (field === "description") {
          service.description = (value as string) || "";
        }

        // Ensure service object properties are never undefined
        if (!service.description) service.description = "";
        if (service.hours === undefined || service.hours === null)
          service.hours = 0;
        if (service.rate === undefined || service.rate === null)
          service.rate = 0;

        return updatedServices;
      });
    },
    []
  );

  // Add new service
  const addService = useCallback(() => {
    setServices((prev) => [...prev, { description: "", hours: 0, rate: 0 }]);
  }, []);

  // Delete service
  const deleteService = useCallback((index: number) => {
    setServices((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  // Add team member
  const addTeamMember = useCallback((member: TeamMember) => {
    setSelectedTeamMembers((prev) => {
      if (!prev.some((m) => m.memId === member.memId)) {
        return [...prev, { ...member }];
      }
      return prev;
    });
  }, []);

  // Remove team member
  const removeTeamMember = useCallback((memId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.filter((member) => member.memId !== memId)
    );
  }, []);

  // Update team member role
  const updateTeamMemberRole = useCallback((memId: string, role: string) => {
    setSelectedTeamMembers((prev) =>
      prev.map((member) =>
        member.memId === memId
          ? { ...member, role: role || "Team Member" }
          : member
      )
    );
  }, []);

  // Handle project type selection
  const handleSelect = useCallback((type: ProjectType) => {
    setSelectedType(type);
    setIsProjectTypeOpen(false);
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }, []);

  // Handle update project
  const handleUpdate = useCallback(async () => {
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
      status: status || "Active",
      services: services
        .map((service) => ({
          id: service.id || 0,
          description: service.description || "",
          hours: service.hours || 0,
          rate: service.rate || 0,
        }))
        .filter((service) => service.description.trim() !== ""),
      teamMembers: selectedTeamMembers.map((member) => ({
        memId: member.memId,
        role: member.role || "Team Member",
      })),
      quotationId: selectedQuotation?.id || "",
      // quotationNumber: selectedQuotation?.quotationNumber || "",
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${API_URL}/project_pulse/Project/update/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify(projectData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}!`);
        router.push(`/user/projects`);
      } else {
        alert(`❌ Error: ${result.message}\n Msg: ${result.error}`);
      }
    } catch (error) {
      alert("❌ Failed to update project. Please try again. " + error);
    } finally {
      setIsLoading(false);
    }
  }, [
    projectName,
    client,
    startDate,
    endDate,
    flatRate,
    selectedType,
    calculateTotalHours,
    totalHours,
    status,
    services,
    selectedTeamMembers,
    selectedQuotation,
    projectId,
    description,
    router,
  ]);

  // Calculate project duration in days
  const calculateDuration = useCallback(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.back();
    }
  }, [router]);

  // Show loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-20 to-white p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-900 flex items-center gap-3">
            <Edit className="text-blue-600" size={32} />
            Edit Project: {projectId}
          </h1>
          <p className="text-gray-500 mt-2">
            Update project details, team members, and services
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="px-3 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-100  transition-all duration-200 font-medium text-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading || !projectName || !client}
            className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin text-sm rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Project
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quotation Selection Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowQuotationModal(true)}
          className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
        >
          <FileText size={18} />
          Select from Quotation
        </button>

        {selectedQuotation && (
          <div className="m-3 inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <FileText className="text-blue-600" size={20} />
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Selected: {selectedQuotation.id}
              </p>
              <p className="text-sm text-gray-600">
                Client:{" "}
                {selectedQuotation.ClientName ||
                  selectedQuotation.clientId ||
                  "N/A"}{" "}
                • Amount: {formatCurrency(selectedQuotation.grandTotal || 0)}
              </p>
              <p className="text-xs text-gray-500">
                Date: {formatDate(selectedQuotation.quotationDate || "")} •
                Status: {selectedQuotation.status || "N/A"}
              </p>
            </div>
            <button
              onClick={clearQuotationSelection}
              className="text-red-600 hover:text-red-700"
              title="Remove quotation"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - Main Form */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4">
          {/* Client Selection */}
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
                        {client.initials || "?"}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {client.name || "Unknown Client"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {client.businessType || "N/A"} •{" "}
                          {client.location || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-xs font-medium">
                          {client.contactEmail || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-xs font-medium">
                          {client.phoneNumber || "N/A"}
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
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
                        {(member.name || "?").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.name || "Unknown Member"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <select
                            value={member.role || "Team Member"}
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
                className="w-full text-sm font-medium text-gray-900 p-2 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
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

            {/* Project Dates & Financial */}
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
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full pl-10 pr-3 text-sm py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="absolute left-3 text-sm top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={flatRate}
                      onChange={(e) => setFlatRate(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        : totalHours || "0"
                    }
                    onChange={(e) => setTotalHours(e.target.value)}
                    readOnly={selectedType === "hourly"}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
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
                className="flex items-center text-sm gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
                      value={service.description || ""}
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
                        step="0.5"
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

                  {(service.hours || 0) > 0 && (service.rate || 0) > 0 && (
                    <div className="mt-3 text-right text-xs text-gray-600">
                      Total:{" "}
                      {formatCurrency(
                        calculateServiceTotal(
                          service.hours || 0,
                          service.rate || 0
                        )
                      )}
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
            <h2 className="text-sm font-bold text-gray-900 mb-2">Settings</h2>
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
                          {projectTypes.find((type) => type.id === selectedType)
                            ?.label || "Select Type"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`text-gray-400 text-sm group-hover:text-gray-600 transition-transform ${
                        isProjectTypeOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {isProjectTypeOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {projectTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleSelect(type.id as ProjectType)}
                          className="w-full flex items-center text-sm justify-between px-4 py-3 hover:bg-gray-100  border-b last:border-b-0"
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
              <h3 className="text-gray-900 text-md font-medium mb-4">
                Project Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {calculateDuration()} days
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium">
                    {selectedTeamMembers.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Services</span>
                  <span className="font-medium">{services.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Hours</span>
                  <span className="font-medium">
                    {selectedType === "hourly"
                      ? calculateTotalHours()
                      : totalHours || "0"}
                  </span>
                </div>
                {selectedQuotation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Source Quotation</span>
                    <span className="font-medium text-blue-600">
                      {selectedQuotation.quotationNumber || "N/A"}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center text-md">
                    <span className="text-gray-900 font-medium">
                      Total Cost
                    </span>
                    <span className="text-md font-bold text-green-600">
                      {formatCurrency(calculateTotalCost())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Selection Modal */}
      <QuotationSelectionModal
        showModal={showQuotationModal}
        onClose={() => setShowQuotationModal(false)}
        quotations={filteredQuotations}
        selectedQuotation={selectedQuotation}
        onSelectQuotation={handleSelectQuotation}
        isLoading={false}
        searchValue={searchQuotation}
        onSearchChange={setSearchQuotation}
        onSearchSubmit={() => {}}
      />

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
                          {(member.name || "?").charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {member.name || "Unknown Member"}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {member.role || "N/A"} •{" "}
                            {member.department || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email || "N/A"}
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

            <div className="p-4 border-t bg-gray-100 ">
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

export default EditProject;
