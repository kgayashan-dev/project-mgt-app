"use client";

import React, { useState } from "react";

import {
  Info,
  //   Clock,
  //   DollarSign,
  //   Globe,
  //   FileText,
  //   ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  emailAddress: string;
  phoneNumber: string;
  businessPhone?: string;
  mobilePhone?: string;
  address?: string;
}

// interface ClientSettings {
//   sendReminders: boolean;
//   chargeLateFeeds: boolean;
//   currency: string;
//   language: string;
//   attachInvoices: boolean;
// }

// app/new-client/page.tsx

export default function NewClient() {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    emailAddress: "",
    phoneNumber: "",
  });

  // const [settings, setSettings] = useState<ClientSettings>({
  //   sendReminders: false,
  //   chargeLateFeeds: false,
  //   currency: "USD",
  //   language: "English (United States)",
  //   attachInvoices: false,
  // });

  const [showBusinessPhone, setShowBusinessPhone] = useState(false);
  const [showMobilePhone, setShowMobilePhone] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", {
      formData,
      // settings
    });
  };

  const router = useRouter();

  const handleRedirect = () => {
    router.push("/user/clients");
  };

  

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-navy-900">New Client</h1>
        <div className="flex gap-4">
          <button
            onClick={handleRedirect}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200  rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>

      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Main Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-gray-600">
            <Info size={20} />
            <p className="regular-14">
              Either First and Last Name or Company Name is required to save
              this Client.
            </p>
          </div>

          <div className="space-y-6 regular-12">
            <div>
              <label className="block regular-12 font-medium mb-2">
                Company Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4 regular-12">
              <div>
                <label className="block  font-medium mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block regular-12 font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block regular-12 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailAddress: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block regular-12 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>

            {showBusinessPhone && (
              <div>
                <label className="block regular-12 font-medium mb-2">
                  Business Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessPhone: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {!showBusinessPhone && (
              <button
                className="text-blue-500 hover:text-blue-600"
                onClick={() => setShowBusinessPhone(true)}
              >
                + Add Business Phone
              </button>
            )}

            {showMobilePhone && (
              <div>
                <label className="block regular-12 font-medium mb-2">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mobilePhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mobilePhone: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {!showMobilePhone && (
              <button
                className="text-blue-500 hover:text-blue-600"
                onClick={() => setShowMobilePhone(true)}
              >
                + Add Mobile Phone
              </button>
            )}

            {showAddress && (
              <div>
                <label className="block regular-12 font-medium mb-2">
                  Address
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {!showAddress && (
              <button
                className="text-blue-500 hover:text-blue-600"
                onClick={() => setShowAddress(true)}
              >
                + Add Address
              </button>
            )}
          </div>
        </div>

        {/* Client Settings */}
        {/* <div className="bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold p-6 border-b">
            Client Settings
          </h2>

          <div className="divide-y">
            <div className="p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-gray-400" />
                  <span className="font-medium">Send Reminders</span>
                </div>
                <div className="text-sm text-gray-500 ml-7">
                  At Customizable Intervals
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">NO</span>
                <ArrowRight className="text-gray-400" />
              </div>
            </div>

            <div className="p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-gray-400" />
                  <span className="font-medium">Charge Late Fees</span>
                </div>
                <div className="text-sm text-gray-500 ml-7">
                  Percentage or Flat-Rate Fees
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">NO</span>
                <ArrowRight className="text-gray-400" />
              </div>
            </div>

            <div className="p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-gray-400" />
                  <span className="font-medium">Currency & Language</span>
                </div>
                <div className="text-sm text-gray-500 ml-7">
                  USD, English (United States)
                </div>
              </div>
              <ArrowRight className="text-gray-400" />
            </div>

            <div className="p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-gray-400" />
                  <span className="font-medium">Invoice Attachments</span>
                </div>
                <div className="text-sm text-gray-500 ml-7">
                  Attach PDF copy to emails
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">NO</span>
                <ArrowRight className="text-gray-400" />
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
