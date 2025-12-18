import React from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

type ExpenseType = {
  id: string;
  icon: React.ElementType;
  color: string;
  type: string;
  merchant: string;
  date: string;
  amount: number;
};

interface ExpenseCardProps {
  expense: ExpenseType;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/user/expenses/${expense.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden h-48 w-40 cursor-pointer transition-shadow hover:shadow-lg"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <expense.icon className={expense.color} size={20} />
          <span className="text-gray-600 text-xs">{expense.type}</span>
        </div>
        <div className="text-xs font-normal mb-1">{expense.merchant}</div>
        <div className="text-gray-500 mb-4 text-xs">{expense.date}</div>
      </div>
      <div className="border-t px-4 py-3 bg-gray-10 flex items-center justify-between">
        {expense.amount > 0 ? (
          <span className="font-medium">Rs.{expense.amount}</span>
        ) : (
          <div className="flex items-center">
            <Paperclip className="text-gray-400" size={16} />
          </div>
        )}
        <div className="flex-grow">
          <svg viewBox="0 0 100 20" className="w-full h-6 text-gray-200">
            <path
              d="M0 10 L100 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
