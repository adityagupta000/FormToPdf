import React, { useState, useRef } from "react";
import { useFormConfig } from "../../contexts/FormConfigContext";
import { useConfigImportExport } from "../../hooks/useConfigImportExport";
import { toast } from "react-toastify";
import ResetAll from "../common/ResetAll";
import CategoryManager from "./CategoryManager";

const API_URL = "http://localhost:5000";

const SettingsPanel = () => {
  const { state, dispatch } = useFormConfig();

  const [settings, setSettings] = useState({
    title: state.title,
    quote: state.quote,
    description: state.description,
    headerColor: state.headerColor,
    highThreshold: state.highThreshold,
    colors: {
      low: state.colors.low,
      medium: state.colors.medium,
      high: state.colors.high,
    },
  });

  const fileInputRef = useRef(null);
  const { exportConfig, importConfig } = useConfigImportExport();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".json")) {
      toast.error("Please upload a valid JSON file.");
      return;
    }
    importConfig(file);
    e.target.value = ""; // reset input
  };

  // 🔁 Update local state as user types
  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleColorChange = (level, value) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [level]: value,
      },
    }));
  };

  // 💾 Save to backend
  const applySettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      dispatch({ type: "UPDATE_SETTINGS", settings }); // update UI too
      toast.success("Settings saved to server!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    }
  };

  const resetSettings = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      window.location.reload(); // simplest way
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className=" bg-white text-2xl font-bold mb-6">
        🎛️ Form Customization
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">🧾 Header Info</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Main Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quote</label>
            <textarea
              rows={2}
              value={settings.quote}
              onChange={(e) => handleChange("quote", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Header Background Color
            </label>
            <input
              type="color"
              value={settings.headerColor}
              onChange={(e) => handleChange("headerColor", e.target.value)}
              className="h-10 w-full border rounded"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">🎯 Score Logic</h3>

          <div>
            <label className="block text-sm font-medium mb-1">
              High Score Threshold (≥)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.highThreshold}
              onChange={(e) =>
                handleChange("highThreshold", parseInt(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <h3 className="text-lg font-semibold mt-6">🎨 Score Colors</h3>

          <div className="space-y-2">
            <ColorInput
              label="High"
              value={settings.colors.high}
              onChange={(val) => handleColorChange("high", val)}
            />
            <ColorInput
              label="Medium"
              value={settings.colors.medium}
              onChange={(val) => handleColorChange("medium", val)}
            />
            <ColorInput
              label="Low"
              value={settings.colors.low}
              onChange={(val) => handleColorChange("low", val)}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={applySettings}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          💾 Apply Settings
        </button>
        <button
          onClick={resetSettings}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          ♻️ Reset to Default
        </button>
        <button
          onClick={exportConfig}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          📤 Export Config (.json)
        </button>

        <button
          onClick={handleImportClick}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          📥 Import Config (.json)
        </button>

        <div className="mt-2">
          <ResetAll />
        </div>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {/* ⬇️ Category management (uses API now) */}
      <div className="mt-6">
        <CategoryManager />
      </div>
    </div>
  );
};

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full border rounded"
    />
  </div>
);

export default SettingsPanel;
