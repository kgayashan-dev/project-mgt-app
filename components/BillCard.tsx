import React from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

interface BillType {
  id: string;
  icon: React.ElementType; // Using LucideIcon type instead of React.ElementType for better type safety
  color: string;
  type: string;
  merchant: string;
  issueDate: string;
  amount: number;
  status: string;
  vendor: string;
  paidAmount: number;
}

interface BillCardProps {
  bill: BillType;
}

const BillCard: React.FC<BillCardProps> = ({ bill }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/user/bills/${bill.id}`);
  };

  const Icon = bill.icon; // Destructure the icon component for cleaner usage

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden h-60 w-40 cursor-pointer transition-shadow hover:shadow-lg relative"
    >
      <div className="p-4 flex flex-col h-full">
        {/* Top section with ID */}
        <div className="text-gray-600 text-xs mb-2">{bill.id}</div>

        {/* vendor name */}
        <div className="text-gray-900 text-xs font-medium mb-1">
          {bill.vendor}
        </div>

        {/* Date */}
        <div className="text-gray-500 text-xs">{bill.issueDate}</div>

        {/* Spacer */}
        <div className="mt-16" />

        {/* Amount section */}

        <div className="border-t border-gray-200 text-right flex justify-end items-end texte w-full">
          <div>
            <div className=" text-xs font-semibold">Rs. {bill.amount}</div>
            <div className=" text-xs font-semibold">
              {" "}
              Paid Rs. {bill.paidAmount}
            </div>
          </div>
        </div>
        {/* Status badge */}
        {bill.status && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-100 py-2 px-4 text-center">
            {bill.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillCard;
