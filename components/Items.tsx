"use client";
import React, { useState } from "react";
// import { useRouter } from "next/navigation";

const ItemsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    category: "",
    qty: 0,
    rate: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  const items = [
    {
      id: "1",
      name: "Laptop",
      description: "15-inch gaming laptop with high performance.",
      category: "pcs",
      price: 200,
      qty: 10,
      rate: 1200,
      total: 12000,
    },
    {
      id: "2",
      name: "Smartphone",
      description: "Latest model smartphone with advanced features.",
      category: "Mobile devices",
      qty: 25,
      price: 200,
      rate: 800,
      total: 20000,
    },
    // ... other items
  ];

  // Filter items based on search term
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrEditItem = () => {
    if (isEditing) {
      // Logic to update the existing item
      console.log("Updating Item:", newItem);
      // Update your items array here (you may want to manage state)
    } else {
      // Logic to add a new item
      console.log("Adding New Item:", newItem);
      // Add your new item to the items array here (you may want to manage state)
    }

    setIsModalOpen(false); // Close modal after adding or editing
    resetNewItem(); // Reset form fields
  };

  const resetNewItem = () => {
    setNewItem({
      id: "",
      name: "",
      description: "",
      category: "",
      price: 0,
      qty: 0,
      rate: 0,
    });
    setIsEditing(false);
  };

  const editItem = (item) => {
    setNewItem(item); // Set the selected item to the newItem state for editing
    setIsEditing(true); // Set editing mode
    setIsModalOpen(true); // Open the modal
  };

  return (
    <div className="p-6 min-h-screen my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Items</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              resetNewItem(); // Reset fields for a new item
              setIsModalOpen(true); // Open modal for adding a new item
            }}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            New Item
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex justify-end items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Advanced Search Button */}
        <button className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
          Advanced Search
          <svg
            className="w-4 h-4 ml-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Table/Item List */}
      <div className="space-y-4 text-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 items-center px-4 py-2 bg-gray-100 border-b">
          <span className="font-medium">ID</span>
          <span className="font-medium">Item Name</span>
          <span className="font-medium">Item Price</span>
          <span className="font-medium">Description</span>
          <span className="font-medium text-right">Total</span>
        </div>

        {/* Item Rows */}
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => editItem(item)} // Call edit function on click
            className="grid grid-cols-5 items-center px-4 py-1 hover:bg-gray-200 border-b hover:cursor-pointer"
          >
            <div>{item.id}</div>
            <div>{item.name}</div>
            <div>{item.price}</div>
            <div>{item.description}</div>
            <div className="text-right">Rs. {item.total.toLocaleString()}</div>
          </div>
        ))}

        {/* No results message */}
        {filteredItems.length === 0 && (
          <div className="text-center p-4 text-gray-500">No items found.</div>
        )}
      </div>

      {/* Modal for New Item or Editing Existing Item */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-sm font-semibold mb-4">
              {isEditing ? "Edit Item" : "Add New Item"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddOrEditItem();
              }}
            >
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="name"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="description"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleNewItemChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
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
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="price"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newItem.price}
                  onChange={handleNewItemChange}
                  required
                  min={0}
                  step=".01"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
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
                  required
                  min={0}
                  step=".01"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>

              {/* Buttons for Submit and Cancel */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetNewItem(); // Reset fields when closing modal without saving changes.
                  }}
                  className="mr-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  {isEditing ? "Update Item" : "Add Item"}
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
