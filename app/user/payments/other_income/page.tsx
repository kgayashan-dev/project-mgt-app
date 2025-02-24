"use client";

import { useSearchParams } from "next/navigation";
import OtherIncomeForm from "@/components/OtherIncome";

import ArchivedIncome from "@/components/ArchivedIncome";
import DeleteIncomePage from "@/components/DeleteIncomePage";
import { CLIENTS } from "@/constraints/index";
export default function Page() {
  const searchParams = useSearchParams();

  // Check the query parameters
  const isArchived = searchParams.get("archived") === "true";
  const isDeleted = searchParams.get("deleted") === "true";
  const clientArray = Object.values(CLIENTS);
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
          <OtherIncomeForm clientArray={clientArray} />
        </>
      )}
    </div>
  );
}
