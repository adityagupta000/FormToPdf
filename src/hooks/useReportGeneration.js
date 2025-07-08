import { useState, useCallback } from 'react';
import { useFormConfig } from '../contexts/FormConfigContext';
import { isValidScore } from '../utils/helpers';

/**
 * Hook: useReportGeneration
 * Transforms form input into structured report data based on score thresholds
 */
export const useReportGeneration = () => {
  const { state } = useFormConfig(); // Get field config and settings from context
  const [reportData, setReportData] = useState([]);

  /**
   * generateReport
   * @param {Object} formData - { fieldId: score }
   */
  const generateReport = useCallback((formData) => {
    const processedData = [];

    // Loop through all fields from config
    state.fields.forEach((field) => {
      const rawValue = formData[field.id];
      const score = parseInt(rawValue);

      if (!isValidScore(score)) {
        return; // Skip invalid scores
      }

      // Determine logic: high / normal / low
      const isHigh = score >= state.highThreshold;
      const isNormal = score >= 4 && score < state.highThreshold;
      const isLow = score < 4;

      processedData.push({
        field,       // full field config
        score,       // numeric score
        showHigh: isHigh,
        showNormal: isNormal,
        showLow: isLow,
      });
    });

    // Update state
    setReportData(processedData);

    // Return for immediate use
    return processedData;
  }, [state.fields, state.highThreshold]);

  return { reportData, generateReport };
};
