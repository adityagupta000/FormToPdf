import React from "react";
import { useFormConfig } from "../../contexts/FormConfigContext";

const AdminPanel = () => {
  const { state, dispatch } = useFormConfig();

  // ➕ Add a new field template
  const addNewField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      category: "",
      high: "High score recommendation",
      normal: "Normal score recommendation",
      low: "Low score recommendation",
    };

    dispatch({ type: "ADD_FIELD", field: newField });
  };

  // 🗑️ Delete field by index
  const deleteField = (index) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      dispatch({ type: "DELETE_FIELD", index });
    }
  };

  // ✏️ Update specific property in a field
  const updateField = (index, property, value) => {
    dispatch({ type: "UPDATE_FIELD", index, property, value });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🛠️ Field Management</h2>
        <button
          onClick={addNewField}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          ➕ Add New Field
        </button>
      </div>

      {/* List all fields */}
      <div className="space-y-6">
        {state.fields.map((field, index) => (
          <div
            key={field.id}
            className="border rounded-lg p-6 bg-white shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Field {index + 1}: {field.label}
              </h3>
              <button
                onClick={() => deleteField(index)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Field ID
                </label>
                <input
                  type="text"
                  value={field.id}
                  onChange={(e) => updateField(index, "id", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, "label", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={field.category}
                  onChange={(e) =>
                    updateField(index, "category", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              {/* HIGH Recommendation */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  High Recommendation
                </label>
                <textarea
                  value={field.high}
                  onChange={(e) => updateField(index, "high", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              {/* NORMAL Recommendation */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Normal Recommendation
                </label>
                <textarea
                  value={field.normal}
                  onChange={(e) => updateField(index, "normal", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              {/* LOW Recommendation */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Low Recommendation
                </label>
                <textarea
                  value={field.low}
                  onChange={(e) => updateField(index, "low", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
