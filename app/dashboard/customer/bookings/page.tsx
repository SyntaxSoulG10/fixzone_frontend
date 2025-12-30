"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FiHeart, 
  FiMapPin, 
  FiStar, 
  FiClock, 
  FiDollarSign,
  FiFilter,
  FiSearch,
  FiChevronRight
} from "react-icons/fi";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";

type Station = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  image: string;
  priceRange: string;
  services: string[];
  openStatus: string;
};

const STATIONS: Station[] = [
  { 
    id: "abc-1", 
    name: "ABC Service Center", 
    rating: 4.5, 
    reviews: 234,
    location: "Colombo", 
    distance: "2.5 km",
    image: "/garages/garage01.jpg",
    priceRange: "$$",
    services: ["Oil Change", "Brake Service", "Tire Rotation"],
    openStatus: "Open Now"
  },
  { 
    id: "kml-1", 
    name: "KML Auto Care", 
    rating: 4.3, 
    reviews: 189,
    location: "Gampaha", 
    distance: "5.2 km",
    image: "/garages/garage02.jpg",
    priceRange: "$",
    services: ["Full Service", "AC Repair", "Engine Diagnostics"],
    openStatus: "Open Now"
  },
  { 
    id: "btech-1", 
    name: "B Tech Motors", 
    rating: 4.6, 
    reviews: 312,
    location: "Colombo", 
    distance: "3.8 km",
    image: "/garages/garage03.jpg",
    priceRange: "$$$",
    services: ["Premium Service", "Body Work", "Paint"],
    openStatus: "Closed"
  },
  { 
    id: "auto-1", 
    name: "Auto Pro Service", 
    rating: 4.0, 
    reviews: 156,
    location: "Kandy", 
    distance: "45 km",
    image: "/garages/garage01.jpg",
    priceRange: "$$",
    services: ["Basic Service", "Tire Service", "Battery"],
    openStatus: "Open Now"
  },
  { 
    id: "speed-1", 
    name: "Speed Motors", 
    rating: 4.8, 
    reviews: 421,
    location: "Galle", 
    distance: "98 km",
    image: "/garages/garage02.jpg",
    priceRange: "$$$",
    services: ["Performance Tuning", "Custom Work", "Racing"],
    openStatus: "Open Now"
  },
  { 
    id: "prime-1", 
    name: "Prime Auto Hub", 
    rating: 4.2, 
    reviews: 267,
    location: "Colombo", 
    distance: "4.1 km",
    image: "/garages/garage03.jpg",
    priceRange: "$$",
    services: ["Quick Service", "Oil Change", "Inspection"],
    openStatus: "Open Now"
  },
];

export default function BookServicePage() {
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filteredStations = STATIONS.filter(
    (s) =>
      s.rating >= minRating &&
      (location === "All" || s.location === location) &&
      (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">Book a Service</h1>
        <p className="text-slate-600 mb-6 text-sm md:text-base">
          Choose from our network of trusted service stations near you
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search service stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{filteredStations.length}</p>
              <p className="text-sm text-slate-500">Stations Available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {filteredStations.filter(s => s.openStatus === "Open Now").length}
              </p>
              <p className="text-sm text-slate-500">Open Now</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiHeart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{favorites.length}</p>
              <p className="text-sm text-slate-500">Favorites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors md:hidden"
        >
          <FiFilter className="w-4 h-4" />
          Filters
        </button>

        <div className={`${showFilters ? 'block' : 'hidden'} md:flex flex-wrap gap-4 mt-4 md:mt-0`}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-900 font-medium"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.8}>4.8+ Stars</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-900 font-medium"
            >
              <option>All</option>
              <option>Colombo</option>
              <option>Gampaha</option>
              <option>Kandy</option>
              <option>Galle</option>
            </select>
          </div>

          <button
            onClick={() => {
              setMinRating(0);
              setLocation("All");
              setSearchQuery("");
            }}
            className="px-4 py-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold transition-colors self-end"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-bold text-slate-900">{filteredStations.length}</span> service stations
        </p>
      </div>

      {/* Service Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredStations.map((station) => (
              <div
                key={station.id}
                className="group bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                  <Image
                    src={station.image}
                    alt={station.name}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(station.id)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <FiHeart
                      className={`w-5 h-5 ${
                        favorites.includes(station.id)
                          ? "fill-red-500 text-red-500"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Open Status */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    station.openStatus === "Open Now"
                      ? "bg-green-500/90 text-white"
                      : "bg-slate-500/90 text-white"
                  }`}>
                    {station.openStatus}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-slate-900">{station.rating}</span>
                    <span className="text-xs text-slate-500">({station.reviews})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {station.name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiMapPin className="w-4 h-4 text-slate-400" />
                        <span>{station.location}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{station.distance}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiDollarSign className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{station.priceRange}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">Price Range</span>
                      </div>
                    </div>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {station.services.slice(0, 2).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100"
                        >
                          {service}
                        </span>
                      ))}
                      {station.services.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          +{station.services.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/dashboard/customer/bookings/${station.id}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg group">
                      <span>View Details</span>
                      <FiChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Hover Bottom Accent */}
                <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            ))}
      </div>

      {/* Empty State */}
      {!loading && filteredStations.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No stations found</h3>
          <p className="text-sm text-slate-500 mb-6">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={() => {
              setMinRating(0);
              setLocation("All");
              setSearchQuery("");
            }}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

/* Skeleton Loader */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 rounded-full w-20" />
          <div className="h-6 bg-slate-200 rounded-full w-24" />
        </div>
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
