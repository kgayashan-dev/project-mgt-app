import ExpenseDetailPage from "@/components/ExpensData";
import { EXPENSDATA } from "@/constraints/index";

// Define projectId type if not already defined
async function getprojectData(id: string) {
  const expens = EXPENSDATA.find((q) => q.id === id);

  if (!expens) {
    return null; // Return null if no matching project is found
  }

  return {
    id: expens.id,
    expenceType: expens.type,
    expensMerchant: expens.merchant,
    expensSubtotal: expens.subtotal,
    expensTax: expens.fee,
    expensTotal: expens.total,
    dexpensDate: expens.date,
  };
}

export default async function Page({ params }: { params: { expens: string } }) {
  // Correct way to extract params
  const { expens } = params;

  // Get project data using the projectId
  const data = await getprojectData(expens);

  if (!data) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] mt-4 font-bold">Project ID: {expens}</p>
      {/* Pass the correct prop to Project */}
      <ExpenseDetailPage expensData={data} />
    </div>
  );
}
