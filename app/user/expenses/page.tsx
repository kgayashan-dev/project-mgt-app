"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Paperclip, Settings2, Printer, Car, Wrench } from "lucide-react";
import ExpenseBillCardCard from "@/components/ExpenceCard";

const ExpensePage = () => {
  const router = useRouter();
  const [selectedExpense, setSelectedExpense] = useState(null);

  const expenses = [
    {
      id: 1,
      merchant: "Hardware",
      date: "01/08/2025",
      taxAmount: 9.8,
      totalAmount: 500.0,
      assignedTo: "",
      description: "",
      submittedBy: "Nima",
      category: "Hardware",
      isDuplicate: false,
    },
    {
      id: 2,
      merchant: "No Merchant",
      date: "01/05/2025",
      taxAmount: 0,
      totalAmount: 0.0,
      assignedTo: "",
      description: "",
      submittedBy: "Gayashan Madhuranga",
      category: "Car & Truck Expenses",
      isDuplicate: true,
    },
    {
      id: 3,
      merchant: "Office Supplies",
      date: "01/03/2025",
      taxAmount: 5.5,
      totalAmount: 125.5,
      assignedTo: "",
      description: "",
      submittedBy: "Gayashan Madhuranga",
      category: "Office",
      isDuplicate: false,
    },
  ];

  const handleNewExpense = () => {
    router.push("/user/expenses/new");
  };

  const ExpenseListItem = ({ expense }) => {
    const isExpanded = selectedExpense === expense.id;

    const open = () => {
      alert("opempt to expand");
    };

    return (
      <div className="border-b border-gray-200 regular-12">
        {isExpanded ? (
          <div className="p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Add merchant"
                  className="w-full p-2 border rounded-md"
                  defaultValue={expense.merchant}
                />
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Category"
                    className="w-full p-2 border rounded-md"
                    defaultValue={expense.category}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {expense.submittedBy}
                </div>
              </div>
              <div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      defaultValue={expense.date}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      placeholder="Tax Amount"
                      defaultValue={expense.taxAmount}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      placeholder="Grand Total"
                      defaultValue={expense.totalAmount}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Assign to client/project"
                    className="w-full p-2 border rounded-md"
                    defaultValue={expense.assignedTo}
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Add description"
                    className="w-full p-2 border rounded-md"
                    defaultValue={expense.description}
                  />
                </div>

                <div className="flex justify-between mt-2">
                  <button
                    onClick={open}
                    className="text-blue-600  flex items-center gap-1"
                  >
                    <Paperclip size={16} />
                    attach receipt
                  </button>
                  <button className="text-blue-600 flex items-center gap-1">
                    <Settings2 size={16} />
                    advanced expense settings
                  </button>
                </div>
                <div className="flex justify-end items-end py-2">
                  <div>
                    <button className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-between p-4 hover:bg-gray-10 cursor-pointer"
            onClick={() => setSelectedExpense(expense.id)}
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <div className="font-medium">
                  {expense.merchant || "No Merchant"}
                </div>
                <div className="text-xs text-gray-500">{expense.category}</div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-gray-600">{expense.date}</div>
              <div className="text-right">
                <div className="font-medium">
                  Rs.{expense.totalAmount.toFixed(2)} LKR
                </div>
                {expense.isDuplicate && (
                  <div className="text-xs text-blue-600">
                    Potential Duplicate
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8 mt-6">
        <h1 className="text-lg font-bold">Expenses</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
            More Actions
          </button>
          <button
            onClick={handleNewExpense}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            New Expense
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">All Expenses</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search expenses..."
              className="flex-1 max-w-2xl px-4 py-2 border regular-12 rounded-lg"
            />
            <button className="flex items-center px-4 py-2 regular-12 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
              Advanced Search
              <svg
                className="w-4 h-4 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {expenses.map((expense) => (
            <ExpenseListItem key={expense.id} expense={expense} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
