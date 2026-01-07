// src/components/layout/Sidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

const menuItems = [
  {
    label: "Transaction",
    children: [
      { label: "New Purchase", type: "modal", txType: "purchase" },
      { label: "New Sales", type: "modal", txType: "sales" },
      { label: "Transaction Entry", path: "/transaction" },
    ],
  },
  {
    label: "Funds",
    children: [
      { label: "Payment", path: "/fund/payment" },
      { label: "Receipt", path: "/fund/receipt" },
      { label: "Transfer", path: "/fund/transfer" },
      { label: "Deposit", path: "/fund/deposit" },
      { label: "Withdrawal", path: "/fund/withdrawal" },
    ],
  },
  {
    label: "Position",
    children: [
      { label: "Stock", path: "/clstock" },
      { label: "Account", path: "/statement" },
    ],
  },
  {
    label: "Add New",
    children: [
      { label: "Account", path: "/addAccount" },
      { label: "Product", path: "/addStock" },
      { label: "Brand", path: "/addBrand" },
      { label: "Category", path: "/addCategory" },
    ],
  },
  {
    label: "Edit",
    children: [
      { label: "Product", path: "/editProduct" },
      { label: "Account", path: "/accounts" },
    ],
  },
  {
    label: "List",
    children: [
      { label: "Sales Invoices", path: "/showinvoice" },
      { label: "Product Details", path: "/showproduct" },
    ],
  },
];

export default function Sidebar({ openTransactionModal }) {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 overflow-y-auto">
      <div className="text-xl font-bold mb-4">Menu</div>
      <ul className="space-y-2">
        {menuItems.map((menu) => (
          <li key={menu.label}>
            <button
              onClick={() => toggleMenu(menu.label)}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded"
            >
              <span>{menu.label}</span>
              <FaChevronDown
                className={`transform transition-transform ${
                  openMenus[menu.label] ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus[menu.label] && (
              <ul className="ml-4 mt-1 space-y-1">
                {menu.children.map((child) => (
                  <li key={child.label}>
                    {child.type === "modal" ? (
                      <button
                        onClick={() => openTransactionModal(child.txType)}
                        className="bg-blue-500 block w-full text-left px-3 py-1 rounded hover:bg-gray-600"
                      >
                        {child.label}
                      </button>
                    ) : (
                      <Link
                        to={child.path}
                        className={`block px-3 py-1 rounded hover:bg-gray-600 ${
                          location.pathname === child.path ? "bg-gray-700" : ""
                        }`}
                      >
                        {child.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
