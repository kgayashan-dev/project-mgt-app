// utils/getdata.ts (Enhanced version)
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const fetchData = async (
  url: string,
  label: string,
  options?: { timeout?: number }
) => {
  try {
    const fullUrl = `${API_URL}${url}`;
    // console.log("Fetching from:", fullUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options?.timeout || 10000
    ); // 10 second default timeout

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // console.log(data)
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Error fetching ${label}:`, message);

    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, message: `Request timeout for ${label}` };
    }

    return { success: false, message };
  }
};

export const getBankData = () =>
  fetchData("/project_pulse/BankAccount/getAllBankAccounts", "Bank data");

export const getCompanyData = () =>
  fetchData("/project_pulse/Company/getAllCompanies", "Company data");

export const getClientById = (id: string) =>
  fetchData(`/project_pulse/Client/getClient/${id}`, "Client by ID");

export const getAllClients = () =>
  fetchData("/project_pulse/Client/getAllClients", "clients data");

export const getAllProjects = () =>
  fetchData("/project_pulse/Project/getAllProjects", "project data");

export const getAllTeamMembers = () =>
  fetchData(
    "/project_pulse/TeamMembers/getAllTeamMembers",
    "team members data"
  );
export const getAllActiveTeamMembers = () =>
  fetchData(
    "/project_pulse/TeamMembers/getActiveTeamMembers",
    "team members data"
  );

// Other data functions
export const getQuotatoinData = () =>
  fetchData("/project_pulse/Quotation/getAllQuotations", "Quotation data");

export const getAllCategories = () =>
  fetchData("/project_pulse/Category/getAllCategories", "category data");

export const getAllExpenses = () =>
  fetchData("/project_pulse/Expense/getAllExpenses", "Expenses data");

export const getAllIncome = () =>
  fetchData("/project_pulse/Income/getAllIncome", "Income data");

export const getAllInvoices = () =>
  fetchData("/project_pulse/Invoice/getAllInvoices", "Invoices data");
export const getItems = () =>
  fetchData("/project_pulse/Item/getAllItems", "Item data");

export const getAllPayments = () =>
  fetchData("/project_pulse/Payment/getAllPayments", "payments data");

export const getAllVendors = () =>
  fetchData("/project_pulse/Vendor/getAllVendors", "vendors data");
export const getAllBills = () =>
  fetchData("/project_pulse/Bill/getAllBills", "bill data");



export const getDashboardData = () =>
  fetchData("/project_pulse/Dashboard/getData", "dashboard data");






// utils/getdata.ts (add this function)
export async function getInvoicesByClientId(clientId: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(
      `${API_URL}/project_pulse/Invoice/getInvoicesByClientId/${clientId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentByTypeBill(type = "bill_payment") {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(
      `${API_URL}/project_pulse/Payment/getPaymentsByType/${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch payments by payment type: ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getPaymentsByTypeInv(type = "invoice_payment") {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(
      `${API_URL}/project_pulse/Payment/getPaymentsByType/${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch payments by payment type: ${response.status}`
      );
    }

    const data = await response.json();

    console.log(data, "data datdadtatd ");
    return data;
  } catch (error) {
    // console.error("Error fetching invoices:", error);
    throw error;
  }
}

// utils/getdata.ts (add this function)
export async function getInvoiceById(invoiceId: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(
      `${API_URL}/project_pulse/Invoice/getInvoice/${invoiceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error("Error fetching invoice:", error);
    throw error;
  }
}
interface CompanyClientDetails {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  registrationNumber: string;
  clientID: string;
  clientPhone: string;
  clientName: string;

  // Add other company fields as needed
}
// utils/getCompanyData.ts
export const getCompanyAData = async (
  invoiceId: string
): Promise<CompanyClientDetails | null> => {
  try {
    const response = await fetch(
      `${API_URL}/project_pulse/Invoice/getCompanyByInvoice/${invoiceId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch company data");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  }
};

export const getCompanyADataOfQuotaion = async (
  quotaionId: string
): Promise<CompanyClientDetails | null> => {
  try {
    const response = await fetch(
      `${API_URL}/project_pulse/Quotation/getCompanyByQuotationId/${quotaionId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch company data");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.warn("Error fetching company data:", error);
    return null;
  }
};
