import DashboardNavBar from "@/components/DashboardNavBar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="z-40 flex h-screen">
        <Sidebar />
        <div className="z-30 fixed w-full">
          <DashboardNavBar />
        </div>
        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-6 pt-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
