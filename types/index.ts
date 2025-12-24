export interface User {
    id: number;
    name: string;
    email: string;
    role: 'Super Admin' | 'Company Owner' | 'Service Manager' | 'Customer';
    status: 'Active' | 'Inactive' | 'Suspended';
    lastLogin: string;
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
