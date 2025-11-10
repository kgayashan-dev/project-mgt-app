import VendorsDashboard from "@/components/AllVendorData";
import { VENDORDATA } from "@/constraints/index";

// Function to get all invoice data
async function getAllVendorData() {
  // Assuming INVOICEDATA is an array of invoices
  if (!VENDORDATA || VENDORDATA.length === 0) {
    return null; // Return null if there are no invoices
  }

  // Map through the invoices to return the necessary data structure
  return VENDORDATA.map((vendor) => ({
    id: vendor.id,
    companyName: vendor.companyName,
    firstName: vendor.firstName || "No Name",
    lastName: vendor.lastName || "No Name",
    accountNumber: vendor.accountNumber,
    emailAddress: vendor.emailAddress,
    website: vendor.website,
    phoneNumber: vendor.phoneNumber,
    totalOutstanding: vendor.totalOutstanding,
  }));
}

// Main Page Component
export default async function Page() {
  const data = await getAllVendorData(); // Fetching all invoices

  if (!data) {
    return <div>No vendors found</div>; // Handle case where no data is found
  }

  return (
    <div className="pt-8">
      {/* Passing the data directly into the AllInvoicePage component */}
      <VendorsDashboard vendorArray={data} />
    </div>
  );
}
