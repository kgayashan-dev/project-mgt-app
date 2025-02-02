import ViewVendor from "@/components/ViewVendor";
import { COMPANY, VENDORDATA } from "@/constraints/index";

// Define QuotationId type if not already defined
async function getQuotationData(id: string) {
  const vendor = VENDORDATA.find((q) => q.id === id); // Assuming QUOTATION is an array of quotations

  if (!vendor) {
    return null; // Return null if no matching quotation is found
  }

  return {
    id: vendor.id,
    companyName: vendor.companyName,
    firstName: vendor.firstName || "No Name",
    lastName: vendor.lastName || "No Name",
    accountNumber: vendor.accountNumber,
    emailAddress: vendor.emailAddress,
    website: vendor.website,
    phoneNumber: vendor.phoneNumber,
    totalOutstanding: vendor.totalOutstanding,
    rows: vendor.table.length || 0, // Table length as rows
    table: vendor.table,
  };
}

export default async function Page({
  params,
}: {
  params: { vendorId: string };
}) {
  const { vendorId } = params; // Remove 'await'

  const data = await getQuotationData(vendorId);

  if (!data) {
    return <div>Vendor not found</div>;
  }

  return (
    <div>
      <p className="text-[10px] font-bold pt-8">Quotation ID: {vendorId}</p>
      {/* Passing the data directly into the EditQuotation component */}
      <ViewVendor vendorArray={data} myCompany={COMPANY} />
    </div>
  );
}
