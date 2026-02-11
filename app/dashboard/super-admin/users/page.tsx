"use client";

import { MOCK_USERS } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { User } from "@/types";
import { FiBriefcase, FiTool, FiMail, FiClock, FiShield, FiUserPlus, FiUserCheck, FiFilter, FiUserX, FiAlertTriangle, FiBell, FiUser, FiTrash2, FiPlus } from "react-icons/fi";
import Button from "@/components/UI/Button";

export default function UsersPage() {
    const columns = [
        {
            header: "User Profile",
            accessor: (row: User) => (
                <div className="flex items-center gap-4">
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
            )
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
            )
        },
        {
            header: "Role & Access",
            accessor: (row: User) => {
                let icon = <FiUser />;
                let color = "bg-slate-100 text-slate-600 border-slate-200";
                
                if (row.role === 'Manager') { icon = <FiBriefcase />; color = "bg-purple-50 text-purple-700 border-purple-200"; }
                if (row.role === 'Owner') { icon = <FiShield />; color = "bg-indigo-50 text-indigo-700 border-indigo-200"; }
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
            }
        },
        {
            header: "Last Active",
            accessor: (row: User) => (
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <FiClock className="text-slate-400" />
                    <span>{row.lastLogin}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (row: User) => (
                <div className="flex items-center h-full">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border min-w-[100px] shadow-sm ${
                        row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                        'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${row.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {row.status}
                    </span>
                 </div>
            )
        },
        {
            header: "Joined",
            accessor: (row: User) => <div className="flex items-center h-full"><span className="text-slate-500 text-xs font-medium font-mono">{row.joinedDate}</span></div>
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
            )
        },
        {
            header: "Actions",
            accessor: (row: User) => (
                <div className="flex items-center gap-2 h-full">
                    <button 
                         className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 bg-slate-50"
                         title="Notify User"
                    >
                         <FiBell className="w-4 h-4" />
                    </button>
                    
                    {/* Ban/Activate Toggle */}
                    {row.status === 'Active' ? (
                        <button 
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-100 bg-slate-50"
                            title="Ban User"
                        >
                            <FiUserX className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100 bg-slate-50"
                            title="Activate User"
                        >
                            <FiUserCheck className="w-4 h-4" />
                        </button>
                    )}

                    {/* Report User */}
                    <button 
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100 bg-slate-50"
                        title="Report User Activity"
                    >
                        <FiAlertTriangle className="w-4 h-4" />
                    </button>

                    {/* Remove User */}
                    <button 
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 bg-slate-50"
                        title="Remove User"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Users" 
                    count="12,847" 
                    icon={<FiUser />} 
                    color="primary"
                />
                 <StatCard 
                    title="New This Month" 
                    count="+1,205" 
                    icon={<FiUserPlus />} 
                    color="success"
                />
                 <StatCard 
                    title="Active Now" 
                    count="843" 
                    icon={<FiUserCheck />} 
                    color="warning"
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
                    data={MOCK_USERS}
                    keyField="id"
                />
            </div>
        </div>
    );
}

