// Convert HEX color to RGB array for jsPDF
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
}

// Simple validation helper
export const isValidScore = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= 1 && num <= 10;
};
