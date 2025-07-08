import React, { useState, useEffect } from "react";

const ReportOutput = ({ reportData }) => {
  const [settings, setSettings] = useState(null);
  const [leftLogoBase64, setLeftLogoBase64] = useState(null);
  const [rightLogoBase64, setRightLogoBase64] = useState(2);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:5000/settings");
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Handle loading state
  if (!settings) return <div>Loading report...</div>;

  // Assign color to score
  const getScoreColor = (score) => {
    if (score >= settings.highThreshold) return "bg-red-600";
    if (score >= 4) return "bg-yellow-500";
    return "bg-green-600";
  };

  // Style active/inactive text
  const getTextStyle = (isActive) =>
    isActive ? "text-gray-900 font-semibold" : "text-gray-400";

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // PDF Download functionality
  const downloadPDF = async () => {
    if (!reportData || reportData.length === 0) {
      alert("Please generate a report first by filling in all the scores.");
      return;
    }

    // Dynamically import jsPDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height; // 297mm for A4
    const pageWidth = doc.internal.pageSize.width; // 210mm for A4

    // Function to add logos to each page
    const addLogosToPage = () => {
      // Left logo
      if (leftLogoBase64) {
        try {
          doc.addImage(leftLogoBase64, "PNG", 10, pageHeight - 25, 30, 10);
        } catch (e) {
          console.warn("Could not add left logo:", e);
        }
      }
      // Right logo
      if (rightLogoBase64) {
        try {
          doc.addImage(
            rightLogoBase64,
            "PNG",
            pageWidth - 40,
            pageHeight - 25,
            30,
            10
          );
        } catch (e) {
          console.warn("Could not add right logo:", e);
        }
      }
    };

    // Header
    doc.setFillColor(...hexToRgb(settings.headerColor || "#16a34a"));
    doc.rect(10, 10, pageWidth - 20, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text(settings.title || "GENOMICS & DIET", pageWidth / 2, 22, {
      align: "center",
    });

    // Quote and description
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(
      settings.quote || '"YOU ARE WHAT YOU EAT" - Victor Lindlahr',
      pageWidth / 2,
      40,
      { align: "center" }
    );

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const splitDescription = doc.splitTextToSize(
      settings.description || "",
      pageWidth - 30
    );
    doc.text(splitDescription, 15, 50);

    // Add logos to first page
    addLogosToPage();

    let yPosition = 65 + splitDescription.length * 4;
    let currentCategory = "";

    // Generate report content
    reportData.forEach((item, index) => {
      const { field, score } = item;
      const showHigh = score >= settings.highThreshold;
      const showNormal = score >= 4 && score < settings.highThreshold;
      const showLow = score < 4;

      // Add category header if needed
      if (field.category && field.category !== currentCategory) {
        currentCategory = field.category;

        // Check if we need a new page for category header
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          addLogosToPage();
          yPosition = 20;
        }

        doc.setFillColor(220, 220, 220);
        doc.rect(10, yPosition, pageWidth - 20, 8, "F");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(currentCategory, 15, yPosition + 5);
        yPosition += 12;
      }

      // Estimate content height before adding
      const tempHighText = doc.splitTextToSize(
        field.high.replace(/\n/g, " "),
        (pageWidth - 40) / 5 - 5
      );
      const tempNormalText = doc.splitTextToSize(
        field.normal ? field.normal.replace(/\n/g, " ") : "",
        (pageWidth - 40) / 5 - 5
      );
      const tempLowText = doc.splitTextToSize(
        field.low.replace(/\n/g, " "),
        (pageWidth - 40) / 5 - 5
      );

      const estimatedHeight =
        Math.max(
          tempHighText.length,
          tempNormalText.length,
          tempLowText.length,
          1
        ) *
          3.5 +
        15;

      // Check if we need a new page
      if (yPosition + estimatedHeight > pageHeight - 15) {
        doc.addPage();
        addLogosToPage();
        yPosition = 20;
      }

      // Dynamic column layout based on page width
      const leftMargin = 10;
      const rightMargin = 10;
      const usableWidth = pageWidth - leftMargin - rightMargin;
      const columnSpacing = usableWidth / 5;

      // Calculate positions for equal spacing
      const fieldLabelX = leftMargin;
      const scoreCircleX = leftMargin + columnSpacing * 1.5;
      const highX = leftMargin + columnSpacing * 2;
      const normalX = leftMargin + columnSpacing * 3;
      const lowX = leftMargin + columnSpacing * 4;

      const colWidth = columnSpacing - 3;

      // Field label and score section
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);

      // Field label (first column)
      doc.text(field.label, fieldLabelX, yPosition + 4);

      // Score circle (second column)
      const scoreColor =
        score >= settings.highThreshold
          ? hexToRgb(settings.colors.high)
          : score >= 4
          ? hexToRgb(settings.colors.medium)
          : hexToRgb(settings.colors.low);
      doc.setFillColor(...scoreColor);
      const circleY = yPosition + 4;
      doc.circle(scoreCircleX, circleY, 4, "F");

      // Score number in circle
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text(score.toString(), scoreCircleX, circleY + 1.5, {
        align: "center",
      });

      // Reset text color for recommendations
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);

      // HIGH column (third column)
      const highColor = showHigh ? [0, 0, 0] : [156, 163, 175];
      doc.setTextColor(...highColor);
      doc.setFont(undefined, "bold");
      doc.text("HIGH", highX, yPosition + 2);
      doc.setFont(undefined, "normal");
      const highText = doc.splitTextToSize(
        field.high.replace(/\n/g, " "),
        colWidth
      );
      doc.text(highText, highX, yPosition + 6);

      // NORMAL column (fourth column)
      const normalColor = showNormal ? [0, 0, 0] : [156, 163, 175];
      doc.setTextColor(...normalColor);
      doc.setFont(undefined, "bold");
      doc.text("NORMAL", normalX, yPosition + 2);
      doc.setFont(undefined, "normal");
      const normalText = doc.splitTextToSize(
        field.normal ? field.normal.replace(/\n/g, " ") : "",
        colWidth
      );
      doc.text(normalText, normalX, yPosition + 6);

      // LOW column (fifth column)
      const lowColor = showLow ? [0, 0, 0] : [156, 163, 175];
      doc.setTextColor(...lowColor);
      doc.setFont(undefined, "bold");
      doc.text("LOW", lowX, yPosition + 2);
      doc.setFont(undefined, "normal");
      const lowText = doc.splitTextToSize(
        field.low.replace(/\n/g, " "),
        colWidth
      );
      doc.text(lowText, lowX, yPosition + 6);

      // Calculate next Y position based on the tallest column
      const maxLines = Math.max(
        highText.length,
        normalText.length,
        lowText.length,
        1
      );
      yPosition += maxLines * 3.2 + 10;

      // Add a thin separator line (but not after the last item)
      if (index < reportData.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(10, yPosition - 4, pageWidth - 10, yPosition - 4);
      }
    });

    // Save the PDF
    doc.save("genomics-diet-report.pdf");
  };

  if (!reportData || reportData.length === 0) {
    return (
      <div className="w-full md:w-1/2 p-4 md:p-8 mobile-section bg-gray-50">
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center text-gray-500">
          Fill in the form and generate report to view results here.
        </div>
      </div>
    );
  }

  let currentCategory = null;

  return (
    <div className="w-full md:w-1/2 p-4 md:p-8 mobile-section bg-gray-50 overflow-y-auto">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        {/* PDF Download Button */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibizer transition-colors"
          >
            Download PDF Report
          </button>
        </div>

        {reportData.map((item, index) => {
          const { field, score, showHigh, showNormal, showLow } = item;
          const isNewCategory =
            field.category && field.category !== currentCategory;
          const elements = [];

          // Add category header if changed
          if (isNewCategory) {
            currentCategory = field.category;
            elements.push(
              <div
                key={`category-${field.category}`}
                className="bg-gray-200 px-4 py-2 font-bold text-sm text-gray-700 border-l-4 border-gray-400"
              >
                {currentCategory}
              </div>
            );
          }

          // Add field row
          elements.push(
            <div
              key={field.id}
              className="flex flex-col md:flex-row items-stretch border-b border-gray-200"
            >
              {/* Field Label */}
              <div className="w-full md:w-48 px-3 py-3 text-center md:text-right bg-gray-100 md:bg-white">
                <div className="text-xs font-bold text-gray-700 uppercase leading-tight">
                  {field.label}
                </div>
              </div>

              {/* Score */}
              <div className="w-full md:w-16 flex justify-center items-center py-3">
                <div
                  className={`w-10 h-10 ${getScoreColor(
                    score
                  )} text-white font-bold text-lg flex items-center justify-center rounded-full`}
                >
                  {score}
                </div>
              </div>

              {/* Recommendations */}
              <div className="flex-1 px-3 py-3 flex flex-col md:flex-row">
                {/* High */}
                <div className="w-full md:w-1/3 md:pr-2 mb-3 md:mb-0">
                  <div
                    className={`text-xs font-bold mb-1 ${getTextStyle(
                      showHigh
                    )}`}
                  >
                    HIGH
                  </div>
                  <div
                    className={`text-xs leading-tight ${getTextStyle(
                      showHigh
                    )}`}
                  >
                    {field.high.split("\n").map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Normal */}
                <div className="w-full md:w-1/3 md:px-2 mb-3 md:mb-0">
                  <div
                    className={`text-xs font-bold mb-1 ${getTextStyle(
                      showNormal
                    )}`}
                  >
                    NORMAL
                  </div>
                  <div
                    className={`text-ys leading-tight ${getTextStyle(
                      showNormal
                    )}`}
                  >
                    {field.normal?.split("\n").map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Low */}
                <div className="w-full md:w-1/3 md:pl-2">
                  <div
                    className={`text-xs font-bold mb-1 ${getTextStyle(
                      showLow
                    )}`}
                  >
                    LOW
                  </div>
                  <div
                    className={`text-xs leading-tight ${getTextStyle(showLow)}`}
                  >
                    {field.low.split("\n").map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );

          return elements;
        })}
      </div>
    </div>
  );
};

export default ReportOutput;
