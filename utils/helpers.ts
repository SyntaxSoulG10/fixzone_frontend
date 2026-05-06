/**
 * Format amount to LKR currency string (Sri Lanka Rupees)
 * @param amount - Numeric value to format
 * @returns Formatted currency string (e.g., "Rs. 1,234.56")
 */
export const formatCurrency = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Rs. 0.00';
    }
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Convert ISO date string to readable format (e.g., "Jan 15, 2026")
 * @param dateString - ISO date string or Date object
 * @param timezone - Optional timezone (default: user's local timezone)
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date, timezone?: string): string => {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        
        return date.toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid date';
    }
};

/**
 * Format date with time (e.g., "Jan 15, 2026, 2:30 PM")
 * @param dateString - ISO date string or Date object
 * @param timezone - Optional timezone (default: user's local timezone)
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date, timezone?: string): string => {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        
        return date.toLocaleDateString('en-US', options);
    } catch {
        return 'Invalid date';
    }
};

/**
 * Get time difference from now (e.g., "2 hours ago")
 * Safely handles null/undefined dates
 * @param dateString - ISO date string or Date object
 * @returns Human-readable time difference
 */
export const getTimeAgo = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'Never';
    
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch {
        return 'Invalid date';
    }
};

/**
 * Validate date range
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns true if valid (startDate <= endDate), false otherwise
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true; // Allow empty dates
    try {
        return new Date(startDate) <= new Date(endDate);
    } catch {
        return false;
    }
};

/**
 * Get current timezone
 * @returns Current timezone identifier (e.g., "Asia/Colombo")
 */
export const getCurrentTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Retrieve user role from localStorage (client-side only)
 */
export const getUserRole = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole');
    }
    return null;
};
