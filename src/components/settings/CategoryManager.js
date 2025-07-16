import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState("");

  // 🔁 Fetch from server
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ➕ Add
  const addCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    const exists = categories.some((c) => c.name === trimmed);
    if (exists) {
      toast.error("Category already exists");
      return;
    }

    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (res.ok) {
      toast.success("Category added");
      setNewCategory("");
      fetchCategories(); // 🔁 refresh list
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

    const cat = categories[editIndex];

    const res = await fetch(`${API_URL}/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, name: editedName.trim() }),
    });

    if (res.ok) {
      toast.success("Category updated");
      setEditIndex(null);
      setEditedName("");
      fetchCategories(); // 🔁 refresh
    } else {
      toast.error("❌ Failed to update category");
    }
  };

  // 🗑️ Delete
  const deleteCategory = async (index) => {
    const cat = categories[index];

    if (!window.confirm(`Delete category "${cat.name}"?`)) return;

    const res = await fetch(`${API_URL}/categories/${cat.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.info("Category deleted");
      fetchCategories(); // 🔁 refresh
    } else {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Category Manager</h3>

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
          Add
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
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
                  className="bg-blue-600 text-white p-2 rounded"
                >Save</button>
              </>
            ) : (
              <>
                <span>{cat.name}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(i, cat.name)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(i)}
                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
