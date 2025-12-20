"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

interface BillImageUploadProps {
  billId: string;
  billNumber: string;
  onUploadSuccess?: (imageData: { imagePath: string; imageUrl: string }) => void;
  existingImageUrl?: string;
}

const BillImageUpload: React.FC<BillImageUploadProps> = ({
  billId,
  billNumber,
  onUploadSuccess,
  existingImageUrl,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setError(null);
      }
    },
    maxFiles: 1,
    accept: { 
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      "application/pdf": [".pdf"] 
    },
  });

  const handleUpload = async () => {
    if (!file || !billId || !billNumber) {
      setError("Please select a file and ensure bill details are available");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project_pulse/Bill/uploadBillImage/${billNumber}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      setSuccess("Image uploaded successfully!");
      if (onUploadSuccess) {
        onUploadSuccess({
          imagePath: data.imagePath,
          imageUrl: data.imageUrl,
        });
      }

      // Update preview with the new server URL
      if (data.imageUrl) {
        setPreviewUrl(data.imageUrl);
      }

    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(existingImageUrl || null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* File Preview/Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}
          ${previewUrl ? "h-auto" : "h-40"}`}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative">
              {previewUrl.endsWith(".pdf") ? (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded">
                  <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="mt-2 text-sm text-gray-600">PDF Document</span>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-48 max-w-full object-contain rounded"
                />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {file?.name || "Current Image"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              {isDragActive
                ? "Drop the file here..."
                : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPG, PNG, GIF, PDF (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !uploading && (
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            Upload Image
          </button>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Uploading...
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
          {success}
        </div>
      )}
    </div>
  );
};

export default BillImageUpload;