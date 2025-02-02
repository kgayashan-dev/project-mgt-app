"use client";
import React, { useState, useEffect } from "react";
import { FaImage, FaFilePdf } from "react-icons/fa";

interface AttachmentInvoiceProps {
  invoiceId: string;
  invoiceDate: string;
}

const FileAttachmentInvoice: React.FC<AttachmentInvoiceProps> = ({
  invoiceId,
  invoiceDate,
}) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const renamedFiles = files.map((file) => {
        const newFileName = `${invoiceId}_${invoiceDate}_${file.name}`;
        return new File([file], newFileName, { type: file.type });
      });
      setAttachments((prev) => [...prev, ...renamedFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      attachments.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [attachments]);

  return (
    <div className="h-[20vh] max-w-3xl rounded-md mt-2">
      <div className="m-2 font-semibold">
        Attachments for Invoice {invoiceId}
      </div>
      <div className="border h-[15vh] max-w-3xl border-dashed rounded-lg shadow-sm p-4">
        <div className="mb-2">
          <label className="cursor-pointer bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-200">
            Upload Files
            <input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex justify-between items-center">
              <span
                onClick={() => handleFileClick(file)}
                className="flex items-center cursor-pointer text-blue-600 hover:underline"
              >
                {file.type.startsWith("image/") ? (
                  <FaImage className="text-blue-600" />
                ) : file.type === "application/pdf" ? (
                  <FaFilePdf className="text-blue-600" />
                ) : (
                  <span className="text-red-500">Unsupported</span>
                )}
                <span className="ml-2">
                  {file.name.length > 30
                    ? `${file.name.substring(0, 30)}...`
                    : file.name}
                </span>
              </span>
              <button
                onClick={() => handleRemoveAttachment(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Modal for Viewing Attachments */}
        {selectedFile && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg">
              <button
                onClick={handleCloseModal}
                className="text-red-500 mb-4 float-right"
              >
                Close
              </button>
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  className="w-full h-auto"
                />
              ) : selectedFile.type === "application/pdf" ? (
                <iframe
                  src={URL.createObjectURL(selectedFile)}
                  title={selectedFile.name}
                  width="100%"
                  height="400px"
                />
              ) : (
                <p>Unsupported file type</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileAttachmentInvoice;
