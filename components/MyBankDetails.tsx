"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  notes: string;
}

interface BankDetailsManagerProps {
  initialData?: BankAccount[];
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BankDetailsManager: React.FC<BankDetailsManagerProps> = ({ initialData = [] }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [formData, setFormData] = useState<FormData>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    branch: "",
    notes: ""
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with server data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setBankAccounts(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createBankAccount = async (bankAccountData: Omit<BankAccount, 'id'>): Promise<string> => {
    const response = await fetch(`${API_URL}/project_pulse/BankAccount/createBankAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankAccountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create bank account');
    }

    const result = await response.json();
    return result.id;
  };

  const updateBankAccount = async (id: string, bankAccountData: Omit<BankAccount, 'id'>): Promise<void> => {
    const response = await fetch(`${API_URL}/project_pulse/BankAccount/updateBankAccount/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankAccountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update bank account');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const bankAccountData = {
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        branch: formData.branch || undefined,
        notes: formData.notes || undefined
      };

      if (editId !== null) {
        // Update existing account
        await updateBankAccount(editId, bankAccountData);
        
        // Update local state
        const updatedAccounts = bankAccounts.map(account =>
          account.id === editId ? { ...bankAccountData, id: editId } : account
        );
        setBankAccounts(updatedAccounts);
      } else {
        // Create new account
        const newId = await createBankAccount(bankAccountData);
        
        // Add to local state with the actual ID from API
        const newAccount: BankAccount = {
          ...bankAccountData,
          id: newId
        };
        setBankAccounts((prev) => [...prev, newAccount]);
      }
      
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: "",
      accountName: "",
      accountNumber: "",
      branch: "",
      notes: ""
    });
    setIsModalOpen(false);
    setEditId(null);
    setError(null);
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bankName: account.bankName || "",
      accountName: account.accountName || "",
      accountNumber: account.accountNumber || "",
      branch: account.branch || "",
      notes: account.notes || ""
    });
    setEditId(account.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // For now, just update local state
    // You can add API call for delete if you have the endpoint
    setBankAccounts((prev) => prev.filter(account => account.id !== id));
    setDeleteId(null);
  };

  // Find account for delete confirmation
  const accountToDelete = bankAccounts.find(account => account.id === deleteId);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800">My Bank Accounts</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition transform hover:scale-105 font-medium"
        >
          Add Bank Account
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {editId !== null ? "Edit Bank Account" : "Add Bank Account"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g., Commercial Bank"
                  required
                  disabled={isLoading}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                  disabled={isLoading}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234567890"
                  required
                  disabled={isLoading}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Branch"
                  disabled={isLoading}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editId !== null ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editId !== null ? "Update Account" : "Add Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Accounts Table */}
      {bankAccounts.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-100 ">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-700 border-b">
                  Bank Name
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700 border-b">
                  Account Name
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700 border-b">
                  Account Number
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700 border-b">
                  Branch
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700 border-b">
                  Notes
                </th>
                <th className="p-3 text-right text-xs font-semibold text-gray-700 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bankAccounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b hover:bg-gray-100  transition-colors duration-150"
                >
                  <td className="p-3 text-xs text-gray-800">
                    {account.bankName}
                  </td>
                  <td className="p-3 text-xs text-gray-800">
                    {account.accountName}
                  </td>
                  <td className="p-3 text-xs text-gray-800 font-mono">
                    {account.accountNumber}
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    {account.branch || "-"}
                  </td>
                  <td className="p-3 text-xs text-gray-600 max-w-xs truncate">
                    {account.notes || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(account.id)}
                        className="text-red-600 hover:text-red-800 transition-colors font-medium text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100  rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4m0 4h4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">No bank accounts found</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-medium"
          >
            Add Your First Bank Account
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Confirm Deletion
            </h2>
            <p className="mb-1 text-gray-700">
              <strong>Bank:</strong> {accountToDelete.bankName}
            </p>
            <p className="mb-1 text-gray-700">
              <strong>Account:</strong> {accountToDelete.accountName}
            </p>
            <p className="mb-4 text-gray-700">
              <strong>Number:</strong> {accountToDelete.accountNumber}
            </p>
            <p className="mb-4 text-red-600 font-medium">
              Are you sure you want to delete this bank account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetailsManager;