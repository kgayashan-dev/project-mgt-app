// page.tsx
"use client";
import { useEffect, useState } from "react";
import Quotations from "./Quotation";
import { getQuotatoinData } from "@/utils/getdata";
// import SearchQuotation from "@/components/SearchQuotation";

export default function QuotationPage() {
  const [quotationData, setQuotation] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quotationsResults = await getQuotatoinData();
        if (quotationsResults.success) {
          setQuotation(quotationsResults.data);
        } else {
          console.log("Failed to fetch data:", quotationsResults.message);
        }
      } catch (error) {
        console.log("Failed to load data:", error);
      }
    };
    fetchData();
  }, []);

  // console.log(quotationData,"quotation data")

  return (
    <div>
      {/* <div>
        <SearchQuotation />
      </div> */}
        {/* <SearchQuotation /> */}

      <Quotations quotationData={quotationData} />
    </div>
  );
}
