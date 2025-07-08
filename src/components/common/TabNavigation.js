import React from "react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "form", label: "📝 Form View" },
    { id: "admin", label: "🛠️ Admin Panel" },
    { id: "settings", label: "🎛️ Form Settings" },
  ];

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === tab.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
