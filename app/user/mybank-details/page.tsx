import React from "react";
import BankDetailsManager from "@/components/MyBankDetails";
import { getBankData } from "@/utils/getdata";

export default async function Page() {
  const bankDataResponse = await getBankData();
  
  return (
    <BankDetailsManager 
      initialData={bankDataResponse.success ? bankDataResponse.data : []}
    />
  );
}