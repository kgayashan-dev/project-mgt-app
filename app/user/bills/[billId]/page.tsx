import Viewbill from "@/components/ViewBill";
import { COMPANY, BILLDATA } from "@/constraints/index";

async function getbillData(id: string) {
  const bill = BILLDATA.find((q) => q.id === id);

  if (!bill) {
    return null; // Return null if no matching bill is found
  }

  return {
    id: bill.id,
    billNumber: bill.billNumber,
    issueDate: bill.issueDate,
    dueDate: bill.dueDate,
    amountDue: bill.amountDue,
    outstandingRevenue: bill.totalOutstanding,
    clientAddress: bill.clientAddress,
    phoneNumber: bill.phoneNumber,
    emailAddress: bill.emailAddress,
    subtotal: bill.subTotal,
    rows: bill.table.length, // Table length as rows
    table: bill.table,
    totalTax: bill.tax,
    category: bill.table[0].category,
    grandTotal: bill.grandTotal,
    discountPercentage: bill.discountPercentage || 0,
    discountAmount: bill.discountAmount || 0,
    taxPercentage: (bill.tax / bill.subTotal) * 100 || 0,
  };
}

export default async function Page({ params }: { params: { billId: string } }) {
  const { billId } = params;

  const data = await getbillData(billId);

  if (!data) {
    return <div>Bill not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] mt-4 font-bold">Bill ID: {billId}</p>
      <Viewbill billArray={data} myCompany={COMPANY} />
    </div>
  );
}
