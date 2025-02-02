import Items from "@/components/Items";

export default async function ItemsPage() {
  const items = [
    {
      id: "1",
      name: "Laptop",
      description: "15-inch gaming laptop with high performance.",
      category: "pcs",
      qty: 10,
      price: 100,
      rate: 1200,
      total: 12000,
    },
    {
      id: "2",
      name: "Smartphone",
      description: "Latest model smartphone with advanced features.",
      category: "Mobile devices",
      qty: 25,
      price: 100,

      rate: 800,
      total: 20000,
    },
  ];
  return (
    <div>
      <Items />
    </div>
  );
}
