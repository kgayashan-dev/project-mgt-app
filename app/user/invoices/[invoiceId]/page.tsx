/* eslint-disable @typescript-eslint/no-unused-vars */
// app/user/invoices/[invoiceId]/page.tsx
import React from "react";
import ViewInvoice from "@/components/ViewInvoice";
import { getInvoiceById } from "@/utils/getdata";

async function getInvoiceData(id: string) {
  try {
    const response = await getInvoiceById(id);
    console.log(response,"response")
    return response;
  } catch (error) {
    // console.error("Error fetching invoice data:", error);
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  
  const invoiceData = await getInvoiceData(invoiceId);


  // console.log(invoiceData)
  if (!invoiceData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoice not found</h1>
          <p className="text-gray-600">The invoice youre looking for doesnt exist.</p>
        </div>
      </div>
    );
  }

  // Transform the API response to match the ViewInvoice component's expected format
  const transformedInvoice = {
    id: invoiceData.id,
    invoiceNumber: invoiceData.invoiceNo,
    invoiceDate: new Date(invoiceData.invoiceDate).toLocaleDateString('en-US'),
    invoiceDueDate: new Date(invoiceData.invoiceDate).toLocaleDateString('en-US'), // You might want to calculate due date
    client: invoiceData.clientID, // You might need to fetch client name separately
    // clientName: invoiceData., // You might need to fetch client name separately
    location: "", // You might need to fetch client location
    outstandingRevenue: 0, // Calculate based on status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: invoiceData.items.map((item: any, index: number) => ({
      description: item.description,
      rate: item.rate,
      tax: 0, // You might need to calculate tax per item
      qty: item.qty,
      total: item.total,
      unit: item.unit,
      taxAmount: 0, // You might need to calculate tax amount
    })),
    subtotal: invoiceData.subtotal,
    totalTax: invoiceData.tax,
    grandTotal: invoiceData.invoiceTotal,
    notes: invoiceData.remarks || "",
    emailAddress: "", // You might need to fetch client email
    terms: invoiceData.terms, // Default terms
    clientAddress: "", // You might need to fetch client address
    invoiceReference: invoiceData.quotationID || invoiceData.poNo || "",
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 0,
    additionalInfo: "",
    phoneNumber: 0, // You might need to fetch client phone
  };

  console.log(transformedInvoice)

  return <ViewInvoice invoiceArray={transformedInvoice} />;
}