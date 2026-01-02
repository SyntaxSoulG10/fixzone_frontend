"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiUsers,
    FiBriefcase,
    FiSettings,
    FiTruck,
    FiList,
    FiPieChart,
    FiFileText,
    FiCalendar,
    FiClock,
    FiHome,
    FiTool,
    FiDollarSign,
    FiSmile
} from "react-icons/fi";

const ROLE_MENUS: any = {
    super_admin: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/super-admin' },
        { name: 'Users', icon: FiUsers, href: '/dashboard/super-admin/users' },
        { name: 'Companies', icon: FiBriefcase, href: '/dashboard/super-admin/companies' },
        { name: 'Service Centers', icon: FiTool, href: '/dashboard/super-admin/service-centers' },
        { name: 'Vehicles', icon: FiTruck, href: '/dashboard/super-admin/vehicles' },
        { name: 'Jobs', icon: FiList, href: '/dashboard/super-admin/jobs' },
        { name: 'Settings', icon: FiSettings, href: '/dashboard/super-admin/settings' },
    ],
    company_owner: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/company-owner' },
        { name: 'Service Centers', icon: FiBriefcase, href: '/dashboard/company-owner/centers' },
        { name: 'Bookings', icon: FiCalendar, href: '/dashboard/company-owner/bookings' },
        { name: 'Analytics', icon: FiPieChart, href: '/dashboard/company-owner/analytics' },
        { name: 'Reports', icon: FiFileText, href: '/dashboard/company-owner/reports' },
        { name: 'Managers', icon: FiUsers, href: '/dashboard/company-owner/managers' },
        { name: 'Finance', icon: FiDollarSign, href: '/dashboard/company-owner/finance' },
        { name: 'Customers', icon: FiSmile, href: '/dashboard/company-owner/customers' },
        { name: 'Profile', icon: FiUsers, href: '/dashboard/company-owner/profile' },
    ],
    service_manager: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/service-manager' },
        { name: 'Jobs', icon: FiList, href: '/dashboard/service-manager/jobs' },
        { name: 'Vehicles', icon: FiTruck, href: '/dashboard/service-manager/vehicles' },
        { name: 'Customers', icon: FiUsers, href: '/dashboard/service-manager/customers' },
        { name: 'Reports', icon: FiFileText, href: '/dashboard/service-manager/reports' },
    ],
    customer: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/customer' },
        { name: 'Bookings', icon: FiCalendar, href: '/dashboard/customer/bookings' },
        { name: 'Service History', icon: FiClock, href: '/dashboard/customer/history' },
        { name: 'Notifications', icon: FiList, href: '/dashboard/customer/notifications' },
        { name: 'Profile', icon: FiUsers, href: '/dashboard/customer/profile' },
    ]
};

export default function Sidebar() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        // Derive role from path to ensure correct menu is shown
        if (pathname.includes('/super-admin')) {
            setRole('super_admin');
        } else if (pathname.includes('/company-owner')) {
            setRole('company_owner');
        } else if (pathname.includes('/service-manager')) {
            setRole('service_manager');
        } else if (pathname.includes('/customer')) {
            setRole('customer');
        } else {
            const r = localStorage.getItem("userRole");
            setRole(r || "customer");
        }
    }, [pathname]);

    if (!role) return <div className="w-64 bg-white border-r border-slate-200 h-screen hidden md:block"></div>;

    const menuItems = ROLE_MENUS[role] || ROLE_MENUS['customer'];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen hidden md:flex flex-col fixed left-0 top-0 pt-20 z-30">
            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Menu
                </div>
                <nav className="space-y-1 px-2">
                    {menuItems.map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {role.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-900 truncate capitalize">{role.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 truncate">Tenant: FixZone Inc.</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
