"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  PencilLine,
  
} from "lucide-react";
import Link from "next/link";
import ProjectServices from "./ProjectServices";
import ProjectExpences from "./ProjectExpences";
import ProjectQuotations from "./ProjectQuotations";

type Team = {
  id: string;
  name: string;
};
type Row = {
  id: string;
  description: number;
  hourse: string;
  rate: string;
};

interface projectArrayData {
  id: string;
  projectName: string;
  clientId: string;
  clientName: string;
  projectDescription: string;
  projectStartDate: string;
  projectEndDate: string;
  projectFlatRate: number;
  projectTotalHours: number; // times/ hourse
  projectStatus: string;
  projectServices: Row[];
  projectTeamMember: Team[];
}

interface ViewprojectArrayProps {
  projectArray: projectArrayData;
}
const ProjectDetails = ({ projectArray }: ViewprojectArrayProps) => {
  const [activeTab, setActiveTab] = useState<
    "quotations" | "services" | "expenses"
  >("quotations");

  const tabs = [
    { id: "quotations", label: "Quotations" },
    { id: "expenses", label: "Expenses" },
    { id: "services", label: "Services" },
  ] as const;

  const initials =
    projectArray.projectName.charAt(0) +
    "" +
    projectArray.projectName.split(" ")[1].charAt(0);
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          href="/user/projects"
          className="flex items-center text-blue-600 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Projects</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">
            {projectArray.projectName}
          </h1>
          <div className="text-gray-400">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-10 rounded-lg">
            Delete
            <ChevronDown className="w-5 h-5 ml-2" />
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <PencilLine className="w-5 h-5 mr-2" />
            Edit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Vendor Info Card */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg p-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-800 text-sm font-semibold">
                  {initials}
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {projectArray.projectName}
                  </h2>
                  <p className="text-gray-500 regular-14">
                    {projectArray.clientName}
                  </p>
                  <p className="text-gray-500 regular-12">
                    {projectArray.projectDescription}
                  </p>

                  <div className="divide-y-2 border-[1px] my-4"></div>
                  <div className="mt-4 space-y-3 flex justify-between items-center regular-12">
                    <div className=" flex flex-col text-gray-500">
                      <span>Flat rate</span>
                      <span>{projectArray.projectFlatRate}</span>
                    </div>
                    <div className=" flex flex-col text-gray-500">
                      <span>End date</span>
                      <span>{projectArray.projectEndDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Logged Card */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold">Hours Logged</h2>
                  {/* <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <span>LKR</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <span></span>
                    <ChevronDown className="w-4 h-4" />
                  </button> */}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {/* Rs. {formatCurrency(vendorArray.totalOutstanding)} */}
                </div>
              </div>

              <div className="relative pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  {/* <span>0</span>
                  <span>2k</span>
                  <span>4k</span>
                  <span>6k</span>
                  <span>8k</span>
                  <span>10k</span> */}
                </div>
                <div className="h-8 bg-gray-100 rounded-md flex items-center px-4"></div>
              </div>
              <div className="py-4 regular-14 text-gray-30 flex justify-between item-center ">
                <div className="flex flex-col justify-center items-center">
                  <span>3h 00m</span>
                  <span>remaining in budget</span>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <span>0h 00m</span>
                  <span>unbilled time</span>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <span>Rs. 0</span>
                  <span>unbilled expenses</span>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <span>{} days</span>
                  <span>overdue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  Section */}
        <div className="mt-8">
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-2" aria-label="Project sections">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                px-6 py-3 text-sm font-medium rounded-t-lg
                ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 border border-gray-200 border-b-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="">
              {activeTab === "quotations" && (
                <div>
                  <ProjectQuotations />
                </div>
              )}
              {activeTab === "expenses" && (
                <div>
                  <ProjectExpences />
                </div>
              )}
              {activeTab === "services" && (
                <div>
                  <ProjectServices />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
