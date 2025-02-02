import ClientDetailsUI from "@/components/clientDetails";
import { CLIENTS } from "@/constraints/index";

type ClientId = keyof typeof CLIENTS;

async function getClientData(id: ClientId) {
  return CLIENTS[id] || null;
}

export default async function Page({
  params,
}: {
  params: { clientId: string };
}) {
  const data = await getClientData(params.clientId as ClientId);

  if (!data) {
    return <div>Client not found</div>;
  }

  console.log(data);

  return <ClientDetailsUI initialData={data} clientId={params.clientId} />;
}
