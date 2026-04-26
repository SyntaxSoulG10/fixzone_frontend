"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiCheckCircle,
  FiAward,
  FiBell,
  FiTrendingUp,
  FiMapPin,
  FiClock,
  FiStar,
  FiChevronRight,
  FiTool,
  FiUser,
} from "react-icons/fi";

import { getBookingsByCustomer } from "@/lib/api";

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

type Notification = {
  icon: string;
  message: string;
  time: string;
};

export default function CustomerDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    // Initial check from localStorage for speed
    const storedName = localStorage.getItem("fullName");
    if (storedName) setUserName(storedName);

    // Fetch live data from backend to ensure it's correct
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/customer/profile", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const fullName = data.fullName || `${data.firstName} ${data.secondName}`;
          setUserName(fullName);
          localStorage.setItem("fullName", fullName); // Sync localStorage
        }
      } catch (err) {
        console.error("Failed to fetch profile for dashboard greeting:", err);
      }
    };

    if (token) {
      fetchProfile();
    }

    if (userId) {
      getBookingsByCustomer(userId)
        .then(data => {
          setBookings(data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load dashboard data:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const getDaysInMonth = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  const getBookingsForDate = (day: number) => {
    return bookings.filter((b) => {
      try {
        const bDate = new Date(b.bookingDate);
        return bDate.getDate() === day && bDate.getMonth() === new Date().getMonth();
      } catch (e) {
        return false;
      }
    }).length;
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen space-y-6">

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Welcome Back, {userName} 👋
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Your vehicles are ready for the next service!
            </p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {[
          {
            title: "Active Bookings",
            value: bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length.toString(),
            icon: <FiCalendar className="text-blue-500 text-3xl" />,
            bg: "bg-blue-50",
          },
          {
            title: "Completed Services",
            value: bookings.filter(b => b.status === 'COMPLETED').length.toString(),
            icon: <FiTrendingUp className="text-purple-500 text-3xl" />,
            bg: "bg-purple-50",
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 md:p-8 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-xs uppercase text-slate-500 font-semibold mb-2">
              {stat.title}
            </p>
            <p className="font-bold text-2xl md:text-3xl text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-900">Schedule Calendar</h2>

          <div className="grid grid-cols-7 text-xs text-slate-500 text-center mb-2 font-semibold">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((day) => {
              const count = getBookingsForDate(day);
              const isSelected = day === selectedDate;

              let bg = "bg-slate-50 hover:bg-slate-100 text-slate-700";
              if (count === 1) bg = "bg-orange-50 hover:bg-orange-100 text-orange-700";
              if (count >= 2) bg = "bg-orange-500 text-white hover:bg-orange-600";
              if (isSelected) bg += " ring-2 ring-orange-500";

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`py-2 md:py-3 rounded-lg ${bg} transition-all font-medium text-sm`}
                >
                  {day}
                </button>
              );
            })}
          </div>


          <div className="mt-6">
            <h3 className="font-bold mb-3 text-slate-900">Notifications</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {bookings.filter(b => b.status === 'CONFIRMED').map((b, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-sm text-slate-900">Upcoming service at {b.serviceCenterName}</p>
                    <span className="text-xs text-slate-400">{b.bookingDate} at {b.bookingTime}</span>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'CONFIRMED').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
              )}
            </div>
          </div>
        </div>


        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-900">Booking Details</h2>

          <div className="space-y-4">
            {loading ? (
              <div className="py-10 text-center text-slate-400 italic">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="py-10 text-center text-slate-400 italic">No bookings found. Start by booking a service!</div>
            ) : bookings.map((b, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{b.serviceCenterName}</h3>
                    <p className="text-sm text-slate-600">{b.vehicleName || "Registered Vehicle"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    b.status === "IN_PROGRESS"
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : b.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <div className="flex items-center gap-1">
                    <FiTool className="w-4 h-4" />
                    <span>{b.packageName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{b.bookingTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-3 text-slate-900">Upcoming Appointments</h3>
            <div className="space-y-2">
              {bookings.filter(b => b.status === 'CONFIRMED').slice(0, 3).map((a, i) => (
                <div key={i} className="p-4 border-2 border-slate-200 rounded-xl hover:border-orange-300 transition-colors bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{a.vehicleName || "Registered Vehicle"}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                        <FiMapPin className="w-3.5 h-3.5" />
                        <span>{a.serviceCenterName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>{a.bookingDate} at {a.bookingTime}</span>
                      </div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'CONFIRMED').length === 0 && (
                <p className="text-xs text-slate-400 italic">No upcoming appointments scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Link href="/dashboard/customer/bookings">
        <button className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-sm md:text-base flex items-center gap-2">
          <span className="text-xl">+</span>
          <span className="hidden sm:inline">Book Service</span>
        </button>
      </Link>
    </div>
  );
}