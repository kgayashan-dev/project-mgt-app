import NewQuotation from "@/components/NewQuotation";

const API_URL =  process.env.NEXT_PUBLIC_API_BASE_URL

// Define the Client interface to match your API
interface Client {
  id: string;
  name: string;
  initials: string;
  businessType: string;
  location: string;
  emailAddress?: string;
  phoneNumber?: string;
}

// Function to fetch clients from your API
async function getClients(): Promise<Client[]> {
  try {
    // Replace with your actual clients API endpoint
    const response = await fetch(
      `${API_URL}/project_pulse/Client/getAllClients`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Important for fresh data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.status}`);
    }

    const clients = await response.json();
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return []; // Return empty array if fetch fails
  }
}

// Alternative: If you don't have a clients API yet, use mock data


export default async function Page() {
  // Try to fetch real clients, fall back to mock data if API is not available
  // Initialize with an empty array so the variable is always assigned
  let initialData: Client[]  = [];

  try {
    // Attempt to load real clients from the API; if it succeeds we overwrite the default
    const clients = await getClients();
    if (clients && clients.length >= 0) {
      initialData = clients;
    }
  } catch (error) {
    console.error("Error loading clients, using mock data:", error);
  
  }

  return (
    <div>
      <NewQuotation initialData={initialData} />
    </div>
  );
}
