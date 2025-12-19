/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { formatCurrencyOrNA } from "@/utils/converts";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import SearchableSelect from "./SearchableSelect";

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

interface Category {
  categoryId: string;
  catDescription: string;
}

interface ItemsPageProps {
  itemData?: { success: boolean; data: Item[] } | null;
  categoryData?: { success: boolean; data: Category[] } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ItemsPage: React.FC<ItemsPageProps> = ({ itemData, categoryData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Fetch items function
  const fetchItems = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/project_pulse/Item/getAllItems`);

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

      const result = await response.json();
      
      // Your API returns the array directly, not wrapped in success/data
      if (Array.isArray(result)) {
        setItems(result);
      } else if (result.success && Array.isArray(result.data)) {
        setItems(result.data);
      } else {
        console.error("Unexpected  format:", result);
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      alert(
        `Error fetching items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories function
  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Category/getAllCategories`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle both response formats
      if (Array.isArray(result)) {
        setCategories(result);
      } else if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        console.error("Unexpected categories  format:", result);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, []);

  // Sync with props and fetch data if needed
  useEffect(() => {
    // Use initial props if available, otherwise fetch from API
    if (itemData?.data && Array.isArray(itemData.data)) {
      setItems(itemData.data);
    } else {
      fetchItems();
    }

    if (categoryData?.data && Array.isArray(categoryData.data)) {
      setCategories(categoryData.data);
    } else {
      fetchCategories();
    }
  }, [itemData, categoryData, fetchItems, fetchCategories]);

  // Prepare category options for SearchableSelect
  const categoryOptions = categories.map((cat) => ({
    value: cat.categoryId,
    label: cat.catDescription,
  }));

  // Handle category selection
  const handleCategoryChange = (selectedValue: string) => {
    setNewItem((prev) => ({
      ...prev,
      category: selectedValue,
    }));
  };

  // Create or update item
  const handleItemSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      // Validate required fields
      if (!newItem.name.trim() || newItem.price <= 0 || newItem.qty <= 0) {
        alert(
          "Please fill in all required fields (Name, Price, Quantity) with valid values."
        );
        setLoading(false);
        return;
      }

      const itemPayload = {
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        category: newItem.category || null,
        price: newItem.price,
        qty: newItem.qty,
        rate: newItem.rate,
      };

      const url = isEditing
        ? `${API_URL}/project_pulse/Item/updateItem/${newItem.id}`
        : `${API_URL}/project_pulse/Item/createItem`;

      const method = isEditing ? "PUT" : "POST";

      console.log("Sending request to:", url);
      console.log("Payload:", itemPayload);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? "update" : "create"} item: ${
            response.status
          } - ${result.message || result.error || "Unknown error"}`
        );
      }

      console.log(":", result);

      // Handle different success response formats
      if (result.message) {
        const successMessage = result.message + (result.itemNo ? ` ${result.itemNo}` : result.Id ? ` ${result.Id}` : "");
        alert(successMessage);
        setIsModalOpen(false);
        resetNewItem();
        // Refresh items list
        await fetchItems();
      } else {
        throw new Error(
          `Failed to ${isEditing ? "update" : "create"} item: No success message received`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} item:`,
        error
      );
      alert(
        `Error ${isEditing ? "updating" : "creating"} item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleItemSubmit();
  };

  // Delete item
  const deleteItem = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/project_pulse/Item/deleteItem/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to delete item: ${response.status} - ${
            result.message || result.error || "Unknown error"
          }`
        );
      }

      alert(result.message || "Item deleted successfully");

      // Refresh items list
      await fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(
        `Error deleting item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Search is handled by the filteredItems logic
  };

  // Handle new item input changes
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
      if (name === "price" || name === "qty" || name === "rate") {
        updatedItem.total =
          updatedItem.price * updatedItem.qty * (updatedItem.rate || 1);
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
    <div className="p-4 min-h-screen my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-lg font-semibold text-gray-800">
          Items ({items.length})
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              resetNewItem();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            New Item
          </button>
          <button
            onClick={fetchItems}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
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
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
          }}
          className="px-4 py-2 bg-gray-100 0 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
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
        {!loading && displayItems.length > 0 ? (
          displayItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-7 items-center px-4 py-1 hover:bg-gray-100  border-b"
            >
              <div className="font-mono text-xs">{item.id}</div>
              <div className="font-medium">{item.name}</div>
              <div>
                {categories.find((cat) => cat.categoryId === item.category)
                  ?.catDescription ||
                  item.category ||
                  "-"}
              </div>
              <div>{formatCurrencyOrNA(item.price)}</div>
              <div>{item.qty}</div>
              <div>{formatCurrencyOrNA(item.total)}</div>
              <div className="text-right space-x-2">
                <button
                  onClick={() => editItem(item)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          /* No results message */
          <div className="text-center p-4 text-gray-500">
            {!loading &&
              (items.length === 0
                ? "No items found. Click 'New Item' to add one."
                : "No items match your search.")}
          </div>
        )}
      </div>

      {/* Modal for New Item or Editing Existing Item */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-sm font-semibold mb-4">
              {isEditing ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-xs font-medium text-gray-700"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-xs font-medium text-gray-700"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <SearchableSelect
                  options={categoryOptions}
                  value={newItem.category}
                  onChange={handleCategoryChange}
                  placeholder="Search and select category..."
                  label=""
                  className="w-full text-xs"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-700"
                    htmlFor="price"
                  >
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={newItem.price || ""}
                    onChange={handleNewItemChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-gray-700"
                    htmlFor="qty"
                  >
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="qty"
                    name="qty"
                    value={newItem.qty || ""}
                    onChange={handleNewItemChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-700"
                    htmlFor="rate"
                  >
                    Rate
                  </label>
                  <input
                    type="number"
                    id="rate"
                    name="rate"
                    value={newItem.rate || ""}
                    onChange={handleNewItemChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Total
                  </label>
                  <div className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md p-2">
                    {formatCurrencyOrNA(newItem.total)}
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
                  className="px-4 py-2 bg-gray-100 0 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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