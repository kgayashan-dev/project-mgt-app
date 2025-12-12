import NewBillPage from "@/components/NewBillForm";
import { getAllVendors } from "@/utils/getdata";



const VENDORDATA = await getAllVendors().then((res) => {
  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  } else {
    console.error("Failed to fetch vendor data or invalid format");
    return [];
  }
}).catch((error) => {
  console.log("Error fetching vendor data:", error);
  return [];
});


export default function Page() {
  const vendorArray = Object.values(VENDORDATA); // This is now available for the client.

  console.log(vendorArray)
  return (
    <>
      {/* Pass vendorArray as a prop */}
      <NewBillPage vendorArray={vendorArray} />
    </>
  );
}
