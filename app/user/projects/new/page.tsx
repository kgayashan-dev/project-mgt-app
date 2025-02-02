import NewNewProject from "@/components/NewProject";
// import AttachementInvoice from "@/components/AttachementInvoice";
import { CLIENTS } from "@/constraints/index";

export default function InvocePage() {
  const clientArray = Object.values(CLIENTS);

  return (
    <>
      <NewNewProject initialData={clientArray} />
      {/* Attachements */}
    </>
  );
}
 