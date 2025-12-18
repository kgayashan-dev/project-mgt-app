"use client";
import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Building2 } from "lucide-react";

interface CompanyData {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo: string;
  website: string;
  taxId: string;
  registrationNumber: string;
  createdDate: string;
  updatedDate: string;
}

const CompanyData = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(
    null
  );

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    website: "",
    taxId: "",
    registrationNumber: "",
  });

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  const fetchAllCompanies = async () => {
    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Company/getAllCompanies`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCompanies(data.data || []);
        }
      } else {
        console.error("Failed to fetch companies:", response.status);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNew = () => {
    setEditingCompany(null);
    setFormData({
      companyName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      website: "",
      taxId: "",
      registrationNumber: "",
    });
    setIsEditing(true);
  };

  const handleEdit = (company: CompanyData) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || "",
      email: company.email || "",
      phoneNumber: company.phoneNumber || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      zipCode: company.zipCode || "",
      country: company.country || "",
      website: company.website || "",
      taxId: company.taxId || "",
      registrationNumber: company.registrationNumber || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.email || !formData.phoneNumber) {
      alert("Company Name, Email, and Phone Number are required fields.");
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        id: "",
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || null,

        website: formData.website || null,

        registrationNumber: formData.registrationNumber || null,
      };

      const url = editingCompany
        ? `${API_URL}/project_pulse/Company/updateCompanyData/${editingCompany.id}`
        : `${API_URL}/project_pulse/Company/createCompanyData`;

      const method = editingCompany ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsEditing(false);
          setEditingCompany(null);
          fetchAllCompanies();
          alert(
            editingCompany
              ? "Company updated successfully!"
              : "Company created successfully!"
          );
        } else {
          throw new Error(result.message || "Failed to save company data");
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Error saving company data:", error);
      alert("Error saving company data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(
          `${API_URL}/project_pulse/Company/deleteCompanyData/${companyId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            fetchAllCompanies();
            alert("Company deleted successfully!");
          }
        } else {
          throw new Error("Failed to delete company");
        }
      } catch (error) {
        console.error("Error deleting company:", error);
        alert("Error deleting company. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCompany(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Companies
        </h1>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Company
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {editingCompany ? "Edit Company" : "Add New Company"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              All Companies
            </h2>
          </div>

          {companies.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {companies.map((company, i) => (
                <div
                  key={i}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <h3 className="text-xs font-medium text-gray-900">
                          {company.companyName}
                        </h3>
                        <p className="text-xs text-gray-600">{company.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-900">{company.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-900">
                          {company.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-900">
                          {company.city || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-900">
                          {company.state || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(company)}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                No companies found
              </h3>
              <p className="mt-2 text-xs text-gray-500">
                Get started by creating your first company.
              </p>
              <button
                onClick={handleAddNew}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add New Company
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyData;
