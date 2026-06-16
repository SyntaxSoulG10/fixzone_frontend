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
    FiSmile,
    FiLayers,
    FiUser,
    FiTag,
    FiBell,
    FiActivity
} from "react-icons/fi";

const ROLE_MENUS: any = {
    super_admin: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/super-admin' },
        { name: 'Service Centers', icon: FiTool, href: '/dashboard/super-admin/service-centers' },
        { name: 'Users', icon: FiUsers, href: '/dashboard/super-admin/users' },
        { name: 'Subscriptions', icon: FiBriefcase, href: '/dashboard/super-admin/subscriptions' },
        { name: 'Subscription Plans', icon: FiTag, href: '/dashboard/super-admin/subscription-plans' },
    ],
    company_owner: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/company-owner' },
        { name: 'Services', icon: FiLayers, href: '/dashboard/company-owner/services' },
        { name: 'Service Centers', icon: FiBriefcase, href: '/dashboard/company-owner/centers' },
        { name: 'Analytics', icon: FiPieChart, href: '/dashboard/company-owner/analytics' },
        { name: 'Reports', icon: FiFileText, href: '/dashboard/company-owner/reports' },
        { name: 'Managers', icon: FiUsers, href: '/dashboard/company-owner/managers' },
        { name: 'Finance', icon: FiDollarSign, href: '/dashboard/company-owner/finance' },
        { name: 'Customers', icon: FiSmile, href: '/dashboard/company-owner/customers' },
        { name: 'Notifications', icon: FiBell, href: '/dashboard/company-owner/notifications', badge: true },
        { name: 'Profile', icon: FiUsers, href: '/dashboard/company-owner/profile' },
    ],
    service_manager: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/service-manager' },
        { name: 'Bookings', icon: FiCalendar, href: '/dashboard/service-manager/bookings' },
        { name: 'Vehicles', icon: FiTruck, href: '/dashboard/service-manager/vehicles' },
        { name: 'Reports', icon: FiFileText, href: '/dashboard/service-manager/reports' },
        { name: 'Analytics', icon: FiPieChart, href: '/dashboard/service-manager/analytics' },
        { name: 'Notifications', icon: FiBell, href: '/dashboard/service-manager/notifications', badge: true },
        { name: 'MyProfile', icon: FiUser, href: '/dashboard/service-manager/profile' },
    ],
    customer: [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard/customer' },
        { name: 'Book Service', icon: FiCalendar, href: '/dashboard/customer/bookings' },
        { name: 'My bookings', icon: FiClock, href: '/dashboard/customer/history' },
        { name: 'Notifications', icon: FiBell, href: '/dashboard/customer/notifications', badge: true },
        { name: 'My Profile', icon: FiUsers, href: '/dashboard/customer/profile' },
    ]
};

interface SidebarProps {
    isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        const handleUpdates = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                const count = customEvent.detail.filter((n: any) => !(n.read !== undefined ? n.read : n.isRead)).length;
                setUnreadCount(count);
            }
        };

        window.addEventListener("notificationsUpdated", handleUpdates);
        return () => window.removeEventListener("notificationsUpdated", handleUpdates);
    }, []);

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
            if (r) {
                // Map backend roles to ROLE_MENUS keys
                const roleMap: Record<string, string> = {
                    "ROLE_COMPANY_OWNER": "company_owner",
                    "OWNER": "company_owner",
                    "ROLE_SERVICE_MANAGER": "service_manager",
                    "ROLE_SUPER_ADMIN": "super_admin",
                    "ROLE_CUSTOMER": "customer"
                };
                setRole(roleMap[r] || r.toLowerCase().replace('role_', ''));
            } else {
                setRole("customer");
            }
        }
    }, [pathname]);

    if (!role) return <div className={`w-64 bg-white border-r border-slate-200 h-screen block ${!isOpen && 'hidden'}`}></div>;

    const menuItems = ROLE_MENUS[role] || ROLE_MENUS['customer'];

    return (
        <aside
            className={`w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 pt-20 z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-64'
                }`}
        >
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
                                <span className="flex-1">{item.name}</span>
                                {item.badge && unreadCount > 0 && (
                                    <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>


        </aside>
    );
}
