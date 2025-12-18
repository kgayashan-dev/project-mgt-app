import React from "react";
import { Filter, ChevronRight, Check } from "lucide-react";
// import { useRouter } from "next/navigation";

const DeleteIncomePage = () => {
  // const router = useRouter();

  // const back = () => {
  //   router.back();
  // };
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex justify-start items-center">
            <button
              // onClick={back}
              className="text-2xl font-bold text-navy-900 text-blue-500 cur"
            >
              All Other Income
            </button>
          </div>
          <span className="text-lg ">
            <ChevronRight />
          </span>
          <h1 className="text-2xl font-bold text-navy-900">Deleted</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-10">
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
    </div>
  );
};

export default DeleteIncomePage;
