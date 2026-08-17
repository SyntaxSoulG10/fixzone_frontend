export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const getUserRole = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole');
    }
    return null;
};

/**
 * Standard RFC-compliant email validation regex:
 * - Requires standard local part before @
 * - Requires valid hostname/domain with valid dots/hyphens
 * - Requires top-level domain (TLD) of at least 2 alphabetic characters
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const BLOCKED_EMAIL_DOMAINS = new Set([
    'example.com', 'example.org', 'example.net',
    'test.com', 'test.org', 'test.net',
    'sample.com', 'sample.org', 'sample.net',
    'fake.com', 'demo.com', 'dummy.com', 'invalid.com',
    'mailinator.com', 'tempmail.com', '10minutemail.com',
    'guerrillamail.com', 'trashmail.com', 'yopmail.com',
    'sharklasers.com', 'getairmail.com', 'dispostable.com'
]);

export const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length === 0 || trimmed.length > 254) return false;
    if (!EMAIL_REGEX.test(trimmed)) return false;
    const parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    if (BLOCKED_EMAIL_DOMAINS.has(domain)) return false;
    return true;
};
