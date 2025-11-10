// app/user/clients/[clientId]/page.tsx
import React from "react";
import ClientDetailsUI from "@/components/clientDetails";
import { getClientById } from "@/utils/getdata";

async function getClientData(id: string) {
  try {
    const response = await getClientById(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error("Error fetching client data:", error);
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  // Await the params object
  const { clientId } = await params;
  
  const data = await getClientData(clientId);

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Client not found</h1>
         
        </div>
      </div>
    );
  }

  return <ClientDetailsUI initialData={data} clientId={clientId} />;
}