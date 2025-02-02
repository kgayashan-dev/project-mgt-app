"use client";
import React, { useState } from "react";
import { PlusCircle, Filter, Check, X } from "lucide-react";
// import { useRouter } from "next/router";
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

const OtherIncomeForm = () => {
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
    const newEntry: IncomeEntry = {
      id: Date.now(), // Simple way to generate unique IDs
      ...formData,
    };

    setEntries((prev) => [...prev, newEntry]);
    setShowForm(false);
    // Reset form data
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
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-navy-900">All Other Income</h1>
          <button
            className="bg-green-600 p-1 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => setShowForm(true)}
            aria-label="Add new income"
          >
            <PlusCircle className="h-6 w-6 text-white" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-4 py-3 text-sm text-gray-600">
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
          className="grid grid-cols-4 gap-4 py-4 border-b border-gray-200 hover:bg-gray-50"
        >
          <div>
            <div className="text-sm font-medium text-gray-900">
              {entry.source}
            </div>
            <div className="text-sm text-gray-500">{entry.category}</div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(entry.date).toLocaleDateString()}
          </div>
          <div>
            <div className="text-sm text-gray-900">{entry.client}</div>
            <div className="text-sm text-gray-500">{entry.description}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
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
              <label className="text-sm text-gray-600">Source</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="E.g. Shopify, Etsy, Farmers' Market"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Income category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Income category</option>
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Payment method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="text-sm text-gray-600">Tax</label>
              <div className="relative">
                <span className="absolute left-3 top-2">Rs.</span>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Assign to client</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                placeholder="Assign to client"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Grand Total</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2">Rs.</span>
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">LKR</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add a description"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onClick={() => setShowForm(false)}
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
