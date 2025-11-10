import React, { Suspense } from "react";
import BankDetailsManager from "@/components/BankDetailsManager";
import { getBankData } from "@/utils/getdata";

export default async function Page() {
  const bankDataResponse = await getBankData();
  
  return (
    <Suspense fallback={<div>Loading bank data...</div>}>
      <BankDetailsManager 
        initialData={bankDataResponse.success ? bankDataResponse.data : []}
      />
    </Suspense>
  );
}