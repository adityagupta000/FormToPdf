import React from "react";
import { useFormConfig } from "../../contexts/FormConfigContext";

const ReportOutput = ({ reportData }) => {
  const { state } = useFormConfig();

  // Assign color to score
  const getScoreColor = (score) => {
    if (score >= state.highThreshold) return "bg-red-600";
    if (score >= 4) return "bg-yellow-500";
    return "bg-green-600";
  };

  // Style active/inactive text
  const getTextStyle = (isActive) =>
    isActive ? "text-gray-900 font-semibold" : "text-gray-400";

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
                    className={`text-xs leading-tight ${getTextStyle(
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
