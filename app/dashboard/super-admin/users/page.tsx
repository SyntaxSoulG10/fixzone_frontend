"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { 
    FiUsers, FiMail, FiUserCheck, FiUserX, FiSearch, 
    FiCheckCircle, FiAlertCircle, FiRefreshCw, FiFilter,
    FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import Button from "@/components/UI/Button";
import { toast } from "react-toastify";
import { APP_CONFIG } from "@/utils/config";

/**
 * DATA MODELS: Strictly defining the user structure ensures 
 * that the admin interface remains stable across API updates.
 */
interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Suspended';
    joinedDate: string;
}

/**
 * UTILITY HELPERS: Mappings and counters are kept pure and outside 
 * the component to simplify unit testing and logic reuse.
 */
const ROLE_NAME_MAP: Record<string, string> = {
    'ROLE_SUPER_ADMIN': 'Super Admin',
    'ROLE_COMPANY_OWNER': 'Company Owner',
    'OWNER': 'Company Owner',
    'CUSTOMER': 'Customer',
    'MANAGER': 'Service Manager',
    'ROLE_SERVICE_MANAGER': 'Service Manager',
    'ROLE_CUSTOMER': 'Customer',
    
};

const mapBackendRoleToDisplay = (backendRole: string): string => {
    const upper = backendRole.toUpperCase();
    return ROLE_NAME_MAP[upper] || backendRole.replace('ROLE_', '').replace('_', ' ');
};

/**
 * SIDEBAR FILTERS: Encapsulates the user type filtering logic.
 */
function UserSidebarFilters({ activeTab, onTabChange }: any) {
    const tabs = ['All', 'Customer', 'Owner', 'Manager'];
    return (
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 space-y-8">
            <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-mono">Focus Group</h4>
                <div className="space-y-1">
                    {tabs.map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => onTabChange(tab as any)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                                activeTab === tab ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * CONFIRMATION MODAL: Safety component for destructive or sensitive status changes.
 */
function StatusConfirmModal({ isOpen, user, action, onConfirm, onCancel }: any) {
    if (!isOpen) return null;
    const isSuspending = action === 'Suspended';
    
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`h-2 ${isSuspending ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                <div className="p-8 text-center space-y-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl ${isSuspending ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                        {isSuspending ? <FiUserX /> : <FiUserCheck />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{action} User?</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Are you sure you want to {action.toLowerCase()} <span className="font-bold text-slate-800">{user.name}</span>? 
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button onClick={onCancel} className="px-6 py-3 text-sm font-bold text-black bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                        <button onClick={onConfirm} className={`px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg ${isSuspending ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}>Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * MAIN COMPONENT: Manages platform-wide user access and identity.
 */
export default function UsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'All' | 'Customer' | 'Owner' | 'Manager'>('All');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: '', userName: '', action: 'Suspended' as 'Active' | 'Suspended' });
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => { loadUserDatabase(); }, []);

    // Reset pagination when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sidebarTab]);

    // FETCH LOGIC: Pulls entire user base for administrative oversight.
    const loadUserDatabase = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${APP_CONFIG.api.baseUrl}/admin/users`);
            const transformed = response.data.map((u: any) => ({
                id: u.userId, name: u.fullName || 'Unknown User', email: u.email,
                role: mapBackendRoleToDisplay(u.role), status: u.status === 'Suspended' ? 'Suspended' : 'Active',
                joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
            }));
            setUsers(transformed);
        } catch (e) { toast.error("Failed to synchronize user records."); } finally { setLoading(false); }
    };

    const handleStatusUpdate = async () => {
        const { userId, action } = confirmModal;
        try {
            setProcessingId(userId);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: action } : u));
            await axios.post(`${APP_CONFIG.api.baseUrl}/admin/users/${userId}/status?status=${action}`);
            toast.success(`Account successfully ${action.toLowerCase()}`);
        } catch (e) { toast.error("Action failed."); loadUserDatabase(); } finally { setProcessingId(null); }
    };

    const filtered = users.filter(u => {
        const q = searchQuery.toLowerCase();
        const matches = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        return sidebarTab === 'All' ? matches : (matches && u.role.toLowerCase().includes(sidebarTab.toLowerCase()));
    });

    const columns = [
        {
            header: "User Identity",
            accessor: (row: UserRecord) => (
                <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${row.name}&background=random&color=fff`} className="w-10 h-10 rounded-2xl" alt="avatar" />
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono italic">{row.id.substring(0, 13)}...</div>
                    </div>
                </div>
            )
        },
        { header: "Contact", accessor: (row: UserRecord) => <div className="text-xs font-medium text-slate-600">{row.email}</div> },
        { header: "Role", accessor: (row: UserRecord) => <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-slate-50">{row.role}</span> },
        { 
            header: "Status", 
            accessor: (row: UserRecord) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${row.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`} />{row.status}
                </span>
            ) 
        },
        {
            header: "Actions",
            accessor: (row: UserRecord) => (
                <div className="flex items-center gap-2">
                    {row.role !== 'Super Admin' && (
                        <button 
                            onClick={() => setConfirmModal({ isOpen: true, userId: row.id, userName: row.name, action: row.status === 'Active' ? 'Suspended' : 'Active' })}
                            className={`px-4 py-1.5 border rounded-xl text-xs font-bold transition-all ${row.status === 'Active' ? 'text-orange-600 border-orange-200' : 'text-green-600 border-green-200'}`}
                        >
                            {row.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                    )}
                </div>
            )
        }
    ];

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><FiUsers /> Users Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage user access and safety controls across the platform.</p>
                </div>
                <Button variant="secondary" onClick={loadUserDatabase} className="flex items-center gap-2"><FiRefreshCw className={loading ? 'animate-spin' : ''} /> Sync DB</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Accounts" count={users.length.toString()} icon={<FiUsers />} color="primary" />
                <StatCard title="Active Users" count={users.filter(u => u.status === 'Active').length.toString()} icon={<FiCheckCircle />} color="success" />
                <StatCard title="Suspended" count={users.filter(u => u.status === 'Suspended').length.toString()} icon={<FiAlertCircle />} color="error" />
            </div>

            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-150">
                <UserSidebarFilters activeTab={sidebarTab} onTabChange={setSidebarTab} />
                
                <div className="flex-1 p-6 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="relative w-full">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none" />
                        </div>
                    </div>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                        <Table columns={columns} data={paginatedData} keyField="id" />
                    </div>

                    {/* Pagination Controls */}
                    {filtered.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500">
                                Showing {Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filtered.length, currentPage * pageSize)} of {filtered.length} users
                            </div>
                            <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                                    >
                                        <FiChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold text-slate-700">
                                        Page {currentPage} of {totalPages || 1}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                                    >
                                        <FiChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                        </div>
                    )}
                </div>
            </div>

            <StatusConfirmModal 
                isOpen={confirmModal.isOpen} 
                user={{ name: confirmModal.userName }} 
                action={confirmModal.action} 
                onConfirm={handleStatusUpdate} 
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
            />
        </div>
    );
}
