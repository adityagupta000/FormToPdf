import { useCallback } from "react";
import { jsPDF } from "jspdf";
import { useFormConfig } from "../contexts/FormConfigContext";
import { hexToRgb } from "../utils/helpers";

export const usePDFGeneration = () => {
  const { state } = useFormConfig();

  // Base64 logo (optional)
  const leftLogoUrl = "/left.png";
  const rightLogoUrl = "/right.png";

  const generatePDF = useCallback(
    (reportData) => {
      if (!reportData || reportData.length === 0) {
        alert("No report data found.");
        return;
      }

      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      let y = 20;

      // -----------------------------
      // Header section
      // -----------------------------
      doc.setFillColor(...hexToRgb(state.headerColor));
      doc.rect(margin, y, pageWidth - margin * 2, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text(state.title, pageWidth / 2, y + 13, { align: "center" });
      y += 30;

      // Quote
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text(state.quote, pageWidth / 2, y, { align: "center" });
      y += 10;

      // Description
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(
        state.description,
        pageWidth - 2 * margin
      );
      doc.text(descLines, margin, y);
      y += descLines.length * 5 + 5;

      let currentCategory = null;

      reportData.forEach((item, index) => {
        const { field, score, showHigh, showNormal, showLow } = item;

        // Insert page break if needed
        const estimatedFieldHeight = 40; // Rough estimate
        if (y + estimatedFieldHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        // Render category title if needed
        if (field.category && field.category !== currentCategory) {
          currentCategory = field.category;
          doc.setFontSize(12);
          doc.setFont(undefined, "bold");
          doc.setTextColor(50, 50, 50);
          doc.text(currentCategory, margin, y);
          y += 8;
        }

        // Field Label
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(field.label, margin, y);
        y += 6;

        // Score Circle
        const circleX = margin + 5;
        doc.setDrawColor(0);
        const rgb =
          score >= state.highThreshold
            ? hexToRgb(state.colors.high)
            : score >= 4
            ? hexToRgb(state.colors.medium)
            : hexToRgb(state.colors.low);

        doc.setFillColor(...rgb);
        doc.circle(circleX, y + 5, 4, "FD");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(String(score), circleX, y + 6, { align: "center" });

        y += 12;

        // Render matching text
        const renderTextBlock = (label, text, active) => {
          if (!text) return;
          doc.setFontSize(9);
          doc.setFont(undefined, "bold");
          doc.setTextColor(
            active ? 0 : 180,
            active ? 0 : 180,
            active ? 0 : 180
          );
          doc.text(`${label}:`, margin, y);
          y += 5;

          doc.setFont(undefined, "normal");
          const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
          lines.forEach((line) => {
            if (y + 6 > pageHeight - 15) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin, y);
            y += 5;
          });
          y += 2;
        };

        renderTextBlock("HIGH", field.high, showHigh);
        renderTextBlock("NORMAL", field.normal, showNormal);
        renderTextBlock("LOW", field.low, showLow);

        y += 4;
      });

      // Footer (optional logos)
      const addLogos = () => {
        try {
          doc.addImage(leftLogoUrl, "PNG", 10, pageHeight - 20, 30, 10);
          doc.addImage(
            rightLogoUrl,
            "PNG",
            pageWidth - 40,
            pageHeight - 20,
            30,
            10
          );
        } catch (e) {
          console.warn("Logo failed to load. Skipping...");
        }
      };
      addLogos();

      // Save file
      doc.save("genomics-diet-report.pdf");
    },
    [state]
  );

  return { generatePDF };
};
