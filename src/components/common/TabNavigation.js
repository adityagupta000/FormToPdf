import { useTheme } from "../../contexts/ThemeContext";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: "form", label: "📝 Form View", shortLabel: "📝 Form" },
    { id: "admin", label: "🛠️ Admin Panel", shortLabel: "🛠️ Admin" },
    { id: "settings", label: "🎛️ Form Settings", shortLabel: "🎛️ Settings" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-2 sm:py-4">
          {/* Tabs - Always start from left */}
          <div className="flex gap-1 sm:gap-2 items-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {/* Show short label on mobile, full label on larger screens */}
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Theme Toggle - Always on right */}
          <button
            onClick={toggleTheme}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-md sm:rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 whitespace-nowrap flex-shrink-0"
          >
            <span className="sm:hidden">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="hidden sm:inline">
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
