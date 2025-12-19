import ExpensesDetails from "./ExpensesDetails";

export default function ExpensePage() {


  //  setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/project_pulse/Expense/getAllExpenses`);
  //     if (!response.ok) throw new Error('Failed to fetch expenses');
  //     const data = await response.json();
  //     setExpenses(data);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to load expenses');
  //     console.error('Error fetching expenses:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  return (
    <div>
      <ExpensesDetails/>
    </div>
  )
}