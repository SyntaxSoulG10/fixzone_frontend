// Format amount to USD currency string
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Convert ISO date string to readable format (e.g., "Jan 15, 2026")
export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Retrieve user role from localStorage (client-side only)
export const getUserRole = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole');
    }
    return null;
};
