import NewBillPage from "@/components/NewBillForm";
import { getAllVendors , getAllCategories} from "@/utils/getdata";



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


const Category = await getAllCategories().then((res) => {
  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  } else {
    console.warn("Failed to fetch CAT data or invalid format");
    return [];
  }
}).catch((error) => {
  console.log("Error fetching vendor data:", error);
  return [];
});


export default function Page() {
  const vendorArray = Object.values(VENDORDATA); // This is now available for the client.
  const categoryArray = Object.values(Category); // This is now available for the client.

  console.log(vendorArray)
  return (
    <>
      {/* Pass vendorArray as a prop */}
      <NewBillPage vendorArray={vendorArray} categoryArray={categoryArray} />
    </>
  );
}
