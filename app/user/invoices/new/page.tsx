import InvoiceForm from "@/components/NewInvoicePage";
// import AttachementInvoice from "@/components/AttachementInvoice";
import { CLIENTS } from "@/constraints/index";

export default function InvocePage() {
  const clientArray = Object.values(CLIENTS);


 

  return (
    <>
      <InvoiceForm initialData={clientArray} />
       {/* Attachements */}
     
    </>
  );
}
