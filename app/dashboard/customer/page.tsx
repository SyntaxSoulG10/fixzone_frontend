"use client";

import { useState } from "react";
import { FiCalendar, FiCheckCircle, FiAward, FiBell, FiTrendingUp } from "react-icons/fi";

export default function ModernDashboardDark() {
  const [selectedDate, setSelectedDate] = useState(17);

  const bookings = [
    { branch: "ABC Service Station", status: "In Progress", vehicle: "Honda Civic 2020", service: "Standard Service", time: "Dec 17, 10:00 am", progress: 60, color: "from-orange-600 to-orange-400" },
    { branch: "XYZ Auto Care", status: "Pending", vehicle: "Toyota Camry", service: "Full Service", time: "Dec 17, 11:30 am", progress: 0, color: "from-blue-600 to-blue-400" },
    { branch: "LMN Motors", status: "Completed", vehicle: "Ford Focus", service: "Standard Service", time: "Dec 20, 09:00 am", progress: 100, color: "from-green-600 to-green-400" },
  ];

  const upcomingAppointments = [
    { vehicle: "Honda Civic", branch: "ABC Service", time: "Dec 28, 10:00 am" },
    { vehicle: "Toyota Camry", branch: "XYZ Auto Care", time: "Dec 30, 11:30 am" },
  ];

  const notifications = [
    { icon: "✅", message: "Honda Civic service completed", time: "10:00 am" },
    { icon: "💬", message: "New offer: 20% off full service!", time: "Yesterday" },
    { icon: "⚠️", message: "Toyota Camry next service due Dec 30", time: "2 days ago" },
    { icon: "💡", message: "Check your loyalty points balance", time: "3 days ago" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900 space-y-8">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-3xl p-8 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Alex 👋</h1>
            <p className="text-gray-200 text-sm">Your vehicles are ready for the next service!</p>
          </div>
          <FiBell className="h-7 w-7 text-gray-200 hover:text-yellow-400 cursor-pointer" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: "Next Service", value: "Dec 28", icon: <FiCalendar className="text-blue-500 text-2xl" /> },
          { title: "Loyalty Points", value: "1,250", icon: <FiAward className="text-yellow-500 text-2xl" /> },
          { title: "Vehicle Status", value: "Healthy", icon: <FiCheckCircle className="text-green-500 text-2xl" /> },
          { title: "Completed Services", value: "8", icon: <FiTrendingUp className="text-purple-500 text-2xl" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-5 border">
            <div className="flex items-center gap-3 mb-2">
              {stat.icon}
              <p className="text-xs uppercase text-gray-500 font-semibold">{stat.title}</p>
            </div>
            <p className="font-bold text-lg">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar + Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Calendar */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-lg font-bold mb-4">Schedule Calendar</h2>

          {/* ✅ FIXED KEYS HERE */}
          <div className="grid grid-cols-7 text-xs text-gray-400 text-center mb-2">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const count = bookings.filter(b => b.time.includes(`Dec ${day}`)).length;

              let bg = "bg-gray-100";
              if (count === 1) bg = "bg-blue-200";
              if (count >= 2) bg = "bg-blue-500 text-white";

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`py-2 rounded-lg ${bg} ${day === selectedDate ? "ring-2 ring-blue-500" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          <div className="mt-6">
            <h3 className="font-bold mb-3">Messages & Notifications</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
                  <span className="text-xl">{n.icon}</span>
                  <div>
                    <p className="text-sm">{n.message}</p>
                    <span className="text-xs text-gray-400">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-lg font-bold mb-4">Booking Details</h2>

          <div className="space-y-4">
            {bookings.map((b, i) => (
              <div key={i} className={`p-4 rounded-2xl bg-gradient-to-r ${b.color} text-white`}>
                <h3 className="font-bold">{b.branch}</h3>
                <p className="text-sm">{b.vehicle}</p>
                <p className="text-xs opacity-80">{b.service} • {b.time}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-3">Upcoming Appointments</h3>
            {upcomingAppointments.map((a, i) => (
              <div key={i} className="p-3 border rounded-lg mb-2">
                {a.vehicle} • {a.branch} • {a.time}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button className="fixed bottom-8 right-8 bg-blue-700 text-white p-4 rounded-full shadow-lg">
        + Book Service
      </button>
    </div>
  );
}




