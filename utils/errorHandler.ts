/**
 * Centralized error handling for API and form validation errors.
 * Ensures consistent error messages across the entire application.
 */

import axios, { AxiosError } from 'axios';

/**
 * Extract error message from various error sources
 * @param error - Error object from API, form validation, or generic Error
 * @returns Readable error message string
 */
export const getErrorMessage = (error: any): string => {
    // Handle axios/fetch response errors
    if (axios.isAxiosError(error)) {
        return getAxiosErrorMessage(error);
    }

    // Handle generic Error objects
    if (error instanceof Error) {
        return error.message || 'An unexpected error occurred';
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }

    // Handle object with message property
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }

    // Fallback
    return 'An unexpected error occurred';
};

/**
 * Extract detailed error message from axios error
 * @param error - Axios error object
 * @returns Readable error message string
 */
export const getAxiosErrorMessage = (error: AxiosError<any>): string => {
    // Try response data first
    if (error.response?.data) {
        const data = error.response.data;

        // Check for details field (custom format)
        if (data.details && typeof data.details === 'string') {
            return data.details;
        }

        // Check for message field
        if (data.message && typeof data.message === 'string') {
            return data.message;
        }

        // Check for error field
        if (data.error && typeof data.error === 'string') {
            return data.error;
        }

        // Check for errors array (validation errors)
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors.map((e: any) => 
                typeof e === 'string' ? e : e.message || JSON.stringify(e)
            ).join(', ');
        }
    }

    // Try status-based messages
    if (error.response?.status) {
        switch (error.response.status) {
            case 400:
                return 'Invalid request. Please check your input.';
            case 401:
                return 'Authentication failed. Please log in again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'This action conflicts with existing data.';
            case 422:
                return 'The submitted data is invalid.';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
                return 'Server error. Please try again later.';
            case 503:
                return 'Service temporarily unavailable. Please try again later.';
        }
    }

    // Try request error
    if (error.request && !error.response) {
        return 'Network error. Please check your connection.';
    }

    // Try error message
    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Validate and sanitize form data before submission
 * @param data - Form data object
 * @param requiredFields - Array of required field names
 * @returns Object with validation result and errors
 */
export const validateFormData = (
    data: Record<string, any>,
    requiredFields: string[]
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
            errors[field] = `${field} is required`;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Check if error is due to network connectivity
 * @param error - Error object
 * @returns true if network error, false otherwise
 */
export const isNetworkError = (error: any): boolean => {
    if (axios.isAxiosError(error)) {
        return !error.response && !!error.request;
    }
    return false;
};

/**
 * Check if error is due to authentication
 * @param error - Error object
 * @returns true if auth error, false otherwise
 */
export const isAuthError = (error: any): boolean => {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 401 || error.response?.status === 403;
    }
    return false;
};

/**
 * Check if error is due to validation
 * @param error - Error object
 * @returns true if validation error, false otherwise
 */
export const isValidationError = (error: any): boolean => {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 400 || error.response?.status === 422;
    }
    return false;
};

/**
 * Check if error is a conflict (duplicate, etc.)
 * @param error - Error object
 * @returns true if conflict error, false otherwise
 */
export const isConflictError = (error: any): boolean => {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 409;
    }
    return false;
};

/**
 * Check if error is a timeout/rate limit
 * @param error - Error object
 * @returns true if timeout/rate limit error, false otherwise
 */
export const isTimeoutError = (error: any): boolean => {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 429 || error.code === 'ECONNABORTED';
    }
    return false;
};

/**
 * Check if error is a server error
 * @param error - Error object
 * @returns true if server error, false otherwise
 */
export const isServerError = (error: any): boolean => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        return status >= 500;
    }
    return false;
};
