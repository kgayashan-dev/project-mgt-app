/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  qty: number;
  rate: number;
  total: number;
}

interface ItemsPageProps {
  itemData?: { success: boolean; data: Item[] } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ItemsPage: React.FC<ItemsPageProps> = ({ itemData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>(itemData?.data || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Item>({
    id: "",
    name: "",
    description: "",
    category: "",
    price: 0,
    qty: 0,
    rate: 0,
    total: 0,
  });

  useEffect(() => {
    if (itemData?.data) {
      setItems(itemData.data);
    }
  }, [itemData]);

  // Fetch all items - ADDED THIS MISSING FUNCTION
  const fetchItems = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/project_pulse/Item/getAllItems`);

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(
          `Failed to fetch items: ${response.status} - ${errorText.message}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      alert(
        `Error fetching items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Create new item - FIXED: pass correct data
  // Alternative more explicit version
  const createItem = async (): Promise<void> => {
    try {
      const itemData = {
        id: "",
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        price: newItem.price,
        qty: newItem.qty,
        rate: newItem.rate,
      };

      const response = await fetch(`${API_URL}/project_pulse/Item/createItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

     
      if (!response.ok) {
        
        const errorText = await response.json();
        console.log("HTTP Error:", errorText.message);
        throw new Error(
          `Failed to create item: ${response.status} - ${errorText}`
        );
      }

      // If we get here, response is OK (status 200)
      const result = await response.json();
      console.log("API Response:", result);

      // Check the actual response structure from your API
      if (result.message) {
        alert("Item created successfully!");
      } else {
        // This is an application-level error (success: false or error message)
        throw new Error(
          result.message || result.error || "Failed to create item"
        );
      }
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  };

  // Create new item

  // Delete item
  const deleteItem = async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Item/deleteItem/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete item: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        alert("Item deleted successfully!");
      } else {
        throw new Error(result.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  // Handle search
  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  // Handle new item input changes - KEPT CALCULATION for user display
  const handleNewItemChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setNewItem((prev) => {
      const updatedItem: Item = {
        ...prev,
        [name]:
          name === "price" || name === "qty" || name === "rate"
            ? parseFloat(value) || 0
            : value,
      };

      // Auto-calculate total when price, quantity, or rate changes
      // KEPT for user to see the calculation
      if (name === "price" || name === "qty" || name === "rate") {
        updatedItem.total =
          updatedItem.price * updatedItem.qty * (updatedItem.rate || 1) || 0;
      }

      return updatedItem;
    });
  };

  // Reset new item form
  const resetNewItem = (): void => {
    setNewItem({
      id: "",
      name: "",
      description: "",
      category: "",
      price: 0,
      qty: 0,
      rate: 0,
      total: 0,
    });
    setIsEditing(false);
  };

  // Edit item
  const editItem = (item: Item): void => {
    setNewItem(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Filter items based on search term
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Display items - use filteredItems for search functionality
  const displayItems = searchTerm ? filteredItems : items;

  return (
    <div className="p-6 min-h-screen my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800">Items</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              resetNewItem();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
            disabled={loading}
          >
            New Item
          </button>
        </div>
      </div>

      {/* Search Section */}
      <form
        onSubmit={handleSearch}
        className="flex justify-end items-center mb-4 gap-2 regular-14"
      >
        <input
          type="text"
          placeholder="Search by name, description, or category"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            fetchItems();
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Clear
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading items...</p>
        </div>
      )}

      {/* Table/Item List */}
      <div className="space-y-4 regular-12">
        {/* Table Header */}
        <div className="grid grid-cols-7 items-center px-4 py-2 bg-gray-100 border-b">
          <span className="font-medium">ID</span>
          <span className="font-medium">Item Name</span>
          <span className="font-medium">Category</span>
          <span className="font-medium">Price</span>
          <span className="font-medium">Qty</span>
          <span className="font-medium">Total</span>
          <span className="font-medium text-right">Actions</span>
        </div>

        {/* Item Rows */}
        {!loading &&
          displayItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-7 items-center px-4 py-1 hover:bg-gray-50 border-b"
            >
              <div className="font-mono text-sm">{item.id}</div>
              <div className="font-medium">{item.name}</div>
              <div>{item.category || "-"}</div>
              <div>${item.price?.toFixed(2)}</div>
              <div>{item.qty}</div>
              <div>${item.total?.toFixed(2)}</div>
              <div className="text-right space-x-2">
                <button
                  onClick={() => editItem(item)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

        {/* No results message */}
        {!loading && displayItems.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            {items.length === 0
              ? "No items found."
              : "No items match your search."}
          </div>
        )}
      </div>

      {/* Modal for New Item or Editing Existing Item */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={createItem}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="name"
                >
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleNewItemChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="category"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={newItem.category}
                  onChange={handleNewItemChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="price"
                  >
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={newItem.price}
                    onChange={handleNewItemChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="qty"
                  >
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="qty"
                    name="qty"
                    value={newItem.qty}
                    onChange={handleNewItemChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="rate"
                  >
                    Rate
                  </label>
                  <input
                    type="number"
                    id="rate"
                    name="rate"
                    value={newItem.rate}
                    onChange={handleNewItemChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total
                  </label>
                  <div className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md p-2">
                    ${(newItem.total || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Buttons for Submit and Cancel */}
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetNewItem();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Item"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
