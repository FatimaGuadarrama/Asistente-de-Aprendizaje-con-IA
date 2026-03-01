// ================================
// IMPORTS
// ================================
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

// ================================
// COMPONENTE APP LAYOUT
// ================================
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // -------------------------------
  // TOGGLE SIDEBAR
  // -------------------------------
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;