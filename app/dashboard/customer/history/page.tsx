"use client";

import { useState } from "react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { 
  FiCheckCircle, 
  FiClock, 
  FiCalendar, 
  FiMapPin, 
  FiTruck,
  FiX,
  FiEdit,
  FiDownload,
  FiAlertCircle
} from "react-icons/fi";

const DUMMY_BOOKINGS = {
  current: [
    {
      id: 1,
      service: "ABC Service Station",
      address: "Shop 24, Service street",
      vehicle: "Honda Civic 2020",
      serviceType: "Standard Service",
      date: "17/12/2025",
      time: "10:00 am",
      status: "in-progress",
      progress: 60,
      cost: "$150.00",
      serviceDetails: ["Oil Change", "Brake Inspection", "Tire Rotation"]
    }
  ],
  upcoming: [
    {
      id: 2,
      service: "ABC Service Station",
      address: "Shop 24, Service street",
      vehicle: "Honda Civic 2020",
      serviceType: "Standard Service",
      date: "28/12/2025",
      time: "10:00 am",
      status: "confirmed",
      cost: "$150.00",
      serviceDetails: ["Full Inspection", "Oil Change"]
    }
  ],
  past: [
    {
      id: 3,
      service: "ABC Service Station",
      address: "Shop 24, Service street",
      vehicle: "Honda Civic 2020",
      serviceType: "Standard Service",
      date: "15/11/2024",
      time: "10:00 am",
      status: "completed",
      cost: "$150.00",
      rating: 5,
      serviceDetails: ["Brake Replacement", "Oil Change"]
    },
    {
      id: 4,
      service: "KML Service Center",
      address: "Downtown Plaza",
      vehicle: "Honda Civic 2020",
      serviceType: "Express Service",
      date: "02/10/2024",
      time: "2:00 pm",
      status: "completed",
      cost: "$95.00",
      rating: 4,
      serviceDetails: ["Quick Service", "Tire Check"]
    }
  ]
};

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');

  const tabs = [
    { key: 'current', label: 'Current', count: DUMMY_BOOKINGS.current.length },
    { key: 'upcoming', label: 'Upcoming', count: DUMMY_BOOKINGS.upcoming.length },
    { key: 'past', label: 'Past', count: DUMMY_BOOKINGS.past.length }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      'in-progress': { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'In Progress', icon: FiClock },
      'confirmed': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Confirmed', icon: FiCheckCircle },
      'completed': { color: 'bg-green-100 text-green-700 border-green-200', label: 'Completed', icon: FiCheckCircle }
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const renderBookingCard = (booking: any, type: string) => {
    return (
      <div key={booking.id} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiTruck className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{booking.service}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {booking.address}
              </p>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Vehicle</p>
            <p className="text-sm font-semibold text-slate-900">{booking.vehicle}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Service Type</p>
            <p className="text-sm font-semibold text-slate-900">{booking.serviceType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Date</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <FiCalendar className="w-3 h-3 text-slate-400" />
              {booking.date}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Time</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <FiClock className="w-3 h-3 text-slate-400" />
              {booking.time}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">Services Included:</p>
          <div className="flex flex-wrap gap-2">
            {booking.serviceDetails.map((service: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Progress Bar (for current bookings) */}
        {type === 'current' && booking.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-medium">Service Progress</span>
              <span className="text-orange-600 font-bold">{booking.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                style={{ width: `${booking.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Rating (for past bookings) */}
        {type === 'past' && booking.rating && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500 font-medium">Your Rating:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < booking.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-lg font-bold text-slate-900">{booking.cost}</div>
          
          <div className="flex gap-2">
            {type === 'current' && (
              <>
                <Button className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
                  Track Status
                </Button>
                <Button className="px-4 py-2 text-sm border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold transition-colors">
                  Contact
                </Button>
              </>
            )}
            
            {type === 'upcoming' && (
              <>
                <Button className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <FiEdit className="w-4 h-4" />
                  Reschedule
                </Button>
                <Button className="px-4 py-2 text-sm border-2 border-red-300 hover:border-red-400 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <FiX className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            )}
            
            {type === 'past' && (
              <>
                <Button className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                  <FiDownload className="w-4 h-4" />
                  Invoice
                </Button>
                <Button className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">
                  Book Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const currentBookings = DUMMY_BOOKINGS[activeTab];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="View and manage all your service appointments"
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all
                ${activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key 
                  ? 'bg-white/20' 
                  : 'bg-slate-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {currentBookings.length > 0 ? (
          currentBookings.map((booking) => renderBookingCard(booking, activeTab))
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No {activeTab} bookings</h3>
            <p className="text-sm text-slate-500 mb-6">
              {activeTab === 'current' && "You don't have any active service appointments."}
              {activeTab === 'upcoming' && "You don't have any upcoming appointments scheduled."}
              {activeTab === 'past' && "You don't have any service history yet."}
            </p>
            <Button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold">
              Book a Service
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
