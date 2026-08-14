"use client";

import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiFilter, FiPlus, FiMapPin, FiBriefcase, FiCheckCircle, FiSlash, FiSearch, FiX, FiFileText, FiClock, FiBell, FiExternalLink, FiAlertCircle, FiChevronLeft, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import APP_CONFIG from "@/config";

interface Station {
    id: string;
    name: string;
    owner: string;
    location: string;
    bookings: number;
    revenue: string;
    status: 'Active' | 'Pending' | 'Suspended' | 'Rejected';
    plan: string;
    businessRegUrl?: string;
    nicUrl?: string;
    taxIdUrl?: string;
    rejectionReason?: string;
}

export default function ServiceStationsPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [rejectionMode, setRejectionMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processingAction, setProcessingAction] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const fetchStations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${APP_CONFIG.API_BASE_URL}/api/admin/service-centers`);
            const transformed = response.data.map((s: any) => ({
                id: s.centerId || s.id,
                name: s.name,
                owner: s.ownerName || (s.ownerId ? `Owner: ${s.ownerId.substring(0,8)}` : 'Unknown Owner'),
                location: s.address || 'Not Specified',
                bookings: 0,
                revenue: "Rs 0",
                status: s.status === 'APPROVED' ? 'Active' : s.status === 'PENDING' ? 'Pending' : s.status === 'REJECTED' ? 'Rejected' : 'Suspended',
                plan: s.plan || 'Standard',
                businessRegUrl: s.businessRegUrl,
                nicUrl: s.nicUrl,
                taxIdUrl: s.taxIdUrl,
                rejectionReason: s.rejectionReason
            }));
            setStations(transformed);
        } catch (error) {
            console.error("Error fetching stations:", error);
            toast.error("Failed to fetch service centers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const pendingStations = stations.filter(s => s.status === 'Pending');
    const activeStations = stations.filter(s => s.status === 'Active');
    const suspendedStations = stations.filter(s => s.status === 'Suspended');

    const filteredStations = stations.filter(s =>
        s.status !== 'Pending' && (
            (s.name ? s.name.toLowerCase() : "").includes(searchQuery.toLowerCase()) ||
            (s.owner ? s.owner.toLowerCase() : "").includes(searchQuery.toLowerCase()) ||
            (s.location ? s.location.toLowerCase() : "").includes(searchQuery.toLowerCase())
        )
    );

    const handleApprove = async (id: string) => {
        try {
            setProcessingAction(true);
            await axios.post(`${APP_CONFIG.API_BASE_URL}/api/admin/service-centers/${id}/approve`);
            toast.success("Service Center approved successfully!");
            fetchStations();
            setIsReviewModalOpen(false);
        } catch (error) {
            toast.error("Failed to approve service center");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            toast.warning("Please provide a reason for rejection");
            return;
        }
        try {
            setProcessingAction(true);
            await axios.post(`${APP_CONFIG.API_BASE_URL}/api/admin/service-centers/${id}/reject?reason=${encodeURIComponent(rejectionReason)}`);
            toast.info("Registration rejected");
            fetchStations();
            setIsReviewModalOpen(false);
            setRejectionMode(false);
            setRejectionReason("");
        } catch (error) {
            toast.error("Failed to reject");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await axios.post(`${APP_CONFIG.API_BASE_URL}/api/admin/service-centers/${id}/status?status=${status}`);
            toast.success(`Station status updated to ${status}`);
            fetchStations();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const openReviewModal = (station: Station) => {
        setSelectedStation(station);
        setRejectionMode(false);
        setRejectionReason("");
        setIsReviewModalOpen(true);
    };

    const columns = [
        {
            header: "Station Name",
            accessor: (row: Station) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                        <FiBriefcase />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Owner",
            accessor: (row: Station) => (
                <div className="font-semibold text-slate-700 text-sm">{row.owner}</div>
            )
        },

        
        {
            header: "Location",
            accessor: (row: Station) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <FiMapPin className="text-orange-400 w-3.5 h-3.5" />
                    <span className="text-xs">{row.location}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (row: Station) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        row.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {row.status}
                </span>
            )
        },
        {


            header: "Actions",
            accessor: (row: Station) => (
                <div className="flex items-center gap-2">
                    {row.status === 'Active' ? (
                        <button onClick={() => {
                            alert("Are you sure you want to suspend this service center?");
                            handleUpdateStatus(row.id, 'SUSPENDED');
                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Suspend"><FiSlash /></button>
                    ) : (





                        <button onClick={() => {
                                alert("Are you sure you want to re-activate this service center?");
                                handleUpdateStatus(row.id, 'APPROVED');}}className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Reactivate"><FiCheckCircle /></button>
                    )}
                    <button onClick={() => openReviewModal(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details"><FiFileText /></button>
                    
                </div>
            )
        }
    ];



    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Service Center Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Review registrations and manage existing service stations.</p>
                </div>
                <div className="flex gap-3">
                     <Button variant="secondary" onClick={fetchStations} className="flex items-center gap-2">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Sync DB
                    </Button>
                </div>
            </div>

            {/* Priority Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => document.getElementById('pending-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <StatCard title="Pending Requests" count={pendingStations.length.toString()} icon={<FiClock />} color="warning" />
                </div>
                <StatCard title="Active Stations" count={activeStations.length.toString()} icon={<FiCheckCircle />} color="success" />
                <StatCard title="Suspended" count={suspendedStations.length.toString()} icon={<FiSlash />} color="error" />
            </div>

            {/* PRIORITY 1: PENDING APPROVAL QUEUE */}
            {pendingStations.length > 0 && (
                <section id="pending-section" className="bg-orange-50/50 border-2 border-orange-100 rounded-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                <FiBell className="text-2xl animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Action Required</h2>
                                <p className="text-sm text-orange-700 font-medium">There are {pendingStations.length} registration requests waiting for your review.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pendingStations.map(station => (
                            <div key={station.id} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                        <FiBriefcase className="text-2xl" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{station.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                            <FiMapPin className="text-orange-500" /> {station.location}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase font-bold text-slate-500">Owner: {station.owner}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => openReviewModal(station)}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <FiFileText /> Review
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(station.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <FiCheckCircle /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PRIORITY 2: MAIN DATABASE */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Established Stations</h2>
                    <div className="relative w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search existing stations..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none transition-all"
                        />
                    </div>
                </div>
                
                {(() => {
                    const totalPages = Math.ceil(filteredStations.length / pageSize);
                    const paginatedStations = filteredStations.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                    return (
                        <>
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <Table columns={columns} data={paginatedStations} keyField="id" />
                            </div>

                            {/* Pagination Controls */}
                            {filteredStations.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
                                    <div className="text-xs font-bold text-slate-500">
                                        Showing {Math.min(filteredStations.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filteredStations.length, currentPage * pageSize)} of {filteredStations.length} stations
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
                        </>
                    );
                })()}
            </section>

            {/* DYNAMIC REVIEW MODAL */}
            {isReviewModalOpen && selectedStation && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-4xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100">
                                    <FiBriefcase className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{selectedStation.name}</h3>
                                    <p className="text-slate-500 font-medium flex items-center gap-1.5"><FiMapPin className="text-orange-500" /> {selectedStation.location}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                                <FiX className="text-2xl text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* Document Section */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { label: "Business Registration", url: selectedStation.businessRegUrl, color: "blue" },
                                        { label: "NIC / Personal ID", url: selectedStation.nicUrl, color: "purple" },
                                        { label: "Tax Identification", url: selectedStation.taxIdUrl, color: "green" }
                                    ].map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-${doc.color}-100 rounded-xl flex items-center justify-center text-${doc.color}-600`}>
                                                    <FiFileText />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{doc.label}</span>
                                            </div>
                                            {doc.url ? (
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                                                    <FiExternalLink />
                                                </a>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-bold italic">Not Uploaded</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rejection UI */}
                            {rejectionMode ? (
                                <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom-5 duration-300">
                                    <h4 className="text-red-800 font-bold flex items-center gap-2"><FiAlertCircle /> Rejection Feedback</h4>
                                    <textarea 
                                        className="w-full bg-white border border-red-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-red-100 outline-none min-h-25 transition-all"
                                        placeholder="Explain to the owner why this registration is being rejected..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    ></textarea>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={processingAction}
                                            onClick={() => handleReject(selectedStation.id)}
                                            className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-50"
                                        >
                                            {processingAction ? "Processing..." : "Confirm Rejection"}
                                        </button>
                                        <button onClick={() => setRejectionMode(false)} className="px-6 font-bold text-slate-600 hover:bg-red-100 rounded-xl transition-colors">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <button 
                                        disabled={processingAction}
                                        onClick={() => handleApprove(selectedStation.id)}
                                        className="flex-1 h-14 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <FiCheckCircle className="text-xl" /> {processingAction ? "Processing..." : "APPROVE REGISTRATION"}
                                    </button>
                                    <button 
                                        onClick={() => setRejectionMode(true)}
                                        className="h-14 px-8 border-2 border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all flex items-center gap-2"
                                    >
                                        <FiSlash /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
