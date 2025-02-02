"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState(["Invoices"]);
  const [allPages] = useState([
    "Dashboard",
    "Clients",
    "Invoices",
    "Payments",
    "Expenses",
  ]);
  const [filteredPages, setFilteredPages] = useState(allPages);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filter pages based on the search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = allPages.filter((page) =>
        page.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages(allPages);
    }
  }, [searchQuery, allPages]);

  // Render nothing if the popup is not open
  if (!isOpen) return null;

  // direct to the search results

  const searchResultDirection = (page: string) => {
    router.push(`/user/${page.toLowerCase()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
      >
        {/* Search Input */}
        <div className="flex items-center p-4 border-b">
          <FaSearch className="text-gray-400 w-5 h-5 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for anything in FreshBooks"
            className="flex-1 focus:outline-none text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Recent Section */}
        <div className="p-4">
          <h3 className="text-sm text-gray-500 font-medium mb-2">Recent</h3>
          <div className="space-y-2">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div
                  key={item}
                  className="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer flex justify-between items-center"
                >
                  <Link href={`/user/${item}`}>{item}</Link>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setRecentItems(recentItems.filter((i) => i !== item))
                    }
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent items</p>
            )}
          </div>
        </div>

        {/* Pages Section */}
        <div className="p-4">
          <h3 className="text-sm text-gray-500 font-medium mb-2">Pages</h3>
          <div className="space-y-2">
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <div
                  key={page}
                  className="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <span
                    onClick={() => searchResultDirection(page)}
                    role="button"
                  >
                    {page}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No pages found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
