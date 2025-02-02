"use client";
import React, { useState } from "react";
import { Plus, X, Clock, DollarSign } from "lucide-react";

const TeamMembers = () => {
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [showDeletedMembers, setShowDeletedMembers] = useState(false);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Team Members</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus size={20} />
          Add Team Member
        </button>
      </div>

      {/* Info Card - Only show if showInfoCard is true */}
      {showInfoCard && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 relative">
          <button
            onClick={() => setShowInfoCard(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            aria-label="Close info card"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl text-blue-500 font-semibold mb-8 text-center">
            Teams Make Collaboration Easier
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Add Team Member */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-12 bg-green-200 rounded-full" />
              </div>
              <h3 className="font-semibold mb-2">Add a Team Member</h3>
              <p className="text-gray-600 text-sm mb-2">
                Manage Team Member information for free. You can also assign
                roles to collaborate more efficiently.
              </p>
              <a href="#" className="text-blue-500 hover:text-blue-600 text-sm">
                View Roles
              </a>
            </div>

            {/* Time Tracking */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Team Time Tracking</h3>
              <p className="text-gray-600 text-sm mb-2">
                Tracking time is easy, everyone that&pos;s invited can track
                time.
              </p>
              <a href="#" className="text-blue-500 hover:text-blue-600 text-sm">
                Learn More
              </a>
            </div>

            {/* Payroll */}
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="font-semibold mb-2">Run Payroll Effortlessly</h3>
              <p className="text-gray-600 text-sm mb-2">
                Automate payroll and reporting.
              </p>
              <a href="#" className="text-blue-500 hover:text-blue-600 text-sm">
                Explore Payroll
              </a>
            </div>
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
          <div className="grid grid-cols-5 p-4 border-b text-sm font-medium text-gray-500">
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
              className="grid grid-cols-5 p-4 border-b hover:bg-gray-50"
            >
              <div className="col-span-1">
                <input type="checkbox" className="mr-3" />
                <span className="inline-block w-8 h-8 rounded-full bg-gray-200 text-center leading-8 text-sm">
                  {member.initials}
                </span>
              </div>
              <div className="flex items-center">{member.name}</div>
              <div className="flex items-center">—</div>
              <div className="flex items-center">
                {member.role === "Not Invited" ? (
                  <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
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
            className="border border-navy-900 text-navy-900 px-6 py-2 rounded-md hover:bg-gray-50"
          >
            View Deleted Team Members
          </button>
        </div>

        {/* Deleted Members Table */}
        {showDeletedMembers && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-5 p-4 border-b text-sm font-medium text-gray-500">
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
                  className="grid grid-cols-5 p-4 border-b hover:bg-gray-50"
                >
                  <div className="col-span-1">
                    <input type="checkbox" className="mr-3" />
                    <span className="inline-block w-8 h-8 rounded-full bg-gray-200 text-center leading-8 text-sm">
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
