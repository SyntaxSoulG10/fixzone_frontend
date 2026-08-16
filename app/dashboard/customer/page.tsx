"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiCheckCircle,
  FiBell,
  FiChevronRight,
  FiPlus,
  FiClock,
  FiZap,
  FiMapPin,
  FiStar,
} from "react-icons/fi";
import BookingCard from "@/components/bookings/BookingCard";
import { getMyBookings, getNotifications } from "@/lib/api";
import { enrichBookingsWithCenterNames } from "@/lib/enrichBookings";
import APP_CONFIG from "@/config";
type Booking = {
  bookingId: string;
  serviceCenterName: string;
  status: string;
  vehicleName?: string;
  packageName: string;
  bookingTime: string;
  bookingDate: string;
  progress?: number;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ─── tiny helpers ─────────────────────────────────────────── */

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-600">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function ViewAllLink({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors shrink-0 px-2 py-1.5 rounded-lg hover:bg-orange-50"
    >
      {label}
      <FiChevronRight className="w-4 h-4" />
    </Link>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ─── Notification type config ─────────────────────────────── */
const NOTIF_CONFIG: Record<string, { bg: string; dot: string; emoji: string }> = {
  SUCCESS:  { bg: "bg-emerald-100", dot: "bg-emerald-500", emoji: "✅" },
  WARNING:  { bg: "bg-amber-100",   dot: "bg-amber-500",   emoji: "⚠️" },
  ERROR:    { bg: "bg-red-100",     dot: "bg-red-500",     emoji: "🚨" },
  default:  { bg: "bg-blue-100",    dot: "bg-blue-500",    emoji: "ℹ️" },
};

/* ═══════════════════════════════════════════════════════════ */
export default function CustomerDashboard() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [serviceCenters, setServiceCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Guest");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("fullName");
    if (storedName) setUserName(storedName);
    const storedPic = localStorage.getItem("profilePictureUrl");
    if (storedPic) setProfilePictureUrl(storedPic);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const fullName = data.fullName || `${data.firstName} ${data.secondName}`;
          setUserName(fullName);
          localStorage.setItem("fullName", fullName);
          if (data.profilePictureUrl) {
            setProfilePictureUrl(data.profilePictureUrl);
            localStorage.setItem("profilePictureUrl", data.profilePictureUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    if (token) fetchProfile();

    // Fetch Service Centers
    fetch(`${APP_CONFIG.API_BASE_URL}/api/service-centers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const valid = list.filter((c: any) => {
          const status = (c.status || "").toUpperCase();
          return status !== "SUSPENDED" && status !== "REJECTED" && c.isActive !== false;
        });
        if (valid.length > 0) {
          setServiceCenters(valid);
        } else {
          setServiceCenters([
            {
              centerId: "11111111-1111-1111-1111-111111111111",
              name: "Raja Motors - Colombo HQ",
              address: "123 Galle Road, Colombo 03",
              openingHours: "08:00 - 18:00",
              rating: 4.8,
              supportedVehicleBrands: ["Toyota", "Honda", "Nissan", "Suzuki"],
            },
            {
              centerId: "11111111-1111-1111-1111-111111111112",
              name: "Raja Motors - Kandy Branch",
              address: "45 Peradeniya Road, Kandy",
              openingHours: "08:30 - 17:30",
              rating: 4.7,
              supportedVehicleBrands: ["Toyota", "Nissan", "Mitsubishi", "Hyundai"],
            },
            {
              centerId: "11111111-1111-1111-1111-111111111113",
              name: "Raja Motors - Galle Hub",
              address: "78 Matara Road, Galle",
              openingHours: "08:00 - 18:00",
              rating: 4.9,
              supportedVehicleBrands: ["Toyota", "Honda", "Kia", "Suzuki"],
            }
          ]);
        }
      })
      .catch((err) => {
        console.warn("Service centers fetch error, fallback to defaults:", err);
        setServiceCenters([
          {
            centerId: "11111111-1111-1111-1111-111111111111",
            name: "Raja Motors - Colombo HQ",
            address: "123 Galle Road, Colombo 03",
            openingHours: "08:00 - 18:00",
            rating: 4.8,
            supportedVehicleBrands: ["Toyota", "Honda", "Nissan", "Suzuki"],
          },
          {
            centerId: "11111111-1111-1111-1111-111111111112",
            name: "Raja Motors - Kandy Branch",
            address: "45 Peradeniya Road, Kandy",
            openingHours: "08:30 - 17:30",
            rating: 4.7,
            supportedVehicleBrands: ["Toyota", "Nissan", "Mitsubishi", "Hyundai"],
          },
          {
            centerId: "11111111-1111-1111-1111-111111111113",
            name: "Raja Motors - Galle Hub",
            address: "78 Matara Road, Galle",
            openingHours: "08:00 - 18:00",
            rating: 4.9,
            supportedVehicleBrands: ["Toyota", "Honda", "Kia", "Suzuki"],
          }
        ]);
      });

    if (userId) {
      getMyBookings()
        .then(async (raw) => {
          const data = await enrichBookingsWithCenterNames(raw);
          setBookings(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Dashboard data error:", err);
          setLoading(false);
        });

      getNotifications()
        .then((data) => setNotifications(data || []))
        .catch((err) => console.error("Notifications error:", err));
    } else {
      setLoading(false);
    }
  }, []);

  /* ─── derived data ─────────────────────────────────────── */
  const isFutureBooking = (b: Booking) => {
    try {
      const ds = b.bookingTime ? `${b.bookingDate}T${b.bookingTime}` : b.bookingDate;
      return new Date(ds).getTime() > Date.now();
    } catch { return false; }
  };

  const formatBookingDateTime = (b: Booking) => {
    try {
      const ds = b.bookingTime ? `${b.bookingDate}T${b.bookingTime}` : b.bookingDate;
      const dt = new Date(ds);
      if (isNaN(dt.getTime())) {
        if (b.bookingDate && b.bookingTime) return `${b.bookingDate} ${b.bookingTime}`.trim();
        return b.bookingDate || b.bookingTime || "Date/time unavailable";
      }
      return dt.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return b.bookingTime || "Date/time unavailable"; }
  };

  const upcomingConfirmed = bookings
    .filter((b) => {
      const s = (b.status || "").toUpperCase();
      return s === "CONFIRMED" || s === "PENDING_PAYMENT";
    })
    .sort((a, z) => {
      const ta = new Date(a.bookingTime ? `${a.bookingDate}T${a.bookingTime}` : a.bookingDate).getTime() || 0;
      const tz = new Date(z.bookingTime ? `${z.bookingDate}T${z.bookingTime}` : z.bookingDate).getTime() || 0;
      return ta - tz;
    });

  const inProgressBookings = bookings.filter((b) => (b.status || "").toUpperCase() === "IN_PROGRESS");

  const activeBookingsCount = bookings.filter((b) => {
    const s = (b.status || "").toUpperCase();
    return s === "CONFIRMED" || s === "IN_PROGRESS" || s === "PENDING_PAYMENT";
  }).length;

  const completedCount = bookings.filter((b) => (b.status || "").toUpperCase() === "COMPLETED").length;
  const unreadNotifications = notifications.filter((n) => !(n.read !== undefined ? n.read : n.isRead)).length;

  const firstName = userName.split(" ")[0] || userName;
  const todayLabel = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const monthLabel = today.toLocaleString(undefined, { month: "long", year: "numeric" });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const getBookingsForDate = (day: number) =>
    bookings.filter((b) => {
      try {
        const d = new Date(b.bookingDate);
        return d.getDate() === day && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      } catch { return false; }
    });

  const selectedDayBookings = getBookingsForDate(selectedDate);

  const calendarCells = [
    ...Array.from({ length: firstDayOffset }, (_, i) => ({ type: "empty" as const, key: `e-${i}` })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ type: "day" as const, day: i + 1, key: `d-${i + 1}` })),
  ];

  /* ─── stats config ─────────────────────────────────────── */
  const stats = [
    {
      title: "Active Bookings",
      value: activeBookingsCount,
      icon: FiCalendar,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600",
      badge: activeBookingsCount > 0 ? "Live" : null,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Completed Services",
      value: completedCount,
      icon: FiCheckCircle,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600",
      badge: completedCount > 0 ? `+${completedCount}` : null,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Unread Alerts",
      value: unreadNotifications,
      icon: FiBell,
      gradient: "from-amber-400 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
      badge: unreadNotifications > 0 ? "New" : null,
      badgeColor: "bg-amber-100 text-amber-700",
    },
  ];

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 pb-28 animate-fade-in">

      {/* ── Hero / Welcome ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10 md:px-10 md:py-12 shadow-xl">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-20 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* avatar */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg shadow-orange-500/30 shrink-0 overflow-hidden">
              {loading ? (
                <span className="w-6 h-6 rounded-full bg-white/20 animate-pulse inline-block" />
              ) : profilePictureUrl ? (
                <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(userName)
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-1">
                {todayLabel}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Hey, {firstName} 👋
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Welcome back {firstName}.book your next service.
              </p>
            </div>
          </div>

          {/* quick actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/customer/bookings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <FiPlus className="w-4 h-4" />
              Book Service
            </Link>
            <Link
              href="/dashboard/customer/history?tab=past"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5 active:scale-95 border border-white/10"
            >
              <FiClock className="w-4 h-4" />
              History
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
            >
              {/* gradient accent strip top */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient} rounded-t-2xl`} />

              {/* inner padding — generous on all sides */}
              <div className="px-7 pt-8 pb-7">
                <div className="flex items-start justify-between mb-7">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.badge && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.badgeColor}`}>
                      {stat.badge}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 font-medium mb-2">{stat.title}</p>
                <p className="text-5xl font-bold text-slate-900 tracking-tight leading-none">
                  {loading ? (
                    <span className="inline-block w-12 h-10 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>

              {/* subtle hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-2xl pointer-events-none`} />
            </div>
          );
        })}
      </div>

      {/* ── Active Bookings ────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<FiZap className="w-5 h-5" />}
          title="Active Bookings"
          subtitle="In-progress & upcoming confirmed services"
          action={<ViewAllLink href="/dashboard/customer/history?tab=upcoming" />}
        />

        <div className="p-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
            </div>
          ) : inProgressBookings.length === 0 && upcomingConfirmed.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-7 h-7 text-orange-400" />
              </div>
              <p className="text-base font-bold text-slate-800 mb-1">No upcoming appointments</p>
              <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">
                Book a service to keep your vehicle in top shape.
              </p>
              <Link
                href="/dashboard/customer/bookings"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5"
              >
                <FiPlus className="w-4 h-4" />
                Book a Service
              </Link>
            </div>
          ) : (
            <>
              {inProgressBookings.map((b, i) => (
                <BookingCard
                  key={b.bookingId || `ip-${i}`}
                  booking={b}
                  compact
                  formattedDateTime={formatBookingDateTime(b)}
                  onClick={() => { window.location.href = '/dashboard/customer/history?tab=current'; }}
                />
              ))}
              {upcomingConfirmed.map((b, i) => (
                <BookingCard
                  key={b.bookingId || `up-${i}`}
                  booking={b}
                  compact
                  formattedDateTime={formatBookingDateTime(b)}
                  onClick={() => { window.location.href = '/dashboard/customer/history?tab=upcoming'; }}
                />
              ))}
            </>
          )}
        </div>
      </section>

      {/* ── Available Service Centers ─────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<FiMapPin className="w-5 h-5" />}
          title="Service Centers"
          subtitle="Explore authorized maintenance hubs and book your appointment"
          action={<ViewAllLink href="/dashboard/customer/bookings" label="View all centers" />}
        />

        <div className="p-5">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
              <SkeletonBlock className="h-44" />
            </div>
          ) : serviceCenters.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <FiMapPin className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No service centers currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceCenters.slice(0, 6).map((center: any) => (
                <div
                  key={center.centerId || center.id}
                  className="group relative bg-slate-50 hover:bg-white rounded-xl p-5 border border-slate-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 text-base">
                        {center.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        ⭐ {center.rating || "4.8"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2 line-clamp-1">
                      <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {center.address || "Authorized Branch"}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                      <FiClock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{center.openingHours || "08:00 - 18:00"}</span>
                    </div>

                    {center.supportedVehicleBrands && center.supportedVehicleBrands.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {center.supportedVehicleBrands.slice(0, 3).map((brand: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-600">
                            {brand}
                          </span>
                        ))}
                        {center.supportedVehicleBrands.length > 3 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 text-slate-400">
                            +{center.supportedVehicleBrands.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/customer/bookings/${center.centerId || center.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm group-hover:shadow"
                  >
                    <span>Book Service</span>
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Calendar + Notifications ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Calendar */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={<FiClock className="w-5 h-5" />}
            title="Schedule"
            subtitle={monthLabel}
          />

          <div className="p-5">
            {/* weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-slate-400 py-1.5 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                if (cell.type === "empty") return <div key={cell.key} className="aspect-square" />;

                const day = cell.day;
                const count = getBookingsForDate(day).length;
                const isSelected = day === selectedDate;
                const isToday = day === today.getDate();

                let base = "aspect-square rounded-xl flex flex-col items-center justify-center text-base font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 relative select-none";

                let colors = "text-slate-600 hover:bg-slate-100";
                if (count === 1) colors = "bg-orange-50 text-orange-700 hover:bg-orange-100";
                if (count >= 2) colors = "bg-orange-100 text-orange-800 hover:bg-orange-200";
                if (isToday && !isSelected) colors += " ring-2 ring-orange-300 ring-offset-1";
                if (isSelected) colors = "bg-orange-500 text-white shadow-md shadow-orange-300 scale-105 hover:bg-orange-600";

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    aria-label={`${monthLabel} ${day}${count ? `, ${count} booking${count !== 1 ? "s" : ""}` : ""}`}
                    aria-pressed={isSelected}
                    className={`${base} ${colors}`}
                  >
                    {day}
                    {count > 0 && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* selected day bookings */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {selectedDate === today.getDate()
                  ? "Today"
                  : `${monthLabel.split(" ")[0]} ${selectedDate}`}
              </p>

              {selectedDayBookings.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">No bookings on this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayBookings.map((b, i) => (
                    <div
                      key={b.bookingId || i}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-100 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {b.packageName || b.vehicleName || "Service"}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{b.serviceCenterName}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0 whitespace-nowrap">
                        {(b.status || "").toString().replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <SectionHeader
            icon={<FiBell className="w-5 h-5" />}
            title="Notifications"
            subtitle={
              unreadNotifications > 0
                ? `${unreadNotifications} unread`
                : "You're all caught up"
            }
            action={<ViewAllLink href="/dashboard/customer/notifications" />}
          />

          <div className="p-4 flex-1 space-y-2 max-h-[440px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiBell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 7).map((n, i) => {
                const isRead = n.read !== undefined ? n.read : n.isRead;
                const cfg = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.default;
                return (
                  <Link
                    key={n.id || i}
                    href={`/dashboard/customer/notifications/${n.id}`}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm ${
                      !isRead
                        ? "bg-orange-50/60 border-orange-200 hover:border-orange-300"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* type icon */}
                    <span className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center text-base shrink-0`} aria-hidden="true">
                      {cfg.emoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${!isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!isRead && (
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0 mt-2`} aria-label="Unread" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </section>

      </div>

      {/* ── Floating Action Button ─────────────────────────── */}
      <Link href="/dashboard/customer/bookings" aria-label="Book a service">
        <button
          type="button"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-full shadow-xl shadow-orange-500/30 hover:shadow-2xl transition-all font-bold text-sm flex items-center gap-2 hover:-translate-y-0.5 active:scale-95"
        >
          <FiPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Book Service</span>
        </button>
      </Link>
    </div>
  );
}
