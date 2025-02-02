import React from "react";

const CheckoutPage = () => {
  const payments = [
    {
      invoiceNumber: 1,
      client: "Hiru",
      paymentDate: new Date(),
      internalNotes: "hi",
      amount: 2300,
      status: "Paid",
      type: "cash",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-start items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          All Checkout Link Payments
        </h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Client / Invoice Number
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Payment Date ▼
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Type / Internal Notes
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount / Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.invoiceNumber} className="hover:bg-gray-10">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {payment.client}
                </div>
                <div className="text-sm text-gray-500">
                  #{payment.invoiceNumber}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(payment.paymentDate).toLocaleDateString("en-GB")}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{payment.type}</div>
                <div className="text-sm text-gray-500">
                  {payment.internalNotes}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-sm font-medium text-gray-900">
                  ${payment.amount.toFixed(2)}
                </div>
                <div
                  className={`text-sm ${
                    payment.status === "Paid"
                      ? "text-green-600"
                      : payment.status === "Pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {payment.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckoutPage;
