// app/items/page.tsx
import Items from "@/components/Items";
import { getItems, getAllCategories } from "@/utils/getdata";




async function getItemData() {
  try {
    const response = await getItems();
    // console.log(response);
    // Ensure we always return the expected structure
    if (response && response.success && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    console.error("Error fetching item data:", error);
    return { success: false, data: [] };
  }
}


async function getCategories(){
  try {
    const response = await getAllCategories();
    // console.log(response);
    // Ensure we always return the expected structure
    if (response && response.success && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    console.error("Error fetching item data:", error);
    return { success: false, data: [] };
  }



}
export default async function ItemsPage() {
  const itemData = await getItemData();
  const categoryData = await getCategories();

  return (
    <div>
      <Items itemData={itemData} categoryData={categoryData} />
    </div>
  );
}