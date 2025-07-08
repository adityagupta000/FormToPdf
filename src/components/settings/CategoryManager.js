import { useFormConfig } from "../../contexts/FormConfigContext";
import { useState } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000";

const CategoryManager = () => {
  const { state, dispatch } = useFormConfig();
  const [newCategory, setNewCategory] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState("");

  const categories = state.categories;

  // ➕ Add
  const addCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    const exists = categories.some((c) =>
      typeof c === "string" ? c === trimmed : c.name === trimmed
    );
    if (exists) {
      toast.error("🚫 Category already exists");
      return;
    }

    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (res.ok) {
      const newCat = await res.json();
      dispatch({ type: "ADD_CATEGORY", name: newCat.name });
      toast.success("✅ Category added");
      setNewCategory("");
    }
  };

  // ✏️ Start editing
  const startEdit = (i, name) => {
    setEditIndex(i);
    setEditedName(name);
  };

  // ✅ Confirm edit
  const confirmEdit = async () => {
    if (!editedName.trim()) return;

    const old = categories[editIndex];
    const catId = typeof old === "object" ? old.id : null;

    const res = await fetch(`${API_URL}/categories/${catId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: catId, name: editedName.trim() }),
    });

    if (res.ok) {
      dispatch({
        type: "UPDATE_CATEGORY",
        index: editIndex,
        newName: editedName.trim(),
      });
      toast.success("✏️ Category updated");
      setEditIndex(null);
      setEditedName("");
    } else {
      toast.error("❌ Failed to update category");
    }
  };

  // 🗑️ Delete
  const deleteCategory = async (index) => {
    const cat = categories[index];
    const catId = typeof cat === "object" ? cat.id : null;
    const catName = typeof cat === "string" ? cat : cat.name;

    if (!window.confirm(`Delete category "${catName}"?`)) return;

    const res = await fetch(`${API_URL}/categories/${catId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      dispatch({ type: "DELETE_CATEGORY", index });
      toast.info("🗑️ Category deleted");
    } else {
      toast.error("❌ Failed to delete category");
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">🗂️ Category Manager</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={addCategory}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Add
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((cat, i) => {
          const catName = typeof cat === "string" ? cat : cat.name;

          return (
            <div
              key={i}
              className="flex items-center justify-between bg-white border p-3 rounded"
            >
              {editIndex === i ? (
                <>
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full mr-2"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <button
                    onClick={confirmEdit}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    ✅
                  </button>
                </>
              ) : (
                <>
                  <span>{catName}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(i, catName)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(i)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryManager;
