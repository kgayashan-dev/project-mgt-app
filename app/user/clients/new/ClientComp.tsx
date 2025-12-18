"use client";

import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useNotification } from "@/Contexts/NotificationContext";


const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ClientFormData {
  id: string; // Should be empty string for new clients
  name: string;
  initials: string;
  location: string;
  contactEmail: string;
  phoneNumber: string;
  businessType: string;
  billingCycle: string;
  clientSince: string;
  createdAt?: string;
  lastActive?: string;
}

interface CreateClientResponse {
  message: string;
  clientId: string;
}

// API service - removed addNotification from here
const clientApi = {
  create: async (client: ClientFormData): Promise<CreateClientResponse> => {
    try {
      console.log("Sending data to API:", client);

      const response = await fetch(
        `${API_URL}/project_pulse/Client/createClient`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(client),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to create client: ${response.status} - ${errorText}`
        );
      }

      const result: CreateClientResponse = await response.json();
      console.log("Success response:", result);
      return result;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  },

  get: async (id: string): Promise<ClientFormData> => {
    const response = await fetch(
      `${API_URL}/project_pulse/Client/getClient/${id}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch client: ${response.status} - ${errorText}`
      );
    }
    return response.json();
  },

  update: async (
    id: string,
    client: ClientFormData
  ): Promise<ClientFormData> => {
    const response = await fetch(
      `${API_URL}/project_pulse/Client/updateClient/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...client,
          id: id, // Ensure the ID is included for updates
        }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update client: ${response.status} - ${errorText}`
      );
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(
      `${API_URL}/project_pulse/Client/deleteClient/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to delete client: ${response.status} - ${errorText}`
      );
    }
  },
};

const ClientForm = () => {
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState<ClientFormData>({
    id: "", // Empty string for new clients
    name: "",
    initials: "",
    location: "",
    contactEmail: "",
    phoneNumber: "",
    businessType: "",
    billingCycle: "monthly",
    clientSince: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const isEditMode = !!clientId;

  // Fetch client data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError(null);
      const client = await clientApi.get(clientId);
      setFormData(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch client");
      // Add error notification
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to fetch client data",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // CREATE & UPDATE Operation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      setError("Client name is required");
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Client name is required",
        duration: 5000,
      });
      return;
    }

    if (!formData.contactEmail.trim()) {
      setError("Contact email is required");
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Contact email is required",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        // UPDATE operation - use the existing ID
        await clientApi.update(clientId, {
          ...formData,
          id: clientId, // Ensure ID is set for updates
        });
        
        // Add success notification for update
        addNotification({
          type: "success",
          title: "Success",
          message: "Client updated successfully",
          duration: 5000,
        });
        
        router.push("/user/clients");
      } else {
        // CREATE operation - ensure ID is empty string
        const createData = {
          ...formData,
          id: "", // Explicitly set to empty string for new clients
        };
        const result = await clientApi.create(createData);
    
        console.log("Client created with ID:", result.clientId);

        // Add success notification for create
        addNotification({
          type: "success",
          title: "Success",
          message: `${result.message}`,
          duration: 5000,
          resNumber: `${result.clientId}`,
        });

        // Wait a bit before redirecting so user can see the notification
        setTimeout(() => {
          router.push("/user/clients");
        }, 1000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save client";
      setError(errorMessage);
      
      // Add error notification
      addNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
        duration: 5000,
      });
      
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // DELETE Operation
  const handleDelete = async () => {
    if (
      !isEditMode ||
      !confirm("Are you sure you want to delete this client?")
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await clientApi.delete(clientId);
      
      // Add success notification for delete
      addNotification({
        type: "success",
        title: "Success",
        message: "Client deleted successfully",
        duration: 5000,
      });
      
      router.push("/user/clients");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete client";
      setError(errorMessage);
      
      // Add error notification
      addNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    router.push("/user/clients");
  };

  if (loading && isEditMode) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-lg font-bold text-navy-900">
          {isEditMode ? "Edit Client" : "New Client"}
        </h1>
        <div className="flex gap-4">
          {isEditMode && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleRedirect}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 regular-14 font-semibold">Error:</p>
          <p className="text-red-600 regular-14">{error}</p>
        </div>
      )}

      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Main Form */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-gray-600">
            <Info size={20} />
            <p className="regular-14">
              Client name and contact email are required fields.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 regular-12">
            {/* Client Name */}
            <div>
              <label className="block regular-12 font-medium mb-2">
                Client Name *
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={loading}
                placeholder="Enter client or company name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 regular-12">
              {/* Initials */}
              <div>
                <label className="block font-medium mb-2">Initials</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.initials}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      initials: e.target.value,
                    }))
                  }
                  disabled={loading}
                  placeholder="e.g., ABC"
                  maxLength={10}
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block regular-12 font-medium mb-2">
                  Business Type
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessType: e.target.value,
                    }))
                  }
                  disabled={loading}
                >
                  <option value="">Select business type</option>
                  <option value="corporation">Corporation</option>
                  <option value="llc">LLC</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole-proprietorship">
                    Sole Proprietorship
                  </option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="government">Government</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block regular-12 font-medium mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                disabled={loading}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block regular-12 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                disabled={loading}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 regular-12">
              {/* Location */}
              <div>
                <label className="block font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  disabled={loading}
                  placeholder="City, State, Country"
                />
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block regular-12 font-medium mb-2">
                  Billing Cycle
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.billingCycle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      billingCycle: e.target.value,
                    }))
                  }
                  disabled={loading}
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                  <option value="project-based">Project Based</option>
                </select>
              </div>
            </div>

            {/* Client Since */}
            <div>
              <label className="block regular-12 font-medium mb-2">
                Client Since
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.clientSince}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    clientSince: e.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;