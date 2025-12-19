/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ArchivedIncome from "@/components/ArchivedIncome";
import InvoicePaymentsInterface from "@/components/InvoicePayment";
import {
  getAllInvoices,
  getPaymentByTypeBill,
  getPaymentsByTypeInv,
} from "@/utils/getdata";

// Helper function to map API status to component status

// Main Page Component
export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isArchived = searchParams.archived === "true";
  // const isDeleted = searchParams.deleted === "true";

  try {
    const response = await getAllInvoices();

    // Check if the response is successful and has data
    if (!response || !response.success || !Array.isArray(response.data)) {
      return (
        <div className="pt-8 flex justify-center items-center min-h-96">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800 mb-2">
              No invoices found
            </h1>
            <p className="text-gray-600">
              Unable to load invoices at this time.
            </p>
          </div>
        </div>
      );
    }

    const data = response.data;

    // Transform the API data to match the component's expected format
    const transformedInvoices = data.map((invoice: any) => ({
      id: invoice.id,
      clientID: invoice.clientID,
      invoiceNumber: invoice.invoiceNo,
      description: invoice.remarks || "No description",
      invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString("en-US"),
      invoiceDueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("en-US")
        : undefined,
      client: invoice.clientID,
      amount: invoice.subtotal,
      invoiceStatus: invoice.status,
      grandTotal: invoice.invoiceTotal,
      status: invoice.status,
    }));

    // Fetch payments data if needed
    let paymentsData = [];
    try {
      const paymentsResponse = await getPaymentsByTypeInv();

      paymentsData = paymentsResponse;
      // console.log("Payments data:", paymentsData);

      // console.log("Payments :", paymentsResponse);
    } catch (paymentError) {
      console.error("Error fetching payments:", paymentError);
      // Continue without payments data
    }

    return (
      <div className="pt-8">
        <div className="mb-4 pl-3    ">
          <h1 className="font-bold text-xl">Bill Payment Settlement</h1>
        </div>
        {isArchived ? (
          <ArchivedIncome />
        ) : (
          <InvoicePaymentsInterface
            invoiceArray={transformedInvoices}
            paymentsData={paymentsData}
          />
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="pt-8 flex justify-center items-center min-h-96">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800 mb-2">
            Error Loading Page
          </h1>
          <p className="text-gray-600">
            Something went wrong. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
