import React, { createContext, useContext, useReducer, useEffect } from "react";

// Base URL of your json-server
const API_URL = "http://localhost:5000";

const formConfigReducer = (state, action) => {
  switch (action.type) {
    case "IMPORT_CONFIG":
      return { ...action.config };

    case "ADD_FIELD":
      return { ...state, fields: [...state.fields, action.field] };

    case "UPDATE_FIELD":
      if (action.property === "full") {
        return {
          ...state,
          fields: state.fields.map((field, i) =>
            i === action.index ? action.value : field
          ),
        };
      }
      return {
        ...state,
        fields: state.fields.map((field, i) =>
          i === action.index
            ? { ...field, [action.property]: action.value }
            : field
        ),
      };

    case "DELETE_FIELD":
      return {
        ...state,
        fields: state.fields.filter((_, i) => i !== action.index),
      };

    case "REORDER_FIELDS":
      return { ...state, fields: action.fields };

    case "UPDATE_SETTINGS":
      return { ...state, ...action.settings };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [
          ...state.categories,
          { id: Date.now(), name: action.name },
        ],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat, i) =>
          i === action.index ? { ...cat, name: action.newName } : cat
        ),
        fields: state.fields.map((field) =>
          field.category === state.categories[action.index]?.name
            ? { ...field, category: action.newName }
            : field
        ),
      };

    case "DELETE_CATEGORY":
      const catName = state.categories[action.index]?.name;
      return {
        ...state,
        categories: state.categories.filter((_, i) => i !== action.index),
        fields: state.fields.map((field) =>
          field.category === catName ? { ...field, category: "" } : field
        ),
      };

    default:
      return state;
  }
};

const FormConfigContext = createContext(null);

export const FormConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formConfigReducer, {
    title: "",
    quote: "",
    description: "",
    headerColor: "",
    colors: { low: "", medium: "", high: "" },
    highThreshold: 6,
    categories: [],
    fields: [],
  });

  // 🔁 Load config from json-server at startup
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const [settingsRes, categoriesRes, fieldsRes] = await Promise.all([
          fetch(`${API_URL}/settings`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/fields`),
        ]);

        const settings = await settingsRes.json();
        const categories = await categoriesRes.json();
        const fields = await fieldsRes.json();

        dispatch({
          type: "IMPORT_CONFIG",
          config: {
            ...settings,
            categories, // array of { id, name }
            fields, // array of full field objects
          },
        });
      } catch (err) {
        console.error("Failed to fetch config from API", err);
      }
    };

    loadFromServer();
  }, []);

  return (
    <FormConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </FormConfigContext.Provider>
  );
};

export const useFormConfig = () => {
  const context = useContext(FormConfigContext);
  if (!context)
    throw new Error("useFormConfig must be used within a FormConfigProvider");
  return context;
};