import { User } from "@/types";

export const MOCK_USERS: User[] = [
    { id: "USR-1206", name: "Kasun Perera", email: "kasun.perera@example.com", role: "Manager", status: "Pending", lastLogin: "5 hours ago", joinedDate: "Oct 5, 2024", activity: "Express service Hub" },
    { id: "BK-0005", name: "Nimali Silva", email: "nimali.silva@example.com", role: "Customer", status: "Active", lastLogin: "1 day ago", joinedDate: "Sept 11, 2024", activity: "2 Bookings" },
    { id: "BK-0001", name: "Dilshan Fernando", email: "dilshan.fernando@example.com", role: "Customer", status: "Pending", lastLogin: "10 mins ago", joinedDate: "Aug 2, 2024", activity: "Oil Changing" },
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
    lastActionBy?: string;
    lastActionTime?: string;
}

export const MOCK_STATIONS: Station[] = [
    { id: "SS-001", name: "AutoMiraj", owner: "Mahen Wijesinghe", location: "Colombo 03", ratings: 4.2, bookings: 156, revenue: "Rs. 5,740", plan: "Basic", status: "Pending" },
    { id: "SS-002", name: "Laugfs Car Care", owner: "Ruwan Alwis", location: "Nugegoda", ratings: 3.8, bookings: 98, revenue: "Rs. 18,600", plan: "Standard", status: "Active" },
    { id: "SS-003", name: "Hybrid Hub", owner: "Sanjeewa Pushpakumara", location: "Kotte", ratings: 2.9, bookings: 103, revenue: "Rs. 8,320", plan: "Standard", status: "Active" },
    { id: "SS-004", name: "United Motors", owner: "Amal Gunawardena", location: "Battaramulla", ratings: 4.1, bookings: 225, revenue: "Rs. 12,450", plan: "Basic", status: "Pending" },
    { id: "SS-005", name: "Toyota Lanka", owner: "Nihal Jayawardena", location: "Wattala", ratings: 3.9, bookings: 451, revenue: "Rs. 18,900", plan: "Premium", status: "Active" },
    { id: "SS-006", name: "Sterling Aftercare", owner: "Roshan De Silva", location: "Malabe", ratings: 3.1, bookings: 252, revenue: "Rs. 5,890", plan: "Basic", status: "Active" },
];

export const MOCK_SUBSCRIPTIONS = [
    { id: "SUB-001", stationName: "Mahen Wijesinghe", plan: "Premium", price: "Rs. 199/monthly", startDate: "Jan 15, 2024", nextBilling: "Feb, 15, 2024", status: "Active", autoRenew: true },
    { id: "SUB-002", stationName: "Ruwan Alwis", plan: "Basic", price: "Rs. 99/monthly", startDate: "Feb 1, 2024", nextBilling: "March, 1, 2024", status: "Active", autoRenew: true },
    { id: "SUB-003", stationName: "Sanjeewa Pushpakumara", plan: "Basic", price: "Rs. 199/monthly", startDate: "Dec 10, 2023", nextBilling: "Jan, 10, 2024", status: "Active", autoRenew: true },
    { id: "SUB-004", stationName: "Amal Gunawardena", plan: "Premium", price: "Rs. 49/monthly", startDate: "Nov 9, 2024", nextBilling: "Dec, 9, 2024", status: "Active", autoRenew: false },
];
