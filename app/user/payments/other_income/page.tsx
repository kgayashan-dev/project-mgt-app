"use client";

import { useSearchParams } from "next/navigation";
import OtherIncomeForm from "@/components/OtherIncome";
import Link from "next/link";
import ArchivedIncome from "@/components/ArchivedIncome";
import DeleteIncomePage from "@/components/DeleteIncomePage";

const OtherIncome = () => {
  const searchParams = useSearchParams();

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
          <OtherIncomeForm />

          {/* No Items Message */}
          <div className="text-center py-8 text-gray-500">
            <p>No items found</p>
            <div className="mt-4 space-x-2">
              <Link
                href={`/user/payments/other_income/?archived=true`}
                className="text-blue-600 font-medium"
              >
                View Archived Other Income
              </Link>
              <span>or</span>
              <Link
                href={`/user/payments/other_income/?deleted=true`}
                className="text-blue-600 font-medium"
              >
                View Deleted Other Income
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OtherIncome;
