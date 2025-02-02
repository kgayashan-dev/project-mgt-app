"use client";
import React from "react";
import { X, Clock, Share2, Receipt, Plus } from "lucide-react";

const CheckoutLinks = () => {
  const [showInfoCard, setShowInfoCard] = React.useState(true);

  const LoadingPlaceholder = () => (
    <div className="animate-pulse flex justify-between items-center p-4 border-b">
      <div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-navy-900">Checkout Links</h1>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          New Checkout Link
        </button>
      </div>

      {/* Info Card */}
      {showInfoCard && (
        <div className="bg-white rounded-lg border p-8 relative">
          <button
            onClick={() => setShowInfoCard(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl text-center text-blue-600 font-medium mb-12">
            Sell Anywhere and Get Paid Upfront
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-navy-900 mb-2">
                Quick Setup
              </h3>
              <p className="text-gray-600">
                Create links once and reuse for fixed priced items and services.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Share2 className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-navy-900 mb-2">
                Expand Reach
              </h3>
              <p className="text-gray-600">
                Post Checkout Links on your website, social or share by email.{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Learn more
                </a>
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Receipt className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-navy-900 mb-2">
                Automated Receipts
              </h3>
              <p className="text-gray-600">
                Customers receive proof of payment automatically after payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Links Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-navy-900">
            All Checkout Links
          </h2>
          <button className="text-gray-90 p-1 rounded-md hover:bg-green-500 bg-green-600">
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Loading State */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <LoadingPlaceholder />
          <LoadingPlaceholder />
          <LoadingPlaceholder />
          <LoadingPlaceholder />
        </div>
      </div>
    </div>
  );
};

export default CheckoutLinks;
