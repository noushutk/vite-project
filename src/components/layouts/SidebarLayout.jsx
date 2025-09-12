// src/components/layout/SidebarLayout.jsx
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const SidebarLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <Outlet />  {/* This will render the current route's component */}
      </main>
    </div>
  );
};

export default SidebarLayout;
