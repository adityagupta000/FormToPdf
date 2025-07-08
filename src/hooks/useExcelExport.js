import * as XLSX from "xlsx";

export const useExcelExport = () => {
  const exportToExcel = (reportData) => {
    if (!reportData || reportData.length === 0) {
      alert("No report data to export.");
      return;
    }

    const exportRows = reportData.map((item) => {
      const { field, score, showHigh, showNormal, showLow } = item;

      let recommendation = "";
      if (showHigh) recommendation = field.high;
      else if (showNormal) recommendation = field.normal;
      else if (showLow) recommendation = field.low;

      return {
        Field: field.label,
        Category: field.category || "Uncategorized",
        Score: score,
        Recommendation: recommendation.replace(/\n/g, " "),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Genomics Report");

    XLSX.writeFile(workbook, "genomics_diet_report.xlsx");
  };

  return { exportToExcel };
};
