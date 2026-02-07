import { User } from "@/types";

export const MOCK_USERS: User[] = [
    { id: "USR-1203", name: "John Anderson", email: "johna@example.com", role: "Customer", status: "Pending", lastLogin: "2 mins ago", joinedDate: "Nov 8, 2024", activity: "3 Bookings" },
    { id: "USR-1204", name: "Lisa Brown", email: "lisab@example.com", role: "Owner", status: "Active", lastLogin: "1 hour ago", joinedDate: "Nov 7, 2024", activity: "1 Bookings" },
    { id: "USR-1205", name: "Robert Taylor", email: "robertt@example.com", role: "Customer", status: "Active", lastLogin: "3 days ago", joinedDate: "Oct 15, 2024", activity: "AutoCare Plus" },
    { id: "USR-1206", name: "Anna Garcia", email: "annagarcia@example.com", role: "Manager", status: "Pending", lastLogin: "5 hours ago", joinedDate: "Oct 5, 2024", activity: "Express service Hub" },
    { id: "BK-0005", name: "Oliver Tuwin", email: "olivertuwin@example.com", role: "Customer", status: "Active", lastLogin: "1 day ago", joinedDate: "Sept 11, 2024", activity: "2 Bookings" },
    { id: "BK-0001", name: "Nike Fernando", email: "nikefernando@example.com", role: "Customer", status: "Pending", lastLogin: "10 mins ago", joinedDate: "Aug 2, 2024", activity: "Oil Changing" },
];

export interface Station {
    id: string;
    name: string;
    owner: string;
    location: string;
    ratings: number;
    bookings: number;
    revenue: string;
    plan: 'Basic' | 'Standard' | 'Premium';
    status: 'Active' | 'Pending' | 'Suspended';
}

export const MOCK_STATIONS: Station[] = [
    { id: "SS-001", name: "AutoCare Plus", owner: "Michael Chen", location: "San Francisco, CA", ratings: 4.2, bookings: 156, revenue: "$5,740", plan: "Basic", status: "Pending" },
    { id: "SS-002", name: "QuickFix Service", owner: "Sarah Johnson", location: "Los Angeles, CA", ratings: 3.8, bookings: 98, revenue: "$18,600", plan: "Standard", status: "Active" },
    { id: "USR-1205", name: "Robert Taylor", owner: "David Martinez", location: "San Diego, CA", ratings: 2.9, bookings: 103, revenue: "$8,320", plan: "Standard", status: "Active" },
    { id: "USR-1206", name: "Anna Garcia", owner: "Emma Wilson", location: "Sacramento, CA", ratings: 4.1, bookings: 225, revenue: "$12,450", plan: "Basic", status: "Pending" },
    { id: "SS-003", name: "Premium Auto Care", owner: "Michael ven", location: "San Francisco, CA", ratings: 3.9, bookings: 451, revenue: "$18,900", plan: "Premium", status: "Active" },
    { id: "SS-004", name: "Express Service Hub", owner: "David Alfred", location: "San Diego, CA", ratings: 3.1, bookings: 252, revenue: "$5,890", plan: "Basic", status: "Active" },
];

export const MOCK_SUBSCRIPTIONS = [
    { id: "SUB-001", stationName: "Michael Chen", plan: "Premium", price: "$199/monthly", startDate: "Jan 15, 2024", nextBilling: "Feb, 15, 2024", status: "Active", autoRenew: true },
    { id: "SUB-002", stationName: "Sarah Johnson", plan: "Basic", price: "$99/monthly", startDate: "Feb 1, 2024", nextBilling: "March, 1, 2024", status: "Active", autoRenew: true },
    { id: "SUB-003", stationName: "David Martinez", plan: "Basic", price: "$199/monthly", startDate: "Dec 10, 2023", nextBilling: "Jan, 10, 2024", status: "Active", autoRenew: true },
    { id: "SUB-004", stationName: "Emma Wilson", plan: "Premium", price: "$49/monthly", startDate: "Nov 9, 2024", nextBilling: "Dec, 9, 2024", status: "Active", autoRenew: false },
];
