/**
 * Utility functions for number formatting
 * These formatters avoid ReDoS vulnerabilities by using safe algorithms
 */

/**
 * Formats a number with thousand separators (dots)
 * Example: 1234567 -> "1.234.567"
 * @param value - The number to format
 * @returns Formatted string with dots as thousand separators
 */
export const formatNumberWithDots = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const stringValue = String(value);
  const parts = stringValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Use a safe algorithm instead of regex with backtracking
  const formattedInteger = integerPart
    .split('')
    .reverse()
    .reduce((acc, digit, index) => {
      return digit + (index > 0 && index % 3 === 0 ? '.' : '') + acc;
    }, '');

  return decimalPart === undefined 
    ? formattedInteger
    : `${formattedInteger}.${decimalPart}`;
};

/**
 * Formats a number as currency (Brazilian Real)
 * Example: 1234.56 -> "R$ 1.234,56"
 * @param value - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') {
    return 'R$ 0,00';
  }

  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  
  if (Number.isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  // Format with 2 decimal places
  const fixedValue = numericValue.toFixed(2);
  const [integerPart, decimalPart] = fixedValue.split('.');

  // Use safe algorithm for thousands separator
  const formattedInteger = integerPart
    .split('')
    .reverse()
    .reduce((acc, digit, index) => {
      return digit + (index > 0 && index % 3 === 0 ? '.' : '') + acc;
    }, '');

  return `R$ ${formattedInteger},${decimalPart}`;
};

/**
 * Parses a formatted number string back to a number
 * Removes dots used as thousand separators
 * @param value - The formatted string
 * @returns Parsed number
 */
export const parseFormattedNumber = (value: string | undefined): number => {
  if (!value) {
    return 0;
  }

  // Remove all dots (thousand separators) and 'R$' prefix if present
  const cleaned = value.replaceAll(/R\$\s?|\./g, '');
  const parsed = Number.parseFloat(cleaned);
  
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Parses a currency string back to a number
 * Handles both dot (thousand separator) and comma (decimal separator)
 * @param value - The currency string (e.g., "R$ 1.234,56")
 * @returns Parsed number
 */
export const parseCurrency = (value: string | undefined): number => {
  if (!value) {
    return 0;
  }

  // Remove 'R$' and spaces, replace comma with dot for decimal
  const cleaned = value.replaceAll(/R\$\s?/g, '').replaceAll('.', '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  
  return Number.isNaN(parsed) ? 0 : parsed;
};

