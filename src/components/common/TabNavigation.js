import { useTheme } from "../../contexts/ThemeContext";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: "form", label: "📝 Form View" },
    { id: "admin", label: "🛠️ Admin Panel" },
    { id: "settings", label: "🎛️ Form Settings" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-sm px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default TabNavigation;
