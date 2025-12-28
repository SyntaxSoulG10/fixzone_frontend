"use client";

import { FiCalendar, FiClock, FiMapPin, FiTool } from "react-icons/fi";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";

export default function ServiceStationPage() {
  return (
    <div>
      <PageHeader
        title="ABC Service Center"
        description="Best place for your vehicle"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="bg-white rounded-xl border p-4">
          <img
            src="/garage1.jpg"
            className="rounded-xl mb-4"
            alt="service center"
          />

          <div className="space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <FiMapPin /> Colombo, Sri Lanka
            </p>
            <p className="flex items-center gap-2">
              <FiTool /> Full vehicle servicing
            </p>
          </div>
        </div>

        {/* Right – Booking Form */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Book Your Service</h3>

          <div className="space-y-4">
            <select className="w-full border rounded-lg p-2">
              <option>Full Package</option>
              <option>Oil Change</option>
              <option>General Service</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="border p-2 rounded-lg" />
              <input type="time" className="border p-2 rounded-lg" />
            </div>

            <textarea
              placeholder="Add description"
              className="border rounded-lg p-2 w-full"
            />

            <Button className="w-full">Book Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
