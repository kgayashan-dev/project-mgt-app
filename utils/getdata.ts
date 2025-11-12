// utils/getdata.ts (Enhanced version)
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const fetchData = async (url: string, label: string, options?: { timeout?: number }) => {
  try {
    const fullUrl = `${API_URL}${url}`;
    console.log('Fetching from:', fullUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 10000); // 10 second default timeout

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Error fetching ${label}:`, message);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, message: `Request timeout for ${label}` };
    }
    
    return { success: false, message };
  }
};

// Client related functions
export const getBankData = () =>
  fetchData("/project_pulse/BankAccount/getAllBankAccounts", "Bank data");


export const getCompanyData = () =>
  fetchData("/project_pulse/Company/getAllCompanies", "Company data");

export const getClientById = (id: string) =>
  fetchData(`/project_pulse/Client/getClient/${id}`, "Client by ID");

export const getAllClients = () =>
  fetchData("/project_pulse/Client/getAllClients", "clients data");

// Other data functions
export const getQuotatoinData = () =>
  fetchData("/project_pulse/Quotation/getAllQuotations", "Quotation data");

export const getBillData = () =>
  fetchData("/project_pulse/Bill/getAllBills", "bill data");

export const getAllCategories = () =>
  fetchData("/project_pulse/Category/getAllCategories", "category data");

export const getAllExpenses = () =>
  fetchData("/project_pulse/Expense/getAllExpenses", "Expenses data");

export const getAllIncome = () =>
  fetchData("/project_pulse/Income/getAllIncome", "Income data");

export const getAllInvoices = () =>
  fetchData("/project_pulse/Invoice/getAllInvoices", "Invoices data");

export const getAllPayments = () =>
  fetchData("/project_pulse/Payment/getAllPayments", "payments data");

export const getAllProjects = () =>
  fetchData("/project_pulse/Project/getAllProjects", "Projects data");

export const getAllVendors = () =>
  fetchData("/project_pulse/Vendor/getAllVendors", "vendors data");



// utils/getdata.ts (add this function)
export async function getInvoicesByClientId(clientId: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(
      `${API_URL}/project_pulse/Invoice/getInvoicesByClientId/${clientId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}
interface Company {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;

  // Add other company fields as needed
}


// utils/getCompanyData.ts
export const getCompanyAData = async (invoiceId: string): Promise<Company | null> => {
  try {
    const response = await fetch(`${API_URL}/project_pulse/Invoice/getInvoice/${invoiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching company data:', error);
    return null;
  }
};