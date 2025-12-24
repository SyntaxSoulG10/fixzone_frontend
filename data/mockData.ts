import { User, Company, Center, Vehicle, Job } from "@/types";

export const MOCK_USERS: User[] = [
    { id: 1, name: "Alice Johnson", email: "alice@fixzone.com", role: "Super Admin", status: "Active", lastLogin: "2 mins ago" },
    { id: 2, name: "Bob Smith", email: "bob@autofix.com", role: "Company Owner", status: "Active", lastLogin: "1 hour ago" },
    { id: 3, name: "Charlie Brown", email: "charlie@speedyservice.com", role: "Service Manager", status: "Inactive", lastLogin: "3 days ago" },
    { id: 4, name: "David Wilson", email: "david@gmail.com", role: "Customer", status: "Active", lastLogin: "5 hours ago" },
    { id: 5, name: "Eve Davis", email: "eve@luxurycars.com", role: "Company Owner", status: "Active", lastLogin: "1 day ago" },
    { id: 6, name: "Frank Miller", email: "frank@fixit.com", role: "Service Manager", status: "Active", lastLogin: "10 mins ago" },
    { id: 7, name: "Grace Lee", email: "grace@gmail.com", role: "Customer", status: "Suspended", lastLogin: "1 week ago" },
];

export const MOCK_COMPANIES: Company[] = [
    { id: 1, name: "AutoFix Pro", owner: "Bob Smith", domain: "autofix.fixzone.com", plan: "Enterprise", centers: 12, status: "Active" },
    { id: 2, name: "Speedy Service", owner: "Charlie Brown", domain: "speedy.fixzone.com", plan: "Pro", centers: 5, status: "Active" },
    { id: 3, name: "Luxury Cars Hub", owner: "Eve Davis", domain: "luxury.fixzone.com", plan: "Basic", centers: 1, status: "Trial" },
    { id: 4, name: "MotoMenders", owner: "George Harris", domain: "moto.fixzone.com", plan: "Pro", centers: 3, status: "Active" },
    { id: 5, name: "QuickFix Garage", owner: "Ivy Jones", domain: "quickfix.fixzone.com", plan: "Basic", centers: 1, status: "Suspended" },
];

export const MOCK_CENTERS: Center[] = [
    { id: 1, name: "Downtown Branch", company: "AutoFix Pro", location: "New York, NY", manager: "Mike Ross", status: "Active" },
    { id: 2, name: "Westside Hub", company: "AutoFix Pro", location: "Los Angeles, CA", manager: "Rachel Zane", status: "Active" },
    { id: 3, name: "Speedy HQ", company: "Speedy Service", location: "Chicago, IL", manager: "Harvey Specter", status: "Active" },
    { id: 4, name: "Luxury East", company: "Luxury Cars Hub", location: "Miami, FL", manager: "Louis Litt", status: "Maintenance" },
    { id: 5, name: "North Garage", company: "MotoMenders", location: "Seattle, WA", manager: "Donna Paulsen", status: "Active" },
];

export const MOCK_VEHICLES: Vehicle[] = [
    { id: 1, plate: "ABC-1234", model: "Toyota Camry 2022", owner: "David Wilson", lastService: "Dec 10, 2024", condition: "Good" },
    { id: 2, plate: "XYZ-9876", model: "Honda Civic 2020", owner: "Grace Lee", lastService: "Nov 22, 2024", condition: "Excellent" },
    { id: 3, plate: "LMN-4567", model: "Ford F-150 2023", owner: "John Doe", lastService: "Oct 05, 2024", condition: "Fair" },
    { id: 4, plate: "QWE-5544", model: "Tesla Model 3", owner: "Jane Roe", lastService: "Dec 01, 2024", condition: "Good" },
    { id: 5, plate: "ZXC-1122", model: "BMW X5 2021", owner: "Mike Tyson", lastService: "Sep 15, 2024", condition: "Poor" },
];

export const MOCK_JOBS: Job[] = [
    { id: "JB-001", customer: "David Wilson", vehicle: "Toyota Camry", center: "Downtown Branch", status: "In Progress", amount: "$120.00", date: "Dec 24, 2024" },
    { id: "JB-002", customer: "Grace Lee", vehicle: "Honda Civic", center: "Westside Hub", status: "Completed", amount: "$350.50", date: "Dec 23, 2024" },
    { id: "JB-003", customer: "John Doe", vehicle: "Ford F-150", center: "North Garage", status: "Pending", amount: "$0.00", date: "Dec 24, 2024" },
    { id: "JB-004", customer: "Jane Roe", vehicle: "Tesla Model 3", center: "Downtown Branch", status: "Cancelled", amount: "$0.00", date: "Dec 22, 2024" },
    { id: "JB-005", customer: "Mike Tyson", vehicle: "BMW X5", center: "Speedy HQ", status: "In Progress", amount: "$850.00", date: "Dec 24, 2024" },
];
