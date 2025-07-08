import { useFormConfig } from '../../contexts/FormConfigContext';
import { useState } from 'react';

const CategoryManager = () => {
  const { state, dispatch } = useFormConfig();
  const [newCategory, setNewCategory] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState('');

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (state.categories.includes(newCategory)) return;
    dispatch({ type: 'ADD_CATEGORY', name: newCategory.trim() });
    setNewCategory('');
  };

  const startEdit = (i, name) => {
    setEditIndex(i);
    setEditedName(name);
  };

  const confirmEdit = () => {
    if (!editedName.trim()) return;
    dispatch({ type: 'UPDATE_CATEGORY', index: editIndex, newName: editedName.trim() });
    setEditIndex(null);
    setEditedName('');
  };

  const deleteCategory = (i) => {
    if (window.confirm('Remove this category?')) {
      dispatch({ type: 'DELETE_CATEGORY', index: i });
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
        {state.categories.map((cat, i) => (
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
                <span>{cat}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(i, cat)}
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
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
