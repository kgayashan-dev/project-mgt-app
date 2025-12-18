"use client";
import React, { useState } from "react";
import { Filter, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const ArchivedIncome = () => {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const back = () => {
    router.back();
  };
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex justify-start items-center">
            <button
              onClick={back}
              className="text-2xl font-bold text-navy-900 text-blue-500 cur"
            >
              All Other Income
            </button>
          </div>
          <span className="text-lg ">
            <ChevronRight />
          </span>
          <h1 className="text-2xl font-bold text-navy-900">Archived</h1>
        </div>
        <button
          onClick={toggleFilter}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-10"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-4 py-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span>Source / Category</span>
        </div>
        <div>Payment Date</div>
        <div>Client / Description</div>
        <div className="text-right">Amount</div>
      </div>

      {isFilterOpen && (
        <div className="absolute right-6 top-[38vh] bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-90 z-10">
          <h2 className="text-xs font-semibold mb-4">Filters</h2>

          <form action="">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                Start
                <input
                  type="date"
                  placeholder="Start"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                End
                <input
                  type="date"
                  placeholder="End"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-start items-center gap-4 py-2 hover:cursor-pointer">
              <select className="w-full p-2">
                <option value="">Category</option>
              </select>
            </div>

            <div className="flex flex-row justify-center items-center gap-2 text-xs">
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
    </div>
  );
};

export default ArchivedIncome;
