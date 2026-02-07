export interface User {
    id: number | string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Company Owner' | 'Service Manager' | 'Customer' | 'Owner' | 'Manager';
    status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
    lastLogin: string;
    joinedDate?: string;
    activity?: string;
}

export interface Subscription {
    id: string;
    stationName: string;
    plan: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
    price: string;
    startDate: string;
    nextBilling: string;
    status: 'Active' | 'Expired' | 'Cancelled';
    autoRenew: boolean;
}

export interface SystemMetric {
    title: string;
    status: 'Healthy' | 'Online' | 'Operational' | 'Connected' | 'Down' | 'Degraded';
    subtext: string;
}

export interface ActivityLog {
    id: number;
    title: string;
    time: string;
    type: 'success' | 'warning' | 'error' | 'info';
}

export interface PlatformStat {
    title: string;
    value: string;
    sub?: string;
}




