import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const API_URL = "http://localhost:5000";

const AdminPanel = () => {
  const [localFields, setLocalFields] = useState([]);
  const [categories, setCategories] = useState([]);

  // 🔁 Fetch all fields
  const fetchFields = async () => {
    try {
      const res = await fetch(`${API_URL}/fields`);
      let data = await res.json();

      data = data.map((f) => ({
        ...f,
        _uuid: uuidv4(),
        _originalId: f.id,
      }));

      setLocalFields(data);
    } catch (err) {
      toast.error("❌ Failed to load fields");
    }
  };

  // 🔁 Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      // Convert to string list if needed
      const names = data.map((cat) =>
        typeof cat === "string" ? cat : cat.name
      );
      setCategories(names);
    } catch (err) {
      toast.error("❌ Failed to load categories");
    }
  };

  useEffect(() => {
    fetchFields();
    fetchCategories();
  }, []);

  const addNewField = async () => {
    const newField = {
      _uuid: uuidv4(),
      _originalId: null,
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

    if (res.ok) {
      toast.success("🆕 Field added!");
      fetchFields();
    } else {
      toast.error("❌ Failed to add field");
    }
  };

  const saveField = async (index) => {
    const field = localFields[index];
    const targetId = field._originalId ?? field.id;

    const res = await fetch(`${API_URL}/fields/${targetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...field }),
    });

    if (res.ok) {
      toast.success("Field saved!");
      fetchFields();
    } else {
      toast.error(" Failed to save field");
    }
  };

  const deleteField = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    await fetch(`${API_URL}/fields/${id}`, { method: "DELETE" });
    toast.info(" Field deleted");
    fetchFields();
  };

  const updateLocalField = (index, key, value) => {
    const updated = [...localFields];

    if (key === "id") {
      const isDuplicate = localFields.some(
        (f, i) => i !== index && f.id.trim() === value.trim()
      );
      if (isDuplicate) {
        toast.error("❌ Field ID must be unique");
        return;
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
    toast.info("📦 Field order updated (not saved yet)");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🛠️ Field Management</h2>
        <button
          onClick={addNewField}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Add New Field
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {[...localFields].reverse().map((field, index) => (
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
                      className={`border rounded-lg p-6 bg-white shadow-sm space-y-4 mb-6 ${
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
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() =>
                              deleteField(field._originalId ?? field.id)
                            }
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldInput
                          label="Field ID"
                          value={field.id}
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

// 🔁 Reusable components
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

const FieldSelect = ({ label, value, options, onChange }) => (
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
