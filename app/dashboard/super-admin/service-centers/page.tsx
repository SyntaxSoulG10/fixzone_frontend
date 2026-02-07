"use client";

import { MOCK_STATIONS, Station } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { HiDotsVertical } from "react-icons/hi";
import { FiFilter, FiPlus, FiStar, FiMapPin, FiBriefcase, FiCheckCircle } from "react-icons/fi";
import Button from "@/components/UI/Button";

export default function ServiceStationsPage() {
    const columns = [
        {
            header: "Station",
            accessor: (row: Station) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <FiBriefcase className="text-lg" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{row.id}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Owner",
            accessor: (row: Station) => (
                <div className="flex items-center gap-3">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${row.owner}&background=random`} 
                        alt={row.owner}
                        className="w-8 h-8 rounded-full border border-white shadow-sm" 
                    />
                    <div>
                        <div className="font-semibold text-slate-700 text-sm">{row.owner}</div>
                        <div className="text-[10px] text-slate-400">Owner</div>
                    </div>
                </div>
            )
        },
        {
            header: "Location",
            accessor: (row: Station) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <FiMapPin className="text-orange-500" />
                    <span className="font-medium text-sm">{row.location}</span>
                </div>
            )
        },
        {
            header: "Ratings",
            accessor: (row: Station) => (
                <div className="flex flex-col gap-1">
                    <div className="flex text-orange-400 text-xs gap-0.5">
                         {[...Array(5)].map((_, i) => (
                             <FiStar key={i} className={i < Math.floor(row.ratings) ? "fill-orange-400" : "text-slate-200"} />
                         ))}
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{row.ratings} / 5.0</span>
                </div>
            )
        },
        {
            header: "Metrics",
            accessor: (row: Station) => (
                <div className="text-xs">
                    <div className="flex justify-between w-24 mb-1">
                        <span className="text-slate-500">Bookings:</span>
                        <span className="font-bold text-slate-700">{row.bookings}</span>
                    </div>
                    <div className="flex justify-between w-24">
                        <span className="text-slate-500">Rev:</span>
                        <span className="font-bold text-green-600">{row.revenue}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Plan",
            accessor: (row: Station) => (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    row.plan === 'Premium' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' :
                    row.plan === 'Standard' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                    {row.plan}
                </span>
            )
        },
        {
            header: "Status",
            accessor: (row: Station) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                    row.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    {row.status}
                </span>
            )
        },
        {
            header: "",
            accessor: () => <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><HiDotsVertical /></button>
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Service Stations</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Stations" 
                    count="248" 
                    icon={<FiBriefcase />} 
                    color="primary"
                />
                 <StatCard 
                    title="Top Rated" 
                    count="Premium Auto" 
                    icon={<FiStar />} 
                    color="warning"
                />
                 <StatCard 
                    title="Active Now" 
                    count="212" 
                    icon={<FiCheckCircle />} 
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
                            <FiFilter className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search stations, owners, or locations..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:-translate-y-0.5">
                        Export List
                    </button>
                    <Button className="shadow-lg shadow-orange-200">
                        <span className="flex items-center gap-2"><FiPlus /> Add Station</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <Table
                    columns={columns}
                    data={MOCK_STATIONS}
                    keyField="id"
                />
            </div>
        </div>
    );
}
