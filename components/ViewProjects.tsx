"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  projectName: string;
  clientId: string;
  projectDescription: string;
  projectStartDate: string;
  projectEndDate: string;
  projectFlatRate: number; // Changed to number since flatRate is a number in the data
  projectTotalHours: number; // Changed to number since totalHours is a number
  projectStatus: string;
  projectServices: {
    id: string;
    description: string;
    hours: number;
    rate: number;
  }[]; // Changed to array of objects
  projectTeamMember: string[]; // Changed to array of strings
}

interface AllInvoiceDataProps {
  projectArray: Project[]; // Accept projectArray as a prop
}

const ProjectsPage = ({ projectArray }: AllInvoiceDataProps) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-navy-900">Projects</h1>
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button
              onClick={() => router.push("/user/projects/new")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              Create New...
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-8 ">
        <div className="flex justify-start items-center">
          <Link
            href={"/user/projects"}
            className="text-2xl font-bold text-navy-900 "
          >
            All Projects
          </Link>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-full hover:bg-gray-10"
          >
            <Calendar className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="absolute right-0 top-[25vh] bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-90 z-10">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <form action="">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="date"
                  placeholder="Start"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  placeholder="End"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-start items-center gap-4 py-2 hover:cursor-pointer">
              <label className="flex items-center gap-2 text-lg">
                <input type="radio" name="invoiceFilter" />
                <span>Last invoice</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="invoiceFilter" className="text-lg" />
                <span>Issued date</span>
              </label>
            </div>

            <div className="flex flex-row justify-center items-center gap-2">
              <button
                type="reset"
                className="w-full border-2 border-green-600 text-black py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Clear
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        {/* Project Table */}
        <table className="w-full border border-gray-200 rounded-lg regular-12 overflow-hidden text-left">
          <thead className="bg-white text-sm text-gray-500 uppercase">
            <tr>
              <th className="py-4 px-6">Project Name / Client</th>
              <th className="py-4 px-6">Hours Logged</th>
              <th className="py-4 px-6">
                Unbilled Hours / Amount / Last Invoice
              </th>
              <th className="py-4 px-6">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {projectArray.map((project, index) => (
              <tr
                onClick={() => router.push(`/user/projects/${project.id}`)}
                key={index}
                className="text-gray-700 hover:bg-gray-10 hover:cursor-pointer"
              >
                <td className="py-4 px-6">
                  <strong>{project.projectName}</strong> <br />
                  <span className="text-sm text-gray-500">
                    {project.clientId} {/* Assuming client ID is used here */}
                  </span>
                </td>
                <td className="py-4 px-6">{project.projectTotalHours} hrs</td>
                <td className="py-4 px-6">
                  {/* Calculating unbilled amount */}
                  {project.projectTotalHours - project.projectFlatRate} hrs /
                  Rs. {project.projectFlatRate} /{" "}
                  {/* Add last invoice if applicable */}
                </td>
                <td className="py-4 px-6">{project.projectEndDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsPage;
