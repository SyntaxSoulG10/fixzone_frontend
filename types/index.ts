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

export interface Company {
    id: number;
    name: string;
    owner: string;
    domain: string;
    plan: 'Enterprise' | 'Pro' | 'Basic';
    centers: number;
    status: 'Active' | 'Trial' | 'Suspended';
}

export interface Center {
    id: number;
    name: string;
    company: string;
    location: string;
    manager: string;
    status: 'Active' | 'Maintenance';
}

export interface Vehicle {
    id: number;
    plate: string;
    model: string;
    owner: string;
    lastService?: string;
    condition?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    history?: string;
    status?: string;
}

export interface Job {
    id: string;
    customer: string;
    vehicle: string;
    center?: string;
    technician?: string;
    status: 'In Progress' | 'Completed' | 'Pending' | 'Cancelled' | 'Waiting Parts';
    amount?: string;
    date?: string;
    due?: string;
}
