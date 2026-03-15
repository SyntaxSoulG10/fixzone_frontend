"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MOCK_USERS } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { User } from "@/types";
import { FiBriefcase, FiTool, FiMail, FiShield, FiUserCheck, FiFilter, FiUserX, FiBell, FiUser, FiPlus, FiX, FiSend } from "react-icons/fi";
import Button from "@/components/UI/Button";

interface Notification {
    id: string;
    userId: string;
    userName: string;
    title: string;
    message: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const mapRole = (backendRole: string): User['role'] => {
        switch (backendRole) {
            case 'ROLE_SUPER_ADMIN': return 'Super Admin';
            case 'ROLE_COMPANY_OWNER': return 'Company Owner';
            case 'ROLE_SERVICE_MANAGER': return 'Service Manager';
            case 'ROLE_CUSTOMER': return 'Customer';
            default: return backendRole as any;
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:8080/api/admin/users");
            const transformedUsers = response.data.map((u: any) => ({
                ...u,
                role: mapRole(u.role),
                joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                activity: 'Joined ' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'recently')
            }));
            setUsers(transformedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers(MOCK_USERS as any);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSuspendUser = async (userId: string | number) => {
        try {
            await axios.post(`http://localhost:8080/api/admin/users/${userId}/status?status=Suspended`);
            showNotificationToast(`User ${userId} has been suspended`);
            fetchUsers();
        } catch (error) {
            console.error("Error suspending user:", error);
            showNotificationToast("Failed to suspend user");
        }
    };

    const handleActivateUser = async (userId: string | number) => {
        try {
            await axios.post(`http://localhost:8080/api/admin/users/${userId}/status?status=Active`);
            showNotificationToast(`User ${userId} has been activated`);
            fetchUsers();
        } catch (error) {
            console.error("Error activating user:", error);
            showNotificationToast("Failed to activate user");
        }
    };

    const openNotificationModal = (user: User) => {
        setSelectedUser(user);
        setTitle("");
        setMessage("");
        setIsNotificationModalOpen(true);
    };

    const handleSendNotification = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser || !message.trim()) return;

        const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: String(selectedUser.id),
            userName: selectedUser.name,
            title: title,
            message: message,
            createdAt: new Date().toLocaleString()
        };

        setNotifications(prev => [...prev, notification]);
        showNotificationToast(`Notification sent to ${selectedUser.name}`);

        setIsNotificationModalOpen(false);
    };

    const showNotificationToast = (message: string) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const columns = [
        {
            header: "User Profile",
            accessor: (row: User) => (
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://ui-avatars.com/api/?name=${row.name}&background=random`}
                        alt={row.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div>
                        <div className="font-bold text-slate-800 text-sm leading-snug">{row.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{row.id}</div>
                    </div>
                </div>
            ),
            cellClassName: "align-middle"
        },
        {
            header: "Contact",
            accessor: (row: User) => (
                <div className="flex items-center gap-2 text-slate-600 group cursor-pointer">
                    <div className="p-1.5 bg-slate-50 rounded text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                        <FiMail />
                    </div>
                    <span className="text-sm group-hover:text-blue-600 transition-colors">{row.email}</span>
                </div>
            ),
            cellClassName: "align-middle"
        },
        {
            header: "Role & Access",
            accessor: (row: User) => {
                let icon = <FiUser />;
                let color = "bg-slate-100 text-slate-600 border-slate-200";

                if (row.role === 'Service Manager') { icon = <FiBriefcase />; color = "bg-purple-50 text-purple-700 border-purple-200"; }
                if (row.role === 'Owner') { icon = <FiShield />; color = "bg-indigo-50 text-indigo-700 border-indigo-200"; }
                if (row.role === 'Company Owner') { icon = <FiShield />; color = "bg-indigo-50 text-indigo-700 border-indigo-200"; }
                if (row.role === 'Super Admin') { icon = <FiShield />; color = "bg-red-50 text-red-700 border-red-200"; }
                if (row.role === 'Customer') { icon = <FiUser />; color = "bg-blue-50 text-blue-700 border-blue-200"; }
                if (row.role === 'Mechanic') { icon = <FiTool />; color = "bg-orange-50 text-orange-700 border-orange-200"; }

                return (
                    <div className="flex items-center h-full">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border min-w-[100px] justify-center ${color}`}>
                            <span className="text-xs">{icon}</span>
                            <span className="font-bold text-xs uppercase tracking-wide">{row.role}</span>
                        </div>
                    </div>
                );
            },
            cellClassName: "align-middle text-center"
        },
        {
            header: "Status",
            accessor: (row: User) => (
                <div className="flex items-center h-full">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border min-w-[100px] shadow-sm ${row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${row.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`}></span>
                        {row.status}
                    </span>
                </div>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Joined",
            accessor: (row: User) => <span className="text-slate-500 text-xs font-medium font-mono">{row.joinedDate}</span>,
            cellClassName: "align-middle"
        },
        {
            header: "Recent Task",
            accessor: (row: User) => (
                <div className="flex items-center gap-2 h-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]" title={row.activity}>
                        {row.activity}
                    </span>
                </div>
            ),
            cellClassName: "align-middle"
        },
        {
            header: "Actions",
            accessor: (row: User) => (
                <div className="flex items-center gap-2 h-full">
                    {/* Notify User */}
                    <button
                        onClick={() => openNotificationModal(row)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 bg-slate-50"
                        title="Send Notification"
                    >
                        <FiBell className="w-4 h-4" />
                    </button>

                    {/* Suspend/Activate Toggle */}
                    {row.status === 'Active' ? (
                        <button
                            onClick={() => handleSuspendUser(String(row.id))}
                            className="h-9 px-3 flex items-center justify-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl transition-all text-xs font-bold"
                            title="Suspend User"
                        >
                            <FiUserX className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleActivateUser(String(row.id))}
                            className="h-9 px-3 flex items-center justify-center gap-1.5 text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 rounded-xl transition-all text-xs font-bold"
                            title="Activate User"
                        >
                            <FiUserCheck className="w-3.5 h-3.5" />
                            <span>Activate</span>
                        </button>
                    )}
                </div>
            ),
            cellClassName: "align-middle text-center"
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Total Users"
                    count={users.length.toString()}
                    icon={<FiUser />}
                    color="primary"
                />
                <StatCard
                    title="Active Now"
                    count={users.filter(u => u.status === 'Active').length.toString()}
                    icon={<FiUserCheck />}
                    color="success"
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
                <div className="w-full md:w-auto flex-1 flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:shadow-sm hover:border-orange-300 transition-all bg-white hover:-translate-y-0.5">
                        <FiFilter />
                    </button>
                    <div className="relative flex-1 md:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users by name, email, or ID..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:-translate-y-0.5">
                        Export List
                    </button>
                    <Button className="shadow-lg shadow-orange-200">
                        <span className="flex items-center gap-2"><FiPlus /> Add User</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Table
                    columns={columns}
                    data={users}
                    keyField="id"
                />
            </div>

            {/* Notification Modal */}
            {isNotificationModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Send Notification</h3>
                                <p className="text-sm text-slate-500">To: {selectedUser.name} ({selectedUser.email})</p>
                            </div>
                            <button
                                onClick={() => setIsNotificationModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSendNotification} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all"
                                    placeholder="e.g., Account Update"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all resize-none"
                                    rows={4}
                                    placeholder="Type your message..."
                                    required
                                />
                            </div>
                        </form>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsNotificationModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendNotification}
                                className="px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                            >
                                <FiSend className="w-4 h-4" />
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {showNotification && (
                <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">{notificationMessage}</span>
                </div>
            )}
        </div>
    );
}
