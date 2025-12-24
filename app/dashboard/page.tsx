"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role) {
            router.push(`/dashboard/${role.replace('_', '-')}`);
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
}
