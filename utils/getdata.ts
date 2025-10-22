// utils/getdata.ts
const API_URL =  process.env.NEXT_PUBLIC_API_BASE_URL

const fetchData = async (url: string, label: string) => {
  try {
    const fullUrl = `${API_URL}${url}`;
    console.log('🔍 Fetching from:', fullUrl);

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`💥 Error fetching ${label}:`, message);
    return { success: false, message };
  }
};

export const getQuotatoinData = () =>
  fetchData("/project_pulse/Quotation/getAllQuotations", "quotation data");