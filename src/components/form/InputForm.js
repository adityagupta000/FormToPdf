import React, { useState, useEffect } from "react";
import { useExcelExport } from "../../hooks/useExcelExport";
import { useFormConfig } from "../../contexts/FormConfigContext";
import { usePDFGeneration } from "../../hooks/usePDFGeneration";
import { isValidScore } from "../../utils/helpers";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = "genomics_form_data";

const InputForm = ({ onGenerateReport, reportData }) => {
  const { state } = useFormConfig();
  const { generatePDF } = usePDFGeneration();

  // Try restoring from localStorage
  const [formData, setFormData] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const { exportToExcel } = useExcelExport();

  const [errors, setErrors] = useState({});

  // 🧠 Save to localStorage on formData change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (fieldId, value) => {
    const updatedValue = value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      [fieldId]: updatedValue,
    }));
    setErrors((prev) => ({
      ...prev,
      [fieldId]: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    state.fields.forEach((field) => {
      const value = formData[field.id];
      if (!isValidScore(value)) {
        newErrors[field.id] = "Score must be between 1 and 10";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onGenerateReport(formData);
      toast.success("✅ Report generated and saved!");
    } else {
      toast.error("❌ Please fix errors before submitting.");
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast.warning("Please generate a report first.");
      return;
    }
    generatePDF(reportData);
  };

  const handleClearForm = () => {
    if (window.confirm("Clear all form scores and reset saved state?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setFormData({});
      toast.info("🗑️ Cleared saved input.");
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-4 md:p-8 overflow-y-auto mobile-section">
      {/* ... header & description remain the same */}

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {state.fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col md:flex-row md:items-center"
            >
              <label className="w-full md:w-48 text-sm font-semibold mb-1 md:mb-0">
                {field.label}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData[field.id] || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`border p-2 w-full md:w-20 text-center rounded 
                  ${errors[field.id] ? "border-red-500" : "border-gray-300"}`}
              />
              {errors[field.id] && (
                <p className="text-red-600 text-xs mt-1 md:ml-4">
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-2 mt-6">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Generate Report
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleClearForm}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Clear Input
          </button>
          <button
            type="button"
            onClick={() => exportToExcel(reportData)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            📄 Export Excel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
