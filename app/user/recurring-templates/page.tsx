"use client";
import React, { useState } from "react";
import { Search, Calendar } from "lucide-react";
import Link from "next/link";

const RecurringTemplates = () => {
  const [showFilters, setShowFilters] = useState(false);

 
  

  return (
    <div className=" max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-navy-900">
          All Recurring Templates
        </h1>
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
        <div className="absolute right-0 top-[8.5vh] bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-90 z-10">
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

      <div className="grid grid-cols-4 gap-4 border-b border-gray-200 pb-4 text-sm text-gray-500">
        <div>Client / Recurring Template Number</div>
        <div>Last Issued</div>
        <div>Frequency / Duration</div>
        <div>Amount / Status</div>
      </div>

      <div className="py-6 text-center text-gray-500 italic">
        No recurring templates to show.
      </div>

      <div className="mt-8 text-center">
        <Link href={"/user/recurring-templates/archived"}>
          <span className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
            View Archived Recurring Templates
          </span>
        </Link>
        <div className="mt-2 text-gray-500">
          or <button className="text-blue-600 hover:underline">deleted</button>
        </div>
      </div>
    </div>
  );
};

export default RecurringTemplates;
