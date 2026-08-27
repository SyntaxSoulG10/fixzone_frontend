"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { FiBarChart2, FiDollarSign, FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import APP_CONFIG from "@/config";
import { useDashboardData } from "@/context/DashboardDataContext";

function formatDateToISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function AnalyticsPage() {
    const { centersData, bookingsData, invoicesData } = useDashboardData();
    const [weekOffset, setWeekOffset] = useState<number>(0);
    const [savedReports, setSavedReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentCenter = centersData && centersData.length > 0 ? centersData[0] : null;
    const managerCenterId = currentCenter?.centerId || currentCenter?.id;

    // Calculate dates for the selected week (Monday to Sunday)
    const { monday, sunday, days, startDateStr, endDateStr } = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ...
        const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;

        const mon = new Date(now);
        mon.setDate(now.getDate() + diffToMonday + (weekOffset * 7));
        mon.setHours(0, 0, 0, 0);

        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        sun.setHours(23, 59, 59, 999);

        const dayList = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            dayList.push(d);
        }

        return {
            monday: mon,
            sunday: sun,
            days: dayList,
            startDateStr: formatDateToISO(mon),
            endDateStr: formatDateToISO(sun)
        };
    }, [weekOffset]);

    // Fetch saved operations reports
    const fetchSavedReports = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/reports`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                const parsedReports = data.map((r: any) => {
                    let metrics = { revenue: 0, vehiclesServiced: 0, incompleteServices: 0, summary: "", reportDate: "" };
                    try {
                        if (r.fileContentBase64) {
                            const parsed = typeof r.fileContentBase64 === "string" ? JSON.parse(r.fileContentBase64) : r.fileContentBase64;
                            if (parsed && typeof parsed === "object") {
                                metrics = {
                                    revenue: Number(parsed.revenue) || 0,
                                    vehiclesServiced: Number(parsed.vehiclesServiced) || 0,
                                    incompleteServices: Number(parsed.incompleteServices) || 0,
                                    summary: parsed.summary || "",
                                    reportDate: parsed.reportDate || ""
                                };
                            }
                        }
                    } catch(e) {}
                    const reportDate = metrics.reportDate || (r.date ? String(r.date).split("T")[0] : null) || r.name?.replace("Daily Operations Report - ", "") || (r.createdAt ? r.createdAt.split("T")[0] : "Report");
                    return { ...r, date: reportDate, metrics };
                });
                setSavedReports(parsedReports);
            }
        } catch (error) {
            console.error("Failed to fetch reports for analytics:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedReports();
    }, [fetchSavedReports]);

    // Calculate exact daily revenue and bookings matching reports page logic
    const { dailyChartData, totalWeekRevenue, totalWeekBookings } = useMemo(() => {
        const isMatchingDate = (dStr: any, targetDate: string) => {
            if (!dStr) return false;
            try {
                const str = String(dStr).split("T")[0].trim();
                if (str === targetDate) return true;
                const dateObj = new Date(dStr);
                if (!isNaN(dateObj.getTime())) {
                    const localStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    if (localStr === targetDate) return true;
                }
                return false;
            } catch {
                return false;
            }
        };

        let weekRevenueSum = 0;
        let weekBookingsSum = 0;

        const chartItems = days.map((dateObj) => {
            const dateISO = formatDateToISO(dateObj);
            const dayNum = dateObj.getDate();
            const monthShort = dateObj.toLocaleString('en-US', { month: 'short' });
            const weekdayShort = dateObj.toLocaleString('en-US', { weekday: 'short' });

            // 1. Check if a saved daily report exists for this date
            const savedReport = savedReports.find(
                (r: any) => r.date === dateISO || r.metrics?.reportDate === dateISO || r.name?.includes(dateISO)
            );

            let dayRevenue = 0;

            if (savedReport && savedReport.metrics && savedReport.metrics.revenue !== undefined && savedReport.metrics.revenue !== null) {
                dayRevenue = Number(savedReport.metrics.revenue) || 0;
            } else {
                // 2. Compute dynamically using invoices and bookings
                const countedBookingIds = new Set<string>();

                (invoicesData || []).forEach((inv: any) => {
                    if (managerCenterId && inv.centerId && inv.centerId !== managerCenterId) return;
                    const isPaid = String(inv.status || "").toUpperCase() === "PAID";
                    if (!isPaid) return;

                    const isDate = isMatchingDate(inv.updatedAt, dateISO) || 
                                   isMatchingDate(inv.issuedAt, dateISO) || 
                                   isMatchingDate(inv.createdAt, dateISO) || 
                                   isMatchingDate(inv.createdDate, dateISO);
                    if (isDate) {
                        const amt = Number(inv.total) || Number(inv.amount) || Number(inv.subtotal) || 0;
                        dayRevenue += amt;
                        if (inv.bookingId) countedBookingIds.add(String(inv.bookingId));
                    }
                });

                (bookingsData || []).forEach((b: any) => {
                    if (managerCenterId && b.centerId && b.centerId !== managerCenterId) return;
                    const isDate = isMatchingDate(b.updatedAt, dateISO) || 
                                   isMatchingDate(b.bookingDate, dateISO) || 
                                   isMatchingDate(b.createdAt, dateISO);
                    if (!isDate) return;

                    const s = String(b.status || "").toUpperCase().trim().replace(/[\s-]+/g, "_");
                    if (s === "PAID") {
                        if (!countedBookingIds.has(String(b.bookingId))) {
                            const cost = Number(b.estimatedCost) || Number(b.totalAmount) || Number(b.bookingFee) || 0;
                            dayRevenue += cost;
                            if (b.bookingId) countedBookingIds.add(String(b.bookingId));
                        }
                    }
                });
            }

            // Count bookings for this day
            let dayBookingsCount = 0;
            (bookingsData || []).forEach((b: any) => {
                if (managerCenterId && b.centerId && b.centerId !== managerCenterId) return;
                const isDate = isMatchingDate(b.bookingDate, dateISO) || 
                               isMatchingDate(b.createdAt, dateISO) || 
                               isMatchingDate(b.updatedAt, dateISO);
                if (isDate) {
                    dayBookingsCount++;
                }
            });

            weekRevenueSum += dayRevenue;
            weekBookingsSum += dayBookingsCount;

            return {
                dayName: weekdayShort,
                date: `${dayNum} ${monthShort}`,
                fullLabel: `${weekdayShort}, ${dayNum} ${monthShort}`,
                revenue: dayRevenue,
                bookings: dayBookingsCount
            };
        });

        return {
            dailyChartData: chartItems,
            totalWeekRevenue: weekRevenueSum,
            totalWeekBookings: weekBookingsSum
        };
    }, [days, savedReports, invoicesData, bookingsData, managerCenterId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px] text-slate-500">
                <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading analytics...</span>
                </div>
            </div>
        );
    }

    const formattedRange = `${monday.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    return (
        <div className="space-y-6">
            {/* Header with Title and Week Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Weekly Performance Analytics</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track daily revenue and booking performance</p>
                </div>

                {/* Week Navigation Controls */}
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
                    <button
                        onClick={() => setWeekOffset((prev) => prev - 1)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Previous Week"
                        aria-label="Previous Week"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-1.5 px-2 text-sm font-medium text-slate-700 select-none">
                        <FiCalendar className="w-4 h-4 text-orange-500" />
                        <span>{formattedRange}</span>
                        {weekOffset === 0 && (
                            <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                                Current
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => setWeekOffset((prev) => prev + 1)}
                        disabled={weekOffset >= 0}
                        className={`p-1.5 rounded-lg transition-colors ${
                            weekOffset >= 0
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                        title="Next Week"
                        aria-label="Next Week"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>

                    {weekOffset !== 0 && (
                        <button
                            onClick={() => setWeekOffset(0)}
                            className="ml-2 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline pl-2 border-l border-slate-200"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Key Metrics Row - 2 Cards without Growth Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`Rs ${totalWeekRevenue.toLocaleString()}`}
                    icon={<FiDollarSign />}
                    color="green"
                />
                <MetricCard
                    title="Total Bookings"
                    value={totalWeekBookings}
                    icon={<FiBarChart2 />}
                    color="blue"
                />
            </div>

            {/* Daily Revenue Bar Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Daily Revenue Analysis</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Showing daily revenue breakdown for {formattedRange}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span className="inline-block w-3 h-3 rounded bg-orange-500"></span>
                        <span>Daily Revenue (Rs)</span>
                    </div>
                </div>

                <div className="h-80 w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <BarChart data={dailyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dy={8}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                tickFormatter={(val) => `Rs ${val}`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF7ED', opacity: 0.8 }} />
                            <Bar
                                dataKey="revenue"
                                fill="#F97316"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const itemData = payload[0].payload;
        return (
            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                <p className="font-semibold text-slate-200">{itemData.fullLabel || label}</p>
                <p className="text-orange-400 font-bold text-sm">
                    Revenue: Rs {Number(payload[0].value || 0).toLocaleString()}
                </p>
                <p className="text-slate-400 text-[11px]">
                    Bookings: {itemData.bookings || 0}
                </p>
            </div>
        );
    }
    return null;
}

function MetricCard({ title, value, icon, color }: any) {
    const colors: any = {
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-xl">{icon}</div>
                </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}
