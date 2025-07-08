import React, { useEffect, useState } from "react";
import { useFormConfig } from "../../contexts/FormConfigContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000";

const AdminPanel = () => {
  const { state } = useFormConfig();
  const [localFields, setLocalFields] = useState([]);

  useEffect(() => {
    setLocalFields(state.fields);
  }, [state.fields]);

  // ➕ Add a new field (POST)
  const addNewField = async () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      category: "",
      min: 1,
      max: 10,
      high: "",
      normal: "",
      low: "",
    };

    const res = await fetch(`${API_URL}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newField),
    });

    const savedField = await res.json();
    setLocalFields((prev) => [...prev, savedField]);
    toast.success("🆕 Field added!");
  };

  // ✏️ Update a field (PUT)
  const saveField = async (index) => {
    const field = localFields[index];
    const res = await fetch(`${API_URL}/fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field),
    });

    if (res.ok) {
      toast.success("💾 Field saved!");
    } else {
      toast.error("❌ Failed to save field");
    }
  };

  // 🗑️ Delete a field (DELETE)
  const deleteField = async (id) => {
    if (!window.confirm("Delete this field?")) return;

    await fetch(`${API_URL}/fields/${id}`, { method: "DELETE" });
    setLocalFields((prev) => prev.filter((f) => f.id !== id));
    toast.info("🗑️ Field deleted");
  };

  // ✍️ Edit local field state
  const updateLocalField = (index, key, value) => {
    const updated = [...localFields];
    updated[index] = { ...updated[index], [key]: value };
    setLocalFields(updated);
  };

  // 🔁 Reorder fields (local only for now)
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...localFields];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setLocalFields(reordered);
    toast.success("📦 Field order updated (not yet saved)");
  };

  const categories = state.categories.map((c) =>
    typeof c === "string" ? c : c.name
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🛠️ Field Management</h2>
        <div className="flex gap-3">
          <button
            onClick={addNewField}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            ➕ Add New Field
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {localFields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`border rounded-lg p-6 bg-white shadow-sm space-y-4 ${
                        snapshot.isDragging
                          ? "bg-gray-100 ring-2 ring-green-500"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          {index + 1}. {field.label}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveField(index)}
                            className="text-blue-600 hover:underline"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => deleteField(field.id)}
                            className="text-red-600 hover:underline"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldInput
                          label="Field ID"
                          value={field.id}
                          disabled
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
                            updateLocalField(
                              index,
                              "min",
                              val ? parseInt(val) : undefined
                            )
                          }
                        />
                        <FieldInput
                          label="Max"
                          type="number"
                          value={field.max}
                          onChange={(val) =>
                            updateLocalField(
                              index,
                              "max",
                              val ? parseInt(val) : undefined
                            )
                          }
                        />
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

// ✅ Reusable Inputs

const FieldInput = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input
      type={type}
      disabled={disabled}
      className="w-full border rounded px-3 py-2"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const FieldTextarea = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <textarea
      rows={3}
      className="w-full border rounded px-3 py-2"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const FieldSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <select
      className="w-full border rounded px-3 py-2"
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
