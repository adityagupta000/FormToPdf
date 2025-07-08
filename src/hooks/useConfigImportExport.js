import { useCallback } from "react";
import { useFormConfig } from "../contexts/FormConfigContext";

export const useConfigImportExport = () => {
  const { state, dispatch } = useFormConfig();

  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "genomics-form-config.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importConfig = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          dispatch({ type: "IMPORT_CONFIG", config: parsed });
          alert("Configuration imported successfully.");
        } catch (err) {
          alert("Error importing config: " + err.message);
        }
      };
      reader.readAsText(file);
    },
    [dispatch]
  );

  return { exportConfig, importConfig };
};
