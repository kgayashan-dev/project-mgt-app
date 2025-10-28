import { getAllClients } from "@/utils/getdata";
import ClientComponent from "./Clients";

export default async function ClientsPage() {
  const clientDataResponse = await getAllClients();



  return <div>
    <ClientComponent clientDataResponse={clientDataResponse}/>
  </div>;
}