import NewQuotation from "@/components/NewQuotation";
import { CLIENTS } from "@/constraints/index";

export default async function Page() {
  const clientArray = Object.values(CLIENTS);

  return (
    <>
      <NewQuotation initialData={clientArray} />
    </>
  );
}
