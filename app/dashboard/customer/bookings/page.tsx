"use client";

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";

const STATIONS = [
  { id: "abc", name: "ABC Service Center", rating: 4.5, image: "/garage1.jpg" },
  { id: "kml", name: "KML Auto Care", rating: 4.3, image: "/garage2.jpg" },
  { id: "btech", name: "B Tech Motors", rating: 4.6, image: "/garage3.jpg" },
];

export default function BookServicePage() {
  return (
    <div>
      <PageHeader
        title="Book Service"
        description="Select a service station"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATIONS.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition"
          >
            <Image
              src={s.image}
              alt={s.name}
              width={400}
              height={200}
              className="rounded-t-xl object-cover"
            />

            <div className="p-4">
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-sm text-slate-500">⭐ {s.rating}</p>

              <Link href={`/book-service/${s.id}`}>
                <Button className="mt-4 w-full">View</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
