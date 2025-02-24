"use client";
import React, { useState } from "react";

const BankDetailsManager = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    branch: "",
    accountNumber: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updatedAccounts = [...bankAccounts];
      updatedAccounts[editIndex] = formData;
      setBankAccounts(updatedAccounts);
    } else {
      setBankAccounts((prev) => [...prev, formData]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", bank: "", branch: "", accountNumber: "" });
    setIsModalOpen(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    setFormData(bankAccounts[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    setBankAccounts((prev) => prev.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Add Bank Account Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className=" text-xl font-semibold ">My Bank Accounts</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition transform hover:scale-105"
        >
          Add Bank Account
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg transform transition-all duration-300 ease-in-out">
            <h2 className="text-xl font-semibold mb-4">
              {editIndex !== null ? "Edit Bank Account" : "Add Bank Account"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Account Name"
                required
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
                placeholder="Bank Name"
                required
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="Branch"
                required
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Account Number"
                required
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition transform hover:scale-105"
                >
                  {editIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Accounts Table */}
      {bankAccounts.length > 0 ? (
        <div className="border  overflow-hidden regular-12 ">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr className="bg-gray-200 border-b">
                <th className="p-3 text-left">Account Name</th>
                <th className="p-3 text-left">Bank</th>
                <th className="p-3 text-left">Branch</th>
                <th className="p-3 text-left">Account Number</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((account, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-10 transition duration-200"
                >
                  <td className="p-3">{account.name}</td>
                  <td className="p-3">{account.bank}</td>
                  <td className="p-3">{account.br}</td>
                  <td className="p-3">{account.accountNumber}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:text-green-700 mr-2 transition transform hover:scale-110"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteIndex(index)}
                      className="text-red-500 hover:text-red-700 transition transform hover:scale-110"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-10 rounded shadow">
          <p className="text-gray-500">No bank accounts added yet.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg transform transition-all duration-300 ease-in-out">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete this bank account?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteIndex(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteIndex)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition transform hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetailsManager;
