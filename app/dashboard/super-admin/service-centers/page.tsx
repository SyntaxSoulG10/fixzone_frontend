"use client";

import { MOCK_STATIONS, Station } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiFilter, FiPlus, FiMapPin, FiBriefcase, FiCheckCircle, FiSlash, FiSearch, FiX, FiFileText, FiClock, FiBell } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { useState } from "react";

export default function ServiceStationsPage() {
    const [stations, setStations] = useState<Station[]>(MOCK_STATIONS.slice(0, 4)); // Keep only first 4
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const pendingRequests = stations.filter(s => s.status === 'Pending').length;

    const filteredStations = stations.filter(s =>
        (s.name ? s.name.toLowerCase() : "").includes(searchQuery.toLowerCase()) ||
        (s.owner ? s.owner.toLowerCase() : "").includes(searchQuery.toLowerCase()) ||
        (s.location ? s.location.toLowerCase() : "").includes(searchQuery.toLowerCase())
    );

    const handleApprove = (id: string | number, adminName: string = "Super Admin") => {
        setStations(prev => prev.map(station =>
            station.id === id ? {
                ...station,
                status: 'Active',
                lastActionBy: adminName,
                lastActionTime: new Date().toLocaleString()
            } : station
        ));
        setIsReviewModalOpen(false);
    };

    const handleReject = (id: string | number, adminName: string = "Super Admin") => {
        setStations(prev => prev.map(station =>
            station.id === id ? {
                ...station,
                status: 'Suspended',
                lastActionBy: adminName,
                lastActionTime: new Date().toLocaleString()
            } : station
        ));
        setIsReviewModalOpen(false);
    };

    const openReviewModal = (station: Station) => {
        setSelectedStation(station);
        setIsReviewModalOpen(true);
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm min-w-20 ${row.plan === 'Premium' ? 'bg-purple-50 text-purple-700 border-purple-200' :
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
                <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border min-w-24 ${row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                            row.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                row.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${row.status === 'Active' ? 'bg-green-500' :
                                row.status === 'Suspended' ? 'bg-red-500' :
                                    'bg-orange-400'
                            }`}></span>
                        {row.status}
                    </span>
                    {row.lastActionBy && (
                        <div className="text-[10px] text-slate-400 mt-1">
                            <div>By: {row.lastActionBy}</div>
                            <div>{row.lastActionTime}</div>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Actions",
            accessor: (row: Station) => (
                <div className="flex items-center gap-2 h-full">
                    {row.status === 'Pending' && (
                        <>
                            <button
                                onClick={() => openReviewModal(row)}
                                className="h-8 px-3 flex items-center justify-center gap-2 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all text-xs font-bold shadow-sm"
                            >
                                <FiFileText className="w-3.5 h-3.5" />
                                <span>Review</span>
                            </button>
                            <button
                                onClick={() => handleApprove(row.id)}
                                className="h-8 px-3 flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition-all text-xs font-bold shadow-sm"
                            >
                                <FiCheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                            </button>
                            <button
                                onClick={() => handleReject(row.id)}
                                className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                title="Reject"
                            >
                                <FiSlash className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {row.status === 'Active' && (
                        <button
                            onClick={() => handleReject(row.id)}
                            className="h-8 px-3 flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-all text-xs font-bold shadow-sm"
                        >
                            <FiSlash className="w-3.5 h-3.5" />
                            <span>Suspend</span>
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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Service Stations</h1>
                {pendingRequests > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl">
                        <FiBell className="text-orange-600 animate-pulse" />
                        <span className="text-sm font-bold text-orange-700">{pendingRequests} Pending Request{pendingRequests > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Stations"
                    count={stations.length.toString()}
                    icon={<FiBriefcase />}
                    color="primary"
                />
                <StatCard
                    title="Pending Requests"
                    count={pendingRequests.toString()}
                    icon={<FiClock />}
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
                            <FiSearch className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search stations, owners, or locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    data={filteredStations}
                    keyField="id"
                />
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedStation && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Review Registration Request</h3>
                                <p className="text-sm text-slate-500">Station ID: {selectedStation.id}</p>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Station Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Station Name</label>
                                    <p className="text-sm font-bold text-slate-800">{selectedStation.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Owner</label>
                                    <p className="text-sm font-bold text-slate-800">{selectedStation.owner}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                                    <p className="text-sm font-bold text-slate-800">{selectedStation.location}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Selected Plan</label>
                                    <p className="text-sm font-bold text-slate-800">{selectedStation.plan}</p>
                                </div>
                            </div>

                            {/* Submitted Documents */}
                            <div className="border-t pt-4">
                                <h4 className="font-bold text-slate-800 mb-3 text-sm">Submitted Documents</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <FiFileText className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Business Registration (BR)</p>
                                                <p className="text-xs text-slate-500">PDF • 2.4 MB</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                            View
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                                <FiFileText className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Tax Identification Number</p>
                                                <p className="text-xs text-slate-500">PDF • 1.1 MB</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                            View
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                                <FiFileText className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Owner NIC Copy</p>
                                                <p className="text-xs text-slate-500">PDF • 890 KB</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleReject(selectedStation.id)}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedStation.id)}
                                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
