/* eslint-disable @typescript-eslint/no-explicit-any */
import EditExpensePage from "./EditExpensPage";

// interface EditExpenseParams {
//   params: {
//     expensId: string;
//   };
// }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

async function getExpenseData(expensId: string) {
  console.log("Fetching expense with ID:", expensId);
  try {
    const response = await fetch(`${API_BASE_URL}/project_pulse/Expense/getExpense/${expensId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      console.error(`Failed to fetch expense: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Expense data fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching expense data:", error);
    return null;
  }
}

async function getCategoriesData() {
  try {
    const response = await fetch(`${API_BASE_URL}/project_pulse/Category/getActiveCategories`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories data:", error);
    return [];
  }
}

export default async function Page({ 
  params,
}: {
  params: Promise<{ expensId: string }>;
}) {
  // Await the params
  const { expensId } = await params;
  
  console.log("Page received expensId:", expensId);

  // Validate that we have an ID
  if (!expensId || expensId.trim() === "") {
    return (
      <div className="min-h-screen bg-gray-100  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Invalid Expense ID</h1>
          <p className="text-gray-600 mb-6">The expense ID is missing or invalid.</p>
        </div>
      </div>
    );
  }
  
  // Fetch data in parallel
  const [expenseData, categoriesData] = await Promise.all([
    getExpenseData(expensId),
    getCategoriesData(),
  ]);

  // If expense not found, show error page
  if (!expenseData) {
    return (
      <div className="min-h-screen bg-gray-100  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Expense Not Found</h1>
          <p className="text-gray-600 mb-6">
            The expense with ID does not exist or could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  // Transform data for the client component
  const initialExpense = {
    id: expenseData.id || expensId,
    categoryId: expenseData.categoryId || "",
    merchant: expenseData.merchant || "",
    date: expenseData.date || new Date().toISOString(),
    subTotal: expenseData.subTotal || 0,
    grandTotal: expenseData.grandTotal || 0,
    taxes: expenseData.taxes || [],
  };

  const initialCategories = categoriesData.map((cat: any) => ({
    categoryId: cat.categoryId,
    catDescription: cat.catDescription,
  }));

  console.log('Initial expense data:', initialExpense);
  console.log('Initial categories data:', initialCategories);

  return (
    <EditExpensePage 
      expenseId={expensId}
      initialExpense={initialExpense}
      initialCategories={initialCategories}
    />
  );
}