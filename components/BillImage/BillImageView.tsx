"use client";
import React, { useState, useEffect } from "react";

interface BillImageViewProps {
  billId: string;
  billNumber: string;
  imagePath?: string;
  size?: "small" | "medium" | "large" | "full";
  showControls?: boolean;
}

const BillImageView: React.FC<BillImageViewProps> = ({
  billId,
  billNumber,
  imagePath,
  size = "medium",
  showControls = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    small: "max-w-xs max-h-48",
    medium: "max-w-md max-h-64",
    large: "max-w-lg max-h-96",
    full: "max-w-full max-h-screen",
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!billId) {
        setError("No bill ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try multiple sources in order:
        // 1. Direct API endpoint (always works if image exists)
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/project_pulse/Bill/getBillImage/${billId}`;
        
        // 2. If we have imagePath, try direct URL
        const directUrl = imagePath 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${imagePath}`
          : null;

        // First try the API endpoint
        setImageUrl(apiUrl);

      } catch (err) {
        console.error("Error loading image:", err);
        setError("Failed to load image");
        setImageUrl("/placeholder.jpg");
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [billId, imagePath]);

  const downloadImage = () => {
    if (!imageUrl || imageUrl.includes("placeholder")) return;
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${billNumber || "bill"}_image.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    if (!imageUrl || imageUrl.includes("placeholder")) return;
    window.open(imageUrl, "_blank");
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Image Display */}
      <div className={`${sizeClasses[size]} relative group`}>
        <img
          src={imageUrl}
          alt={`Bill ${billNumber}`}
          className="w-full h-full object-contain rounded-lg shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setShowModal(true)}
          onError={(e) => {
            console.error("Image failed to load:", imageUrl);
            e.currentTarget.src = "/placeholder.jpg";
            e.currentTarget.alt = "Image not available";
            setError("Image failed to load");
          }}
        />

        {/* Overlay Controls */}
        {showControls && !error && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openInNewTab();
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Open in new tab"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage();
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Download image"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Debug Info (optional) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-2 text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-1 p-2 bg-gray-50 rounded space-y-1">
            <p>Bill ID: {billId}</p>
            <p>Bill Number: {billNumber}</p>
            <p>Image Path: {imagePath || "None"}</p>
            <p>Image URL: {imageUrl}</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_BASE_URL}/project_pulse/Bill/getBillImage/{billId}</p>
          </div>
        </details>
      )}

      {/* Modal for full view */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl max-h-screen">
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageUrl}
              alt={`Bill ${billNumber}`}
              className="max-w-full max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BillImageView;