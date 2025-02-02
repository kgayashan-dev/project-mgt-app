"use client";
import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  X,
  ChevronRight,
  Beaker,
  Clock,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Service = {
  description: string;
};
type ProjectType = "flat-rate" | "hourly";

interface NewQuotationProps {
  initialData: object; // Adjust the type according to your data structure
}
const NewProject: React.FC<NewQuotationProps> = ({ initialData }) => {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null); // Client or null

  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ProjectType>("flat-rate");

  const projectTypes = [
    { id: "flat-rate", label: "Flat Rate Project" },
    { id: "hourly", label: "Hourly Project" },
  ];

  const handleSelect = (type: ProjectType) => {
    setSelectedType(type);
    setIsOpen(false);
  };

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [flatRate, setFlatRate] = useState("0.00");
  const [services, setServices] = useState<Service[]>([{ description: "" }]);

  // Handle input change for services
  const handleServiceChange = (index: number, value: string) => {
    const updatedServices = [...services];
    updatedServices[index].description = value;
    setServices(updatedServices);
  };

  // Add new service row
  const addService = () => {
    setServices([...services, { description: "" }]);
  };

  // Delete service row
  const deleteService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const redirect = () => {
    router.back();
  };
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-2
    0 to-white p-8"
    >
     
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl font-bold text-navy-900 mb-6">New Project</h1>
        <div className=" text-navy-900 mb-6 flex justify-center space-x-2">
          <button
            onClick={redirect}
            className="text-gray-700 px-6 py-2.5 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-10 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Cancel
          </button>

          <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium">
            Save
          </button>
        </div>
      </div>
      {/* Main Card */}
      <div className="flex justify-normal space-x-2 regular-14">
        <div className="bg-white rounded-lg shadow-md max-w-4xl overflow-hidden">
          {/* Content Container */}
          <div className="p-8">
            {/* Team Members Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Team Members
              </h2>
              <div className="flex justify-between items-between w-full item-center">
                <div className="flex justify-start items-center space-x-1">
                  <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium">
                    GM
                  </div>
                </div>

                <div className="relative">
                  {!client && (
                    <select
                      value={client?.name || ""}
                      onChange={(e) => {
                        const selectedClient = initialData.find(
                          (clientOption) => clientOption.name === e.target.value
                        );
                        setClient(selectedClient || null); // Set the selected client
                      }}
                      className={`text-md rounded regular-14 p-2 focus:ring-2 focus:ring-blue-500 border-[0.5px]`}
                    >
                      <option value="">Select a Client</option>
                      {initialData.map((clientOption) => (
                        <option
                          key={clientOption.name}
                          value={clientOption.name}
                        >
                          {clientOption.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Show client details if a client is selected */}
                  {client && (
                    <div className="">
                      <div className="flex flex-col text-blue-700   regular-14">
                        <span className="font-semibold">{client.name}</span>
                        <div className="flex flex-col justify-normal -gap-1">
                          <span>{client.initials}</span>
                          <span>{client.businessType}</span>
                          <span>{client.location}</span>
                        </div>
                      </div>
                      <button
                        className="self-start text-xs text-white hover:text-red-500"
                        onClick={() => setClient(null)} // Reset the client selection
                      >
                        Remove client
                      </button>
                    </div>
                  )}
                  {!client && (
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ChevronDown />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Name & Description */}
            <input
              type="text"
              placeholder="Enter a project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-3xl font-medium text-gray-700 w-full mb-4 p-0 border-none focus:ring-0 placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-gray-500 w-full mb-8 p-0 border-none focus:ring-0"
            />

            <div className="mb-8  rounded-lg bg-white">
              <table className="w-[90vh] table-fixed ">
                <thead>
                  <tr className="">
                    <th className="  bg-transparent px-3 py-2 text-left text-sm font-medium text-gray-500">
                      End Date
                    </th>
                    <th className=" bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500">
                      {selectedType === "flat-rate" ? "Flat Rate" : ""}
                    </th>
                    <th className=" bg-transparent px-3 py-3 text-left text-sm font-medium text-gray-500">
                      Total Hours
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        placeholder="MM/DD/YYYY"
                        className=" rounded-md border-0 bg-transparent px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {selectedType === "flat-rate" && (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            Rs
                          </span>
                          <input
                            type="text"
                            value={flatRate}
                            onChange={(e) =>
                              setFlatRate(
                                e.target.value.replace(/[^0-9.]/g, "")
                              )
                            }
                            className="max-w-2xl rounded-md border-0 pl-8 pr-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value="0h 00m"
                        readOnly
                        className=" rounded-md border-0 bg-gray-10 px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-200"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Services Section */}
            <div className="my-8">
              <h2 className="text-gray-500 mb-4">SERVICES</h2>
              <table className="w-full mb-4">
                <tbody>
                  {services.map((service, index) => (
                    <tr
                      key={index}
                      className="border-b group hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-2">
                        <input
                          type="text"
                          value={service.description}
                          placeholder="Enter service description..."
                          onChange={(e) =>
                            handleServiceChange(index, e.target.value)
                          }
                          className="w-full text-base p-2 rounded focus:ring-2 focus:ring-blue-500 border-none"
                        />
                      </td>
                      <td className="p-2 w-8">
                        <button
                          onClick={() => deleteService(index)}
                          className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                        >
                          <X />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="relative group w-full">
                <button
                  onClick={addService}
                  className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add a Service
                </button>
              </div>
            </div>

            {/* Assign Client Button */}
            <div className="relative">
              <div className="absolute -bottom-8 right-4 text-blue-500 text-sm">
                Choose who you&apos;re billing the project to
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-lg shadow-md w-80 h-72 p-6">
          <h1 className="text-navy-900 text-2xl font-bold mb-2">Settings</h1>
          <p className="text-gray-500 mb-6">For This Project</p>

          {/* Project Type Setting */}
          <div className="relative">
            <div
              className="mb-8 group cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    <Beaker size={20} />
                  </div>
                  <div>
                    <h2 className="text-navy-900 font-medium mb-1">
                      Project Type
                    </h2>
                    <p className="text-blue-600">
                      {
                        projectTypes.find((type) => type.id === selectedType)
                          ?.label
                      }
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {projectTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(type.id as ProjectType)}
                  >
                    <span
                      className={`${
                        selectedType === type.id
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {type.label}
                    </span>
                    {selectedType === type.id && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* You can uncomment and add back the Estimate Type and Billable Rates sections here */}
        </div>
      </div>
    </div>
  );
};

export default NewProject;
