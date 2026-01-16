"use client";
import React, { useRef, useEffect } from "react";
// import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { AiOutlineLogout } from "react-icons/ai";
// import { FiGift } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface LogOutModalProps {
  onClose: () => void; // onClose is a function with no parameters and returns void
}

const LogOutModal: React.FC<LogOutModalProps> = ({ onClose }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null); // Ref to the modal element˝

  // const menuItems = [
  //   {
  //     id: 1,
  //     label: "Account Profile",
  //     href: "/user/profile",
  //     icon: <AiOutlineUser size={20} />,
  //   },
  //   {
  //     id: 2,
  //     label: "Billing and Upgrade",
  //     href: "/billing",
  //     icon: <MdOutlineUpgrade size={20} />,
  //   },
  //   {
  //     id: 3,
  //     label: "Refer a Friend",
  //     href: "/refer",
  //     icon: <FiGift size={20} />,
  //   },
  // ];

  // Redirect function that navigates to the correct href
  // const reDirect = (href: string) => {
  //   router.push(href); // Navigate to the specified route
  //   onClose(); // Close the modal after navigation
  // };
  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close the modal
      }
    };
    // Attach event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      className="absolute top-16 right-12 w-64 bg-white shadow-lg rounded-lg p-4 z-50"
    >
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center text-sm font-bold text-gray-600">
          A
        </div>
        <div>
          <p className="font-semibold text-gray-800">Admin</p>
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {/* {menuItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-gray-900"
          >
            <button
              onClick={() => reDirect(item.href)} // Pass the href to reDirect
              className="flex items-center gap-2"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))} */}
        <li
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-gray-900"
        >
          <AiOutlineLogout size={20} />
          <span>Log Out</span>
        </li>
      </ul>
    </div>
  );
};

export default LogOutModal;
