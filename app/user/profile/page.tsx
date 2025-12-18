"use client";
import { useState } from "react";
import Image from "next/image";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  timeZone: string;
  timeFormat: string;
  language: string;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "Gayashan",
    lastName: "Madhuranga",
    email: "mgayashan83@gmail.com",
    timeZone: "(UTC+5:30) Asia - Colombo",
    timeFormat: "12 hour",
    language: "English (United States)",
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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div className="flex">
        <h1 className="text-3xl font-bold text-navy-900">Account Profile</h1>
      </div>

      {/* Profile Photo Section */}
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
          <span className="text-2xl text-gray-600">GM</span>
        </div>
        <button className="text-blue-500 hover:text-blue-600">
          Upload Photo
        </button>
      </div>

      <form className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-10 border border-gray-300 rounded-md"
            disabled
          />
          <button
            type="button"
            className="text-blue-500 hover:text-blue-600 text-xs mt-1"
          >
            Disconnect Google Account
          </button>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value="SSO Password"
            className="w-full px-3 py-2 bg-gray-10 border border-gray-300 rounded-md"
            disabled
          />
          <button
            type="button"
            className="text-blue-500 hover:text-blue-600 text-xs mt-1"
          >
            Change password
          </button>
        </div>

        <h2 className="text-2xl font-bold text-navy-900 pt-4">Preferences</h2>

        {/* Time Zone */}
        <div>
          <label
            htmlFor="timeZone"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Time Zone
          </label>
          <select
            id="timeZone"
            name="timeZone"
            value={formData.timeZone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="(UTC+5:30) Asia - Colombo">
              (UTC+5:30) Asia - Colombo
            </option>
            {/* Add more timezone options */}
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label
            htmlFor="timeFormat"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Time Format
          </label>
          <select
            id="timeFormat"
            name="timeFormat"
            value={formData.timeFormat}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="12 hour">12 hour</option>
            <option value="24 hour">24 hour</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="English (United States)">
              English (United States)
            </option>
            {/* Add more language options */}
          </select>
        </div>
        <button className="px-2 bg-green-500 rounded">Save Changes</button>
      </form>
    </div>
  );
}
