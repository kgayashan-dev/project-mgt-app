import Viewbill from "@/components/ViewBill";
import { COMPANY } from "@/constraints/index";

async function getbillData(id: string) {


  

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
