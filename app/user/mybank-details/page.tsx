import React from "react";
import MyBankDetails from "@/components/MyBankDetails";

export default async function Page({}) {
  // Fetch data asynchronously
  //   const data = await fetchData(params.clientId);

  return <MyBankDetails />;
}

// You can define your async function to fetch data (example)
// async function fetchData(clientId: string) {
//   const response = await fetch(`/api/bank-details?clientId=${clientId}`);
//   const data = await response.json();
//   return data;
// }
