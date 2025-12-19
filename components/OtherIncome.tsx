"use client";
import React, { useState } from "react";
import { PlusCircle, Filter, Check, X } from "lucide-react";

interface IncomeEntry {
  id: number;
  source: string;
  date: string;
  tax: number;
  total: number;
  currency: string;
  category: string;
  paymentMethod: string;
  client: string;
  description: string;
}

interface Client {
  name: string;
  // Add other client properties if needed
}

interface ClientsProps {
  clientArray: Client[]; // Array of Client objects
}

const OtherIncomeForm: React.FC<ClientsProps> = ({ clientArray }) => {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<IncomeEntry, "id">>({
    source: "",
    date: "2025-01-08",
    tax: 0,
    total: 0,
    currency: "USD",
    category: "",
    paymentMethod: "",
    client: "",
    description: "",
  });
  const [editId, setEditId] = useState<number | null>(null); // Track the ID of the entry being edited

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (editId !== null) {
      // Update existing entry
      const updatedEntries = entries.map((entry) =>
        entry.id === editId ? { id: editId, ...formData } : entry
      );
      setEntries(updatedEntries);
    } else {
      // Add new entry
      const newEntry: IncomeEntry = {
        id: Date.now(), // Simple way to generate unique IDs
        ...formData,
      };
      setEntries((prev) => [...prev, newEntry]);
    }

    // Reset form and close
    setFormData({
      source: "",
      date: "2025-01-08",
      tax: 0,
      total: 0,
      currency: "USD",
      category: "",
      paymentMethod: "",
      client: "",
      description: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (entry: IncomeEntry) => {
    setFormData({
      source: entry.source,
      date: entry.date,
      tax: entry.tax,
      total: entry.total,
      currency: entry.currency,
      category: entry.category,
      paymentMethod: entry.paymentMethod,
      client: entry.client,
      description: entry.description,
    });
    setEditId(entry.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex justify-start items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">Other Income</h2>
          <button
            className="bg-green-600 p-1 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => {
              setShowForm(true);
              setEditId(null); // Reset edit ID when adding a new entry
            }}
            aria-label="Add new income"
          >
            <PlusCircle className="h-6 w-6 text-white" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 ">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-4 py-3 regular-12 text-gray-600 uppercase">
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

      {/* Entries Table */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-4 gap-4 p-4 border-b bg-white border-gray-200 hover:bg-gray-10 cursor-pointer"
          onClick={() => handleEdit(entry)} // Open form with entry data on row click
        >
          <div>
            <div className="regular-12 font-medium text-gray-900">
              {entry.source}
            </div>
            <div className="regular-12 text-gray-500">{entry.category}</div>
          </div>
          <div className="regular-12 text-gray-500">
            {new Date(entry.date).toLocaleDateString()}
          </div>
          <div>
            <div className="regular-12 text-gray-900">{entry.client}</div>
            <div className="regular-12 text-gray-500">{entry.description}</div>
          </div>
          <div className="text-right">
            <div className="regular-12 font-medium text-gray-900">
              {entry.currency} {entry.total}
            </div>
          </div>
        </div>
      ))}

      {/* Entry Form */}
      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-gray-200 animate-fadeIn">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">Source</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="E.g. Shopify, Etsy, Farmers' Market"
                className="w-full regular-12 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">
                Income category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 regular-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Income category</option>
                <option value="Inperson Sales">In Person Sales</option>
                <option value="Online Sales">Online Sales</option>
                <option value="Rental Income">Rental Income</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 regular-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">Payment method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full regular-12 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Payment method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">Tax</label>
              <div className="relative">
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full regular-12 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">
                Assign to client
              </label>
              <select
                name="client" // Add name attribute
                value={formData.client}
                onChange={handleInputChange}
                className="w-full regular-12 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a Client</option>
                {clientArray.map((clientOption) => (
                  <option key={clientOption.name} value={clientOption.name}>
                    {clientOption.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">Grand Total</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    className="w-full regular-12 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-24 px-3 py-2 border regular-12 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LKR">LKR</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="regular-12 text-gray-600">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add a description"
                className="w-full regular-12 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-4 flex justify-end gap-2">
            <button
              className="p-2 rounded-lg bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
            >
              <Check className="h-6 w-6 text-white" />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              onClick={() => {
                setShowForm(false);
                setEditId(null); // Reset edit ID when closing the form
              }}
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherIncomeForm;