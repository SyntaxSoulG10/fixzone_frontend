"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiUsers, FiMail, FiShield, FiUserCheck, FiFilter, FiUserX, FiBell, FiUser, FiPlus, FiX, FiSearch, FiCheckCircle, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { toast } from "react-toastify";

interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Suspended';
    joinedDate: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'All' | 'Customer' | 'Owner' | 'Manager'>('All');
    
    // For Confirmation Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        userId: string;
        userName: string;
        action: 'Active' | 'Suspended';
    }>({ isOpen: false, userId: '', userName: '', action: 'Suspended' });

    const mapRole = (backendRole: string): string => {
        const roleMap: Record<string, string> = {
            'ROLE_SUPER_ADMIN': 'Super Admin',
            'ROLE_COMPANY_OWNER': 'Company Owner',
            'OWNER': 'Company Owner',
            'CUSTOMER': 'Customer',
            'MANAGER': 'Service Manager',
            'ROLE_SERVICE_MANAGER': 'Service Manager',
            'ROLE_CUSTOMER': 'Customer',
            'ROLE_MECHANIC': 'Mechanic'
        };
        const upper = backendRole.toUpperCase();
        return roleMap[upper] || backendRole.replace('ROLE_', '').replace('_', ' ');
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:8080/api/admin/users");
            const transformed = response.data.map((u: any) => ({
                id: u.userId,
                name: u.fullName || 'Unknown User',
                email: u.email,
                role: mapRole(u.role),
                status: u.status === 'Suspended' ? 'Suspended' : 'Active',
                joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
            }));
            setUsers(transformed);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load user records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const triggerUpdateStatus = (user: UserRecord, target: 'Active' | 'Suspended') => {
        setConfirmModal({
            isOpen: true,
            userId: user.id,
            userName: user.name,
            action: target
        });
    };

    const handleUpdateStatus = async () => {
        const { userId, action } = confirmModal;
        try {
            setProcessingId(userId);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            
            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: action } : u));
            
            await axios.post(`http://localhost:8080/api/admin/users/${userId}/status?status=${action}`);
            toast.success(`Account for ${confirmModal.userName} is now ${action}`);
        } catch (error) {
            toast.error("Action failed. Reverting changes.");
            fetchUsers(); // Revert on failure
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.id.toLowerCase().includes(query);
        
        if (sidebarTab === 'All') return matchesSearch;
        return matchesSearch && u.role.toLowerCase().includes(sidebarTab.toLowerCase());
    });

    const columns = [
        {
            header: "User Identity",
            accessor: (row: UserRecord) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold overflow-hidden shadow-inner">
                        <img src={`https://ui-avatars.com/api/?name=${row.name}&background=random&color=fff&bold=true`} alt={row.name} />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono italic">{row.id.substring(0, 13)}...</div>
                    </div>
                </div>
            )
        },
        {
            header: "Contact Email",
            accessor: (row: UserRecord) => (
                <div className="flex items-center gap-2 text-slate-600">
                    <FiMail className="text-slate-400" />
                    <span className="text-xs font-medium">{row.email}</span>
                </div>
            )
        },
        {
            header: "Role Architecture",
            accessor: (row: UserRecord) => {
                let color = "bg-slate-50 text-slate-600 border-slate-200";
                if (row.role.includes('Admin')) color = "bg-red-50 text-red-700 border-red-100";
                if (row.role.includes('Owner')) color = "bg-indigo-50 text-indigo-700 border-indigo-100";
                if (row.role.includes('Manager')) color = "bg-purple-50 text-purple-700 border-purple-100";
                if (row.role.includes('Customer')) color = "bg-blue-50 text-blue-700 border-blue-100";

                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${color}`}>
                        {row.role}
                    </span>
                );
            }
        },
        {
            header: "Status",
            accessor: (row: UserRecord) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                    row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                    {row.status}
                </span>
            )
        },
        {
            header: "Actions",
            accessor: (row: UserRecord) => (
                <div className="flex items-center gap-2">
                    {row.role !== 'Super Admin' && (
                        row.status === 'Active' ? (
                            <button 
                                onClick={() => triggerUpdateStatus(row, 'Suspended')}
                                disabled={processingId === row.id}
                                className="px-4 py-1.5 bg-white text-orange-600 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2 group shadow-sm"
                            >
                                {processingId === row.id ? <FiRefreshCw className="animate-spin" /> : <FiUserX className="group-hover:scale-110 transition-transform" />} 
                                Suspend
                            </button>
                        ) : (
                            <button 
                                onClick={() => triggerUpdateStatus(row, 'Active')}
                                disabled={processingId === row.id}
                                className="px-4 py-1.5 bg-white text-green-600 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 group shadow-sm"
                            >
                                {processingId === row.id ? <FiRefreshCw className="animate-spin" /> : <FiUserCheck className="group-hover:scale-110 transition-transform" />} 
                                Activate
                            </button>
                        )
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-orange-600 rounded-2xl text-white shadow-xl shadow-orange-100">
                            <FiUsers className="text-2xl" />
                        </div>
                        Users Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-14 font-medium">Maintain platform security by managing user access and roles.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchUsers} className="flex items-center gap-2 group hover:bg-slate-100">
                        <FiRefreshCw className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} /> Sync DB
                    </Button>
                </div>
            </div>

            {/* Smart Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Accounts" count={users.length.toString()} icon={<FiUsers />} color="primary" />
                <StatCard title="Active Users" count={activeUsersCount(users)} icon={<FiCheckCircle />} color="success" />
                <StatCard title="Suspended" count={suspendedUsersCount(users)} icon={<FiAlertCircle />} color="error" />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Internal Sidebar Filters */}
                <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-mono">Focus Group</h4>
                        <div className="space-y-1">
                            {['All', 'Customer', 'Owner', 'Manager'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setSidebarTab(tab as any)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                                        sidebarTab === tab ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab}
                                    {sidebarTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border-l-4 border-orange-500 rounded-2xl p-5 shadow-sm">
                        <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Security Insight</h5>
                        <p className="text-[11px] mt-2 leading-relaxed text-slate-600 font-medium">
                            Suspending an account immediately revokes all active sessions and blocks platform-wide API access.
                        </p>
                    </div>
                </div>

                {/* Main List Area */}
                <div className="flex-1 p-6 space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="relative w-full md:max-w-md">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by name, email or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
                            <FiFilter className="inline mr-2" /> {filteredUsers.length} Users Listed
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                        <Table columns={columns} data={filteredUsers} keyField="id" />
                    </div>
                </div>
            </div>

            {/* Safety Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className={`h-2 ${confirmModal.action === 'Suspended' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <div className="p-8 text-center space-y-6">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl ${confirmModal.action === 'Suspended' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                                {confirmModal.action === 'Suspended' ? <FiUserX /> : <FiUserCheck />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{confirmModal.action} User?</h3>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    Are you sure you want to {confirmModal.action.toLowerCase()} <span className="font-bold text-slate-800">{confirmModal.userName}</span>? 
                                    {confirmModal.action === 'Suspended' ? ' They will lose all access immediately.' : ' They will regain access to their dashboard.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-6 py-3 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateStatus}
                                    className={`px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg ${
                                        confirmModal.action === 'Suspended' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'
                                    }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helpers
function activeUsersCount(users: UserRecord[]) {
    return users.filter(u => u.status === 'Active').length.toString();
}

function suspendedUsersCount(users: UserRecord[]) {
    return users.filter(u => u.status === 'Suspended').length.toString();
}
