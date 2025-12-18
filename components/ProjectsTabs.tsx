"use client";
import React from "react";
import { Search, Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const ProjectTabs = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: "quotations",
      label: "Quotations",
      href: `/user/projects/${projectId}/quotations`,
    },
    {
      id: "expenses",
      label: "Expenses",
      href: `/user/projects/${projectId}/expenses`,
    },
    {
      id: "services",
      label: "Services",
      href: `/user/projects/${projectId}/services`,
    },
  ] as const;

  const currentTab =
    tabs.find((tab) => pathname.includes(tab.id))?.id || "quotations";

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {tabs.find((tab) => tab.id === currentTab)?.label}
          </h1>
          <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 text-xs py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2" aria-label="Project sections">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                px-6 py-3 text-xs font-medium rounded-t-lg
                ${
                  pathname.includes(tab.id)
                    ? "bg-white text-blue-600 border border-gray-200 border-b-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProjectTabs;
