import DashboardLayoutWrapper from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
