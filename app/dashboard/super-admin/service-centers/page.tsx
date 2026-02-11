"use client";

import { MOCK_STATIONS, Station } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiFilter, FiPlus, FiStar, FiMapPin, FiBriefcase, FiCheckCircle, FiSlash } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { useState } from "react";

export default function ServiceStationsPage() {
    const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
    
    const topRatedStation = [...stations].sort((a, b) => b.ratings - a.ratings)[0];

    const handleApprove = (id: string | number) => {
        setStations(prev => prev.map(station => 
            station.id === id ? { ...station, status: 'Active' } : station
        ));
    };

    const handleSuspend = (id: string | number) => {
        setStations(prev => prev.map(station => 
            station.id === id ? { ...station, status: 'Suspended' } : station
        )); 
    };

    const columns = [
        {
            header: "Station Name",
            accessor: (row: Station) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                        <FiBriefcase className="text-lg" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                        <div className="text-xs text-slate-400 font-mono tracking-tight">{row.id}</div>
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
                        className="w-9 h-9 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" 
                    />
                    <div>
                        <div className="font-semibold text-slate-700 text-sm">{row.owner}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Owner</div>
                    </div>
                </div>
            )
        },
        {
            header: "Location",
            accessor: (row: Station) => (
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg w-fit">
                    <FiMapPin className="text-orange-500 w-3.5 h-3.5" />
                    <span className="font-medium text-xs">{row.location}</span>
                </div>
            )
        },
        {
            header: "Ratings",
            accessor: (row: Station) => (
                <div className="flex flex-col gap-1">
                    <div className="flex text-orange-400 text-xs gap-0.5">
                         {[...Array(5)].map((_, i) => (
                             <FiStar key={i} className={i < Math.floor(row.ratings) ? "fill-orange-400 w-3.5 h-3.5" : "text-slate-200 w-3.5 h-3.5"} />
                         ))}
                    </div>
                    <span className="font-bold text-slate-700 text-xs px-1">{row.ratings} / 5.0</span>
                </div>
            )
        },
        {
            header: "Performance",
            accessor: (row: Station) => (
                <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between w-28">
                        <span className="text-slate-500 font-medium">Bookings</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-1.5 rounded">{row.bookings}</span>
                    </div>
                    <div className="flex items-center justify-between w-28">
                        <span className="text-slate-500 font-medium">Revenue</span>
                        <span className="font-bold text-green-600">{row.revenue}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Plan",
            accessor: (row: Station) => (
                <div className="flex items-center h-full">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm min-w-[80px] ${
                        row.plan === 'Premium' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        row.plan === 'Standard' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                        {row.plan}
                    </span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (row: Station) => (
                <div className="flex items-center h-full">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border min-w-[90px] ${
                        row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                        row.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        row.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            row.status === 'Active' ? 'bg-green-500' : 
                            row.status === 'Suspended' ? 'bg-red-500' :
                            'bg-slate-400'
                        }`}></span>
                        {row.status}
                    </span>
                </div>
            )
        },
        {
            header: "Actions",
            accessor: (row: Station) => (
                <div className="flex items-center gap-2 h-full">
                    {row.status === 'Pending' && (
                        <button 
                            onClick={() => handleApprove(row.id)}
                            className="h-8 px-3 flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition-all text-xs font-bold shadow-sm"
                        >
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                        </button>
                    )}
                    {(row.status === 'Active' || row.status === 'Pending') && (
                        <button 
                            onClick={() => handleSuspend(row.id)}
                            className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                            title="Suspend/Revoke"
                        >
                            <FiSlash className="w-4 h-4" />
                        </button>
                    )}
                     {row.status === 'Suspended' && (
                        <button 
                            onClick={() => handleApprove(row.id)}
                            className="h-8 px-3 flex items-center justify-center gap-2 text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-all text-xs font-bold shadow-sm"
                        >
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Service Stations</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Stations" 
                    count={stations.length.toString()} 
                    icon={<FiBriefcase />} 
                    color="primary"
                />
                 <StatCard 
                    title="Top Rated" 
                    count={<span className="text-xl">{topRatedStation?.name || 'N/A'}</span>}
                    icon={<FiStar />} 
                    color="warning"
                />
                 <StatCard 
                    title="Active Now" 
                    count={stations.filter(s => s.status === 'Active').length.toString()} 
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
                    <Button variant="secondary" className="shadow-sm">
                         Export List
                    </Button>
                    <Button className="shadow-lg shadow-orange-200">
                        <span className="flex items-center gap-2"><FiPlus /> Add Station</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <Table
                    columns={columns}
                    data={stations}
                    keyField="id"
                />
            </div>
        </div>
    );
}
