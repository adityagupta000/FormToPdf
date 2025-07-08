import React from "react";
import { toast } from "react-toastify";

const ResetAll = () => {
  const handleReset = () => {
    const confirmReset = window.confirm(
      "⚠️ This will erase all unsaved changes and restore the app to its default state. Continue?"
    );

    if (!confirmReset) return;

    // Clear form input, config, settings
    localStorage.removeItem("genomics_form_data");
    // Optionally remove other keys if added later (e.g., config, theme)
    // localStorage.removeItem('genomics_config');

    toast.success("🔄 App state reset. Reloading...");

    setTimeout(() => {
      window.location.reload(); // reload default from formConfig.json
    }, 1000);
  };

  return (
    <button
      onClick={handleReset}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
    >
      ♻️ Reset All
    </button>
  );
};

export default ResetAll;
