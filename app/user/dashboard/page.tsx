import { getDashboardData } from "@/utils/getdata";
import Dashboard from "./DashbordUI";

async function getDBData() {
  try {
    const response = await getDashboardData();
    return response;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, data: null };
  }
}

export default async function Page() {
  const response = await getDBData();

  // Check if the response is successful and has data
  if (!response || !response.success || !response.data) {
    return (
      <div className="pt-8 flex justify-center items-center min-h-96">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800 mb-2">
            No dashboard data found
          </h1>
          <p className="text-gray-600">Unable to load dashboard data at this time.</p>
        </div>
      </div>
    );
  }

  // Extract the dashboard data from response
  const dashboardData = response.data.data;


  console.log(dashboardData)
  return (
    <div className="pt-8">
      <Dashboard 
        totalClients={dashboardData.totalClients}
        outstandingInvoicesCount={dashboardData.outstandingInvoicesCount}
        outstandingAmount={dashboardData.outstandingAmount}
        activeProjects={dashboardData.activeProjects}
        recentInvoices={dashboardData.recentInvoices}
        paidInvoices={dashboardData.paidInvoices}

      />
    </div>
  );
}