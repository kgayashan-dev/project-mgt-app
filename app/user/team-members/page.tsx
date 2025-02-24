"use client";
import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const TeamMembers = () => {
  // const [showInfoCard, setShowInfoCard] = useState(true);
  const [showDeletedMembers, setShowDeletedMembers] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // State for modal visibility
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    telephone: "",
    email: "",
    address: "",
    nic: "",
    role: "",
    title: "",
  });

  const teamMembers = [
    {
      id: 1,
      initials: "GM",
      name: "Gayashan Madh...",
      role: "Owner",
      onPayroll: false,
    },
    {
      id: 2,
      initials: "OM",
      name: "Orson Madhura...",
      role: "Not Invited",
      onPayroll: false,
    },
  ];

  const deletedMembers = [
    {
      id: 3,
      initials: "JD",
      name: "John Doe",
      role: "Developer",
      deletedDate: "2024-01-01",
    },
    {
      id: 4,
      initials: "AS",
      name: "Alice Smith",
      role: "Designer",
      deletedDate: "2024-01-02",
    },
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.telephone ||
      !formData.email ||
      !formData.address ||
      !formData.nic ||
      !formData.role ||
      !formData.title
    ) {
      alert("Please fill all fields.");
      return;
    }

    // Add new team member
    const newMember = {
      id: teamMembers.length + 1,
      initials: `${formData.firstName[0]}${formData.lastName[0]}`,
      name: `${formData.firstName} ${formData.lastName}`,
      role: "Not Invited",
      onPayroll: false,
    };
    teamMembers.push(newMember);

    // Reset form and close modal
    setFormData({
      firstName: "",
      lastName: "",
      telephone: "",
      email: "",
      address: "",
      nic: "",
      role: "",
      title: "",
    });
    setShowAddMemberModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Team Members</h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={() => setShowAddMemberModal(true)}
        >
          <Plus size={20} />
          Add Team Member
        </button>
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-navy-900">
                Add Team Member
              </h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block regular-12 font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block regular-12 font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block regular-12 font-medium text-gray-700">
                  Telephone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block regular-12 font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block regular-12 font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block regular-12 font-medium text-gray-700">
                  NIC
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block regular-12 font-medium text-gray-700">
                  Job Role
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block regular-12 font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div>
        <h2 className="text-xl font-bold text-navy-900 mb-4">
          All Team Members
        </h2>
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-5 p-4 border-b regular-12 font-medium text-gray-500">
            <div className="col-span-1"></div>
            <div>Name</div>
            <div>Job Title</div>
            <div>Role</div>
            <div>On Payroll</div>
          </div>

          {/* Table Body */}
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-5 p-4 border-b regular-12 hover:bg-gray-50"
            >
              <div className="col-span-1">
                <input type="checkbox" className="mr-3" />
                <span className="inline-block w-8 h-8 rounded-full bg-gray-200 text-center leading-8 regular-12">
                  {member.initials}
                </span>
              </div>
              <div className="flex items-center">{member.name}</div>
              <div className="flex items-center">—</div>
              <div className="flex items-center">
                {member.role === "Not Invited" ? (
                  <span className="px-2 py-1 bg-gray-100 rounded-md regular-12">
                    {member.role}
                  </span>
                ) : (
                  member.role
                )}
              </div>
              <div className="flex items-center">
                {member.onPayroll ? "Yes" : "No"}
              </div>
            </div>
          ))}
        </div>

        {/* View Deleted Members Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowDeletedMembers(!showDeletedMembers)}
            className="border border-navy-900  regular-12 text-navy-900 px-6 py-2 rounded-md hover:bg-gray-50"
          >
            View Deleted Team Members
          </button>
        </div>

        {/* Deleted Members Table */}
        {showDeletedMembers && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-5 p-4 border-b regular-12 font-medium text-gray-500">
                <div className="col-span-1"></div>
                <div>Name</div>
                <div>Job Title</div>
                <div>Role</div>
                <div>Deleted Date</div>
              </div>

              {/* Table Body */}
              {deletedMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-5 p-4 border-b  regular-12 hover:bg-gray-50"
                >
                  <div className="col-span-1">
                    <input type="checkbox" className="mr-3" />
                    <span className="inline-block w-8 h-8 rounded-full bg-gray-200 text-center leading-8 regular-12">
                      {member.initials}
                    </span>
                  </div>
                  <div className="flex items-center">{member.name}</div>
                  <div className="flex items-center">—</div>
                  <div className="flex items-center">{member.role}</div>
                  <div className="flex items-center">{member.deletedDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
