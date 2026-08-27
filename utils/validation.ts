/**
 * Centralized validation utilities to reduce code duplication across tabs.
 * These functions ensure consistent validation across the entire dashboard.
 */

/**
 * Phone validation regex pattern that supports:
 * - International format: +94 xxx xxx xxxx
 * - Standard format: 0712345678
 * - Extensions: +1-234-567-8900
 */
export const PHONE_REGEX = /^[\d+\s\-\(\)]{10,15}$/;

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate phone number format
 * @param phone - Phone number string
 * @returns true if valid, false otherwise
 */
export const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    return PHONE_REGEX.test(phone);
};

/**
 * Validate email format
 * @param email - Email address string
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    return EMAIL_REGEX.test(email);
};

/**
 * Validate minimum string length
 * @param value - String to validate
 * @param minLength - Minimum required length
 * @returns true if valid, false otherwise
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
    return !!(value && value.trim().length >= minLength);
};

/**
 * Validate price within acceptable range
 * @param price - Price value
 * @param minPrice - Minimum allowed price
 * @param maxPrice - Maximum allowed price
 * @returns true if valid, false otherwise
 */
export const validatePrice = (
    price: number,
    minPrice: number = 0,
    maxPrice: number = 1000000
): boolean => {
    return price >= minPrice && price <= maxPrice;
};

/**
 * Validate duration within acceptable range
 * @param duration - Duration in minutes
 * @param minDuration - Minimum allowed duration
 * @param maxDuration - Maximum allowed duration
 * @returns true if valid, false otherwise
 */
export const validateDuration = (
    duration: number,
    minDuration: number = 5,
    maxDuration: number = 1440
): boolean => {
    return duration >= minDuration && duration <= maxDuration;
};

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns true if valid (startDate <= endDate), false otherwise
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true; // Allow empty dates
    return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate required fields
 * @param field - Field value
 * @param fieldName - Name of the field for error messages
 * @returns error message or empty string if valid
 */
export const validateRequired = (field: string | undefined, fieldName: string): string => {
    if (!field || field.trim().length === 0) {
        return `${fieldName} is required`;
    }
    return "";
};

/**
 * Validate a number is not zero
 * @param value - Numeric value
 * @param fieldName - Name of the field for error messages
 * @returns error message or empty string if valid
 */
export const validateNonZero = (value: number, fieldName: string): string => {
    if (value === 0 || value === undefined) {
        return `${fieldName} must be greater than 0`;
    }
    return "";
};

/**
 * Validate array is not empty
 * @param array - Array to validate
 * @param fieldName - Name of the field for error messages
 * @returns error message or empty string if valid
 */
export const validateArrayNotEmpty = (array: any[], fieldName: string): string => {
    if (!array || array.length === 0) {
        return `At least one ${fieldName} is required`;
    }
    return "";
};
