"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";
import { useState } from "react";

type Review = { user: string; rating: number; comment: string; date?: string };

const STATIONS = [
  { 
    id: "abc-1", 
    name: "ABC Service Center", 
    location: "Colombo", 
    image: "/garages/garage01.jpg", 
    rating: 4.5, 
    services: ["Full Package","Oil Change","General Service"], 
    coordinates: { lat: 6.9271, lng: 79.8612 }, 
    reviews: [
      { user: "Nimal", rating: 5, comment: "Excellent service and friendly staff.", date: "2025-12-01" },
      { user: "Kumari", rating: 4, comment: "Good service, but a bit crowded.", date: "2025-12-05" },
      { user: "Sunil", rating: 4, comment: "Quick and professional.", date: "2025-12-10" }
    ] as Review[] 
  },
  { 
    id: "kml-1", 
    name: "KML Auto Care", 
    location: "Gampaha", 
    image: "/garages/garage02.jpg", 
    rating: 4.3, 
    services: ["Full Package","Oil Change","General Service"], 
    coordinates: { lat: 7.0915, lng: 80.0108 }, 
    reviews: [
      { user: "Ramesh", rating: 4, comment: "Friendly staff, reasonable price.", date: "2025-11-20" },
      { user: "Anjali", rating: 5, comment: "Perfect experience!", date: "2025-11-22" }
    ] as Review[] 
  },
  { 
    id: "btech-1", 
    name: "B Tech Motors", 
    location: "Colombo", 
    image: "/garages/garage03.jpg", 
    rating: 4.6, 
    services: ["Full Package","Oil Change","General Service"], 
    coordinates: { lat: 6.9271, lng: 79.8612 }, 
    reviews: [
      { user: "Suresh", rating: 5, comment: "Highly recommend for all services.", date: "2025-12-02" },
      { user: "Maya", rating: 4, comment: "Good experience, will visit again.", date: "2025-12-08" }
    ] as Review[]
  },
  { 
    id: "auto-1", 
    name: "Auto Pro Service", 
    location: "Kandy", 
    image: "/garages/garage01.jpg", 
    rating: 4.0, 
    services: ["Full Package","Oil Change","General Service"], 
    coordinates: { lat: 7.2906, lng: 80.6337 }, 
    reviews: [
      { user: "Ravi", rating: 4, comment: "Service was okay.", date: "2025-12-03" }
    ] as Review[]
  },
  { 
    id: "speed-1", 
    name: "Speed Motors", 
    location: "Galle", 
    image: "/garages/garage02.jpg", 
    rating: 4.8, 
    services: ["Full Package","Oil Change","General Service"], 
    coordinates: { lat: 6.0535, lng: 80.2210 }, 
    reviews: [
      { user: "Priya", rating: 5, comment: "Fast and excellent service!", date: "2025-12-06" },
      { user: "Kamal", rating: 5, comment: "Very satisfied.", date: "2025-12-07" }
    ] as Review[]
  },
  { 
    id: "prime-1", 
    name: "Prime Auto Hub", 
    location: "Colombo", 
    image: "/garages/garage03.jpg", 
    rating: 4.2, 
    services: ["Full Package","Oil Change","General Service"], 
    coordinates: { lat: 6.9271, lng: 79.8612 }, 
    reviews: [
      { user: "Nadeesha", rating: 4, comment: "Good service overall.", date: "2025-12-04" }
    ] as Review[]
  },
];

function Stars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  return (
    <div className="flex gap-1 text-yellow-400 text-lg">
      {Array.from({ length: fullStars }).map((_, i) => <span key={i}>★</span>)}
      {halfStar && <span>★</span>}
      {Array.from({ length: 5 - fullStars - (halfStar ? 1 : 0) }).map((_, i) => <span key={i} className="text-gray-300">★</span>)}
    </div>
  );
}

export default function StationDetailPage() {
  const params = useParams() as { stationId: string };
  const station = STATIONS.find((s) => s.id === params.stationId);

  if (!station) return <p className="p-10 text-center text-lg text-red-500">Station not found!</p>;

  const [reviews, setReviews] = useState<Review[]>(station.reviews);
  const [newReview, setNewReview] = useState<Review>({ user: "", rating: 0, comment: "" });

  const handleAddReview = () => {
    if (!newReview.user || !newReview.comment || newReview.rating <= 0) return;
    setReviews([...reviews, { ...newReview, date: new Date().toISOString().split("T")[0] }]);
    setNewReview({ user: "", rating: 0, comment: "" });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-16 py-10 space-y-12 font-sans text-gray-700">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-24 h-24 relative rounded-xl overflow-hidden shadow-lg flex-shrink-0">
          <Image src={station.image} alt={station.name} width={96} height={96} className="object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{station.name}</h1>
          <Stars rating={station.rating} />
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><FiMapPin /> {station.location}</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-md h-64">
            <Image src={station.image} alt={station.name} width={600} height={250} className="object-cover w-full h-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            {station.services.map((s) => (
              <span key={s} className="bg-blue-50 text-blue-800 px-4 py-1 rounded-full text-sm font-medium shadow-sm">{s}</span>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md h-64">
            <iframe
              src={`https://maps.google.com/maps?q=${station.coordinates.lat},${station.coordinates.lng}&z=15&output=embed`}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-96 bg-white rounded-2xl shadow-lg p-6 space-y-5 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Book Your Service</h2>
          <select className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400 text-gray-700">
            <option value="" disabled>Select Service</option>
            {station.services.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 text-gray-700" />
            <input type="time" className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 text-gray-700" />
          </div>
          <textarea placeholder="Add description" className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400 text-gray-700" />
          <Button onClick={() => alert("Booked!")} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">Book Now</Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800">{review.user}</p>
                <Stars rating={review.rating} />
              </div>
              <p className="text-gray-600 mt-2">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{review.date}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Write a Review</h3>
          <input type="text" placeholder="Your Name" className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-green-400 text-gray-700" value={newReview.user} onChange={(e) => setNewReview({ ...newReview, user: e.target.value })} />
          <input type="number" placeholder="Rating (1-5)" min={1} max={5} className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-green-400 text-gray-700" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} />
          <textarea placeholder="Comment" className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-green-400 text-gray-700" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} />
          <Button onClick={handleAddReview} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium">Submit Review</Button>
        </div>
      </div>
    </div>
  );
}










