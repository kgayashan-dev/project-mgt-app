"use client";
import DashboardNavBar from "@/components/DashboardNavBar";
import Sidebar from "@/components/Sidebar";
import { NotificationProvider } from "@/Contexts/NotificationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex h-screen">
        <Sidebar />
        <div className="fixed w-full">
          <DashboardNavBar />
        </div>
        {/* Main Content */}
        <NotificationProvider>
          {" "}
          {/* Move this to the very top */}
          <main className="flex-1 pt-12 overflow-y-auto">{children}</main>
        </NotificationProvider>
      </div>
    </div>
  );
}
