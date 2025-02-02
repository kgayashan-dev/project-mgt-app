import NewBillPage from "@/components/NewBillForm";
import { VENDORDATA } from "@/constraints/index";

export default function Page() {
  const vendorArray = Object.values(VENDORDATA); // This is now available for the client.

  return (
    <>
      {/* Pass vendorArray as a prop */}
      <NewBillPage vendorArray={vendorArray} />
    </>
  );
}
