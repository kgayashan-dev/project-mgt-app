"use client";

import React, { useEffect, useState } from "react";
import SearchPopup from "@/components/SearchPopup";
import { FaSearch } from "react-icons/fa";
import LogOutModal from "./LogOutModal";
const DashboardNavBar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    const toke = localStorage.getItem("token");
    if (!toke) {
      window.location.href = "/";
    }
  }, []);

  const onClose = () => {
    setShowProfilePopup(false);
  };
  return (
    <div className="flex  z-30 items-center justify-end gap-4 h-14 w-full padding-container bg-white">
      <FaSearch
        role="button"
        onClick={() => setShowLogin(true)}
        size={25}
        className="cursor-pointer text-gray-50 hover:text-gray-800"
      />
      {/* Profile Picture */}
      <div
        className="w-12 h-12 rounded-full flex justify-center items-center cursor-pointer hover:ring-2 hover:ring-blue-300 focus:ring-4 focus:ring-blue-500"
        onClick={() => setShowProfilePopup((prev) => !prev)}
      >
        <img src="/project.png" alt="p" className="w-12 h-12 rounded-full" />
      </div>

      {/* LoginCard Popup */}
      {showLogin && (
        <SearchPopup isOpen={showLogin} onClose={() => setShowLogin(false)} />
      )}

      {showProfilePopup && <LogOutModal onClose={onClose} />}
    </div>
  );
};

export default DashboardNavBar;
