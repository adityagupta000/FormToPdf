import React from "react";
import { useFormConfig } from "../../contexts/FormConfigContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";

const AdminPanel = () => {
  const { state, dispatch } = useFormConfig();
  const categories = state.categories;
  // ➕ Add new field
  const addNewField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      category: "",
      high: "",
      normal: "",
      low: "",
    };
    dispatch({ type: "ADD_FIELD", field: newField });
    toast.success("🆕 Field added!");
  };

  // 🗑️ Delete field
  const deleteField = (index) => {
    if (window.confirm("Delete this field?")) {
      dispatch({ type: "DELETE_FIELD", index });
      toast.info("🗑️ Field deleted");
    }
  };

  // ✏️ Edit field
  const updateField = (index, property, value) => {
    dispatch({ type: "UPDATE_FIELD", index, property, value });
  };

  // 🔁 Handle drag-end reorder
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(state.fields);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    dispatch({
      type: "REORDER_FIELDS",
      fields: reordered,
    });
    toast.success("📦 Field order updated!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        
        <h2 className="text-2xl font-bold">🛠️ Field Management</h2>
        <button
          onClick={addNewField}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
        >
          ➕ Add New Field
        </button>
      </div>

      {/* Drag Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {state.fields.map((field, index) => (
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
                        <button
                          onClick={() => deleteField(index)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* All input fields: ID, Label, Category, High/Normal/Low */}
                        {/* Reuse existing inputs from your current AdminPanel */}
                        <div>
                          <label className="text-sm font-medium">
                            Field ID
                          </label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={field.id}
                            onChange={(e) =>
                              updateField(index, "id", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Label</label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={field.label}
                            onChange={(e) =>
                              updateField(index, "label", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Category
                          </label>
                          <select
                            className="w-full border rounded px-3 py-2"
                            value={field.category} // the current selected category (string)
                            onChange={(e) =>
                              updateField(index, "category", e.target.value)
                            }
                          >
                            <option value="">— None —</option>
                            {categories.map((cat, i) => (
                              <option key={i} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Min Score
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            className="w-full border rounded px-3 py-2"
                            value={field.min ?? ""}
                            onChange={(e) =>
                              updateField(
                                index,
                                "min",
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Max Score
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            className="w-full border rounded px-3 py-2"
                            value={field.max ?? ""}
                            onChange={(e) =>
                              updateField(
                                index,
                                "max",
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            High Recommendation
                          </label>
                          <textarea
                            rows={3}
                            className="w-full border rounded px-3 py-2"
                            value={field.high}
                            onChange={(e) =>
                              updateField(index, "high", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Normal Recommendation
                          </label>
                          <textarea
                            rows={3}
                            className="w-full border rounded px-3 py-2"
                            value={field.normal}
                            onChange={(e) =>
                              updateField(index, "normal", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Low Recommendation
                          </label>
                          <textarea
                            rows={3}
                            className="w-full border rounded px-3 py-2"
                            value={field.low}
                            onChange={(e) =>
                              updateField(index, "low", e.target.value)
                            }
                          />
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
    </div>
  );
};

export default AdminPanel;
