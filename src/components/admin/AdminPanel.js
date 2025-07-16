import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";

const API_URL = "http://localhost:5000";

const AdminPanel = () => {
  const [localFields, setLocalFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    label: "",
    category: "",
    min: 1,
    max: 10,
  });

  // Toast simulation (since we can't use react-toastify)
  const showToast = (message, type = "info") => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // In a real app, you'd use a proper toast library
    alert(message);
  };

  // Load fields
  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/fields`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      let data = await res.json();
      data = data.map((f) => ({
        ...f,
        _uuid: uuidv4(),
        _originalId: f.id,
      }));
      setLocalFields(data);
    } catch (err) {
      const errorMsg = "❌ Failed to load fields";
      setError(errorMsg);
      showToast(errorMsg, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const names = data.map((cat) =>
        typeof cat === "string" ? cat : cat.name
      );
      setCategories(names);
    } catch (err) {
      const errorMsg = "❌ Failed to load categories";
      showToast(errorMsg, "error");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFields();
    fetchCategories();
  }, []);

  const addNewField = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!newFieldData.label.trim()) {
      showToast("❌ Field label is required", "error");
      return;
    }

    // Check for duplicate field IDs based on label
    const fieldId = `field_${newFieldData.label
      .toLowerCase()
      .replace(/\s+/g, "_")}_${Date.now()}`;
    const isDuplicate = localFields.some(
      (field) =>
        field.label.toLowerCase() === newFieldData.label.toLowerCase().trim()
    );

    if (isDuplicate) {
      showToast("❌ A field with this name already exists", "error");
      return;
    }

    const newField = {
      _uuid: uuidv4(),
      _originalId: null,
      id: fieldId,
      label: newFieldData.label.trim(),
      category: newFieldData.category,
      min: Number(newFieldData.min),
      max: Number(newFieldData.max),
      high: "",
      normal: "",
      low: "",
    };

    try {
      const res = await fetch(`${API_URL}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newField),
      });

      if (res.ok) {
        showToast("🆕 Field added!", "success");
        setShowCreateModal(false);
        setNewFieldData({ label: "", category: "", min: 1, max: 10 });
        fetchFields();
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      showToast("❌ Failed to add field", "error");
      console.error(err);
    }
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewFieldData({ label: "", category: "", min: 1, max: 10 });
  };

  const saveField = async (index) => {
    const field = localFields[index];
    const targetId = field._originalId ?? field.id;

    try {
      const res = await fetch(`${API_URL}/fields/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...field }),
      });

      if (res.ok) {
        showToast("✅ Field saved", "success");
        fetchFields();
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      showToast("❌ Failed to save field", "error");
      console.error(err);
    }
  };

  const deleteField = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_URL}/fields/${id}`, { method: "DELETE" });

      if (res.ok || res.status === 404) {
        showToast("🗑️ Field deleted", "info");
        fetchFields();
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      showToast("❌ Failed to delete field", "error");
      console.error(err);
    }
  };

  const updateLocalField = (index, key, value) => {
    const updated = [...localFields];

    if (key === "id") {
      const isDuplicate = localFields.some(
        (f, i) => i !== index && f.id.trim() === value.trim()
      );
      if (isDuplicate) {
        showToast("❌ Field ID must be unique", "error");
        return;
      }
    }

    // Handle number inputs properly
    if (key === "min" || key === "max") {
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        value = key === "min" ? 1 : 10;
      } else {
        value = numValue;
      }
    }

    updated[index] = { ...updated[index], [key]: value };
    setLocalFields(updated);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...localFields];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLocalFields(reordered);
    showToast("📦 Reordered (not saved)", "info");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fields...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchFields();
              fetchCategories();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Field Management
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>Add New Field</span>
          </button>
        </div>

        {localFields.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No fields available</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create First Field
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {localFields.map((field, index) => (
                    <Draggable
                      key={field._uuid}
                      draggableId={field._uuid}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`border rounded-lg p-4 sm:p-6 bg-white shadow-sm space-y-4 mb-4 sm:mb-6 transition-all duration-200 ${
                            snapshot.isDragging
                              ? "bg-gray-100 ring-2 ring-green-500 shadow-lg"
                              : "hover:shadow-md"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-lg font-semibold text-gray-900 break-words">
                              {index + 1}. {field.label}
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => saveField(index)}
                                className="w-full sm:w-auto px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-1"
                              >
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() =>
                                  deleteField(field._originalId ?? field.id)
                                }
                                className="w-full sm:w-auto px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-1"
                              >
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldInput
                              label="Field ID"
                              value={field.id}
                              disabled={!!field._originalId}
                              onChange={(val) =>
                                updateLocalField(index, "id", val.trim())
                              }
                            />
                            <FieldInput
                              label="Label"
                              value={field.label}
                              onChange={(val) =>
                                updateLocalField(index, "label", val)
                              }
                            />
                            <FieldSelect
                              label="Category"
                              value={field.category}
                              options={categories}
                              onChange={(val) =>
                                updateLocalField(index, "category", val)
                              }
                            />
                            <FieldInput
                              label="Min"
                              type="number"
                              value={field.min}
                              onChange={(val) =>
                                updateLocalField(index, "min", val)
                              }
                            />
                            <FieldInput
                              label="Max"
                              type="number"
                              value={field.max}
                              onChange={(val) =>
                                updateLocalField(index, "max", val)
                              }
                            />
                            <div className="sm:col-span-2 lg:col-span-3">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <FieldTextarea
                                  label="High Recommendation"
                                  value={field.high}
                                  onChange={(val) =>
                                    updateLocalField(index, "high", val)
                                  }
                                />
                                <FieldTextarea
                                  label="Normal Recommendation"
                                  value={field.normal}
                                  onChange={(val) =>
                                    updateLocalField(index, "normal", val)
                                  }
                                />
                                <FieldTextarea
                                  label="Low Recommendation"
                                  value={field.low}
                                  onChange={(val) =>
                                    updateLocalField(index, "low", val)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* CREATE MODAL - This was missing! */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Field
              </h3>
              <button
                onClick={handleCreateModalClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <FieldInput
                label="Field Label"
                value={newFieldData.label}
                onChange={(val) =>
                  setNewFieldData({ ...newFieldData, label: val })
                }
                placeholder="Enter field label"
                required
              />

              <FieldSelect
                label="Category"
                value={newFieldData.category}
                options={categories}
                onChange={(val) =>
                  setNewFieldData({ ...newFieldData, category: val })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <FieldInput
                  label="Min Value"
                  type="number"
                  value={newFieldData.min}
                  onChange={(val) =>
                    setNewFieldData({ ...newFieldData, min: val })
                  }
                  min="1"
                />
                <FieldInput
                  label="Max Value"
                  type="number"
                  value={newFieldData.max}
                  onChange={(val) =>
                    setNewFieldData({ ...newFieldData, max: val })
                  }
                  min="1"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCreateModalClose}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addNewField}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 📦 Reusable components
const FieldInput = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
  required = false,
  min,
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      min={min}
      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        disabled
          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
          : "bg-white border-gray-300 hover:border-gray-400"
      }`}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const FieldTextarea = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      rows={3}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const FieldSelect = ({ label, value, options, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">— None —</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AdminPanel;
