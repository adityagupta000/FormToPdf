import React, { createContext, useContext, useReducer } from "react";
import initialConfig from "../data/formConfig.json";

// --- Reducer Function ---
const formConfigReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        fields: state.fields.map((field, i) =>
          i === action.index
            ? { ...field, [action.property]: action.value }
            : field
        ),
      };

    case "ADD_FIELD":
      return {
        ...state,
        fields: [...state.fields, action.field],
      };

    case "DELETE_FIELD":
      return {
        ...state,
        fields: state.fields.filter((_, i) => i !== action.index),
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        ...action.settings,
      };

    case "IMPORT_CONFIG":
      return {
        ...state,
        ...action.config,
      };

    case "REORDER_FIELDS":
      return {
        ...state,
        fields: action.fields,
      };
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.name],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat, i) =>
          i === action.index ? action.newName : cat
        ),
        fields: state.fields.map((field) =>
          field.category === state.categories[action.index]
            ? { ...field, category: action.newName }
            : field
        ),
      };

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((_, i) => i !== action.index),
        fields: state.fields.map((field) =>
          field.category === state.categories[action.index]
            ? { ...field, category: "" }
            : field
        ),
      };

    default:
      return state;
  }
};

// --- Context Creation ---
const FormConfigContext = createContext(null);

// --- Provider ---
export const FormConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formConfigReducer, initialConfig);

  return (
    <FormConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </FormConfigContext.Provider>
  );
};

// --- Custom Hook ---
export const useFormConfig = () => {
  const context = useContext(FormConfigContext);
  if (!context) {
    throw new Error("useFormConfig must be used within a FormConfigProvider");
  }
  return context;
};
