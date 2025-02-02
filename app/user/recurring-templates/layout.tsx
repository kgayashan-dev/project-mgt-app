import React from "react";
export default function RecurringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 ">
      <div className="w-full  ">
        <h1 className="text-3xl font-bold mb-8 mt-6 text-start">
          Reccuring Template
        </h1>
        <div className="border-[1px] my-4"></div>
        {/* Main Content */}
        <main className=" bg-gray-100   ">
          {children}
        </main>
      </div>
    </div>
  );
}
