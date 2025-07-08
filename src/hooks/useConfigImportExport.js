import { useCallback } from "react";
import { useFormConfig } from "../contexts/FormConfigContext";

const API_URL = "http://localhost:5000";

export const useConfigImportExport = () => {
  const { state, dispatch } = useFormConfig();

  // ⬇️ Export config from current state to file
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

  // ⬆️ Import config and write to all backend endpoints
  const importConfig = useCallback(
    async (file) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);

          // Validate structure
          if (
            !parsed.fields ||
            !parsed.categories ||
            !parsed.title ||
            !parsed.colors
          ) {
            alert("Invalid configuration file.");
            return;
          }

          // ⚠️ Overwrite ALL current data via PUT/DELETE/POST
          await Promise.all([
            // Clear old fields
            fetch(`${API_URL}/fields`)
              .then((res) => res.json())
              .then((existing) =>
                Promise.all(
                  existing.map((f) =>
                    fetch(`${API_URL}/fields/${f.id}`, { method: "DELETE" })
                  )
                )
              ),

            // Clear old categories
            fetch(`${API_URL}/categories`)
              .then((res) => res.json())
              .then((existing) =>
                Promise.all(
                  existing.map((c) =>
                    fetch(`${API_URL}/categories/${c.id}`, { method: "DELETE" })
                  )
                )
              ),
          ]);

          // ✅ Upload settings
          await fetch(`${API_URL}/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: parsed.title,
              quote: parsed.quote,
              description: parsed.description,
              headerColor: parsed.headerColor,
              colors: parsed.colors,
              highThreshold: parsed.highThreshold,
            }),
          });

          // ✅ Upload categories
          for (const cat of parsed.categories) {
            await fetch(`${API_URL}/categories`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                typeof cat === "string" ? { name: cat } : cat
              ),
            });
          }

          // ✅ Upload fields
          for (const field of parsed.fields) {
            await fetch(`${API_URL}/fields`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(field),
            });
          }

          // ✅ Dispatch to update UI immediately
          dispatch({ type: "IMPORT_CONFIG", config: parsed });
          alert("✅ Configuration imported and saved to server.");
        } catch (err) {
          console.error(err);
          alert("❌ Error importing config: " + err.message);
        }
      };

      reader.readAsText(file);
    },
    [dispatch]
  );

  return { exportConfig, importConfig };
};
