"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaBars } from "react-icons/fa";
import { RiPulseAiLine, RiAlignItemBottomFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdOutlinePayment } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { TbFileInvoice } from "react-icons/tb";

import {
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaTachometerAlt,
  FaCalculator,
  FaChartBar,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === title ? null : title);
  };

  // Check if a link is active (including dropdown items)
  const isLinkActive = (path: string, dropdownPaths?: { path: string }[]) => {
    if (pathName === path) return true;
    if (dropdownPaths) {
      return dropdownPaths.some((item) => pathName === item.path);
    }
    return false;
  };

  const navLinks = [
    { path: "/user/dashboard", title: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/user/clients", title: "Clients", icon: <FaUsers /> },
    { path: "/user/items", title: "Items", icon: <RiAlignItemBottomFill /> },
    { path: "/user/quotations", title: "Quotations", icon: <FaCalculator /> },
    {
      path: "/user/invoices",
      title: "Invoices",
      icon: <TbFileInvoice />,
      icon2: <IoIosArrowDown />,
      dropdown: [
        { path: "/user/recurring-templates", title: "Recurring Templates" },
        { path: "/user/retainers", title: "Retainers" },
      ],
    },
    {
      path: "/user/payments",
      title: "Payments",
      icon: <FaMoneyBillWave />,
      icon2: <IoIosArrowDown />,
      dropdown: [{ path: "/user/checkout-links", title: "Checkout Links" }],
    },
    {
      path: "/user/expenses",
      title: "Expenses",
      icon: <MdOutlinePayment />,
      icon2: <IoIosArrowDown />,
      dropdown: [
        { path: "/user/bills", title: "Bills" },
        { path: "/user/vendors", title: "Vendors" },
        { path: "/user/uploads", title: "Uploads" },
      ],
    },
    { path: "/user/projects", title: "Projects", icon: <FaClipboardList /> },

    {
      path: "/user/accounting",
      title: "Accounting",
      icon: <FaChartBar />,
      icon2: <IoIosArrowDown />,
      dropdown: [
        { path: "/user/journal-entries", title: "Journal Entries" },
        { path: "/user/accounts", title: "Accounts" },
      ],
    },
    {
      path: "/user/reports",
      title: "Reports",
      icon: <HiOutlineDocumentReport />,
    },
  ];

  return (
    <div className="flex">
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-blue-800 text-white w-64 p-6 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 bg-blue-700 text-white absolute top-4 right-4 rounded-full md:hidden"
        >
          <IoMdClose />
        </button>

        <h1 className="text-2xl font-bold mb-6">
          <Link href="/" className="text-white" prefetch={true}>
            <span className="flex items-center gap-2">
              <RiPulseAiLine />
              ProjectPulse
            </span>
          </Link>
          <p className="text-sm font-medium mt-1">Owner</p>
        </h1>

        <nav>
          <ul className="space-y-2 regular-14">
            {navLinks.map((navLink, id) => (
              <li key={id}>
                <div className="flex flex-col">
                  <div
                    className={`flex items-center px-2 py-3 transition duration-200 rounded-md
                      ${
                        isLinkActive(navLink.path, navLink.dropdown)
                          ? "bg-blue-700 text-white"
                          : "text-gray-300 hover:text-white hover:bg-blue-700"
                      }`}
                  >
                    <Link
                      href={navLink.path}
                      className="flex items-center flex-1"
                      prefetch={true}
                    >
                      <span className="mr-3">{navLink.icon}</span>
                      <span>{navLink.title}</span>
                    </Link>
                    {navLink.dropdown && (
                      <button
                        onClick={(event) =>
                          toggleDropdown(navLink.title, event)
                        }
                        className="ml-auto focus:outline-none"
                      >
                        <IoIosArrowDown
                          className={`transition-transform ${
                            activeDropdown === navLink.title ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {navLink.dropdown && activeDropdown === navLink.title && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {navLink.dropdown.map((subLink, subId) => (
                        <li key={subId}>
                          <Link
                            prefetch={true}
                            href={subLink.path}
                            className={`block px-2 py-2 rounded-md 
                              ${
                                pathName === subLink.path
                                  ? "bg-blue-700 text-white font-semibold"
                                  : "text-gray-300 hover:text-white hover:bg-blue-700"
                              }`}
                          >
                            {subLink.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p- border-[0.05px] border-white/20"></div>

        <ul className="space-y-2">
          <li>
            <div className="flex flex-col py-3">
              <div className="flex items-center px-2 py-3 text-gray-300 hover:text-white transition duration-200 rounded-md hover:bg-blue-700">
                <Link
                  prefetch={true}
                  href="/user/team-members"
                  className={`w-full ${
                    pathName === "/user/team-members"
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Team Members
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="flex-1 md:ml-64">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 bg-blue-800 text-white fixed top-4 left-4 z-50 rounded-full md:hidden"
          >
            <FaBars />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
