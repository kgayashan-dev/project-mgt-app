"use client";

import { useSearchParams } from "next/navigation";

import ArchivedIncome from "@/components/ArchivedIncome";
import DeleteIncomePage from "@/components/DeleteIncomePage";
import InvoicePaymentsInterface from "@/components/InvoicePayment";
import { CLIENTS } from "@/constraints/index";

export default function Page() {
  const searchParams = useSearchParams();
  const clientArray = Object.values(CLIENTS);

  // Check the query parameters
  const isArchived = searchParams.get("archived") === "true";
  const isDeleted = searchParams.get("deleted") === "true";

  return (
    <div>
      {isArchived ? (
        // Render the ArchivedIncome component if ?archived=true
        <div>
          <ArchivedIncome />
        </div>
      ) : isDeleted ? (
        // Render the DeleteIncomePage component if ?deleted=true
        <div>
          <DeleteIncomePage />
        </div>
      ) : (
        <>
          <InvoicePaymentsInterface clientArray={clientArray} />
        </>
      )}
    </div>
  );
}
