import React from "react";

// Defining types for TypeScript
type Row = {
  description: string;
  rate: number;
  unit: string;
  qty: number;
  total: number;
};

interface QuotationData {
  id: string;
  quotationNumber: string;
  client: string;
  initials: string;
  location: string;
  outstandingRevenue: number;
  overdueAmount: number;
  rows: number;
  table: Row[];
  draftAmount: number;
  unbilledTime: string;
  unbilledExpenses: number;
  contactEmail: string;
  phoneNumber: string;
  businessType: string;
  billingCycle: string;
  createdAt: string;
  lastActive: string;
  clientSince: string;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  notes: string;
  terms: string;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  additionalInfo: string;
}

interface QuotationDetailPageProps {
  quoteArray: QuotationData; // Single quotation object
}

const QuotationDetailPage: React.FC<QuotationDetailPageProps> = ({
  quoteArray,
}) => {
  const {
    table,
    notes,
    subtotal,
    totalTax,
    grandTotal,
    terms,
    additionalInfo,
    quotationNumber,
    client,
    billingCycle,
    businessType,
    contactEmail,
    phoneNumber,
    clientSince,
  } = quoteArray;

  return (
    <div>
      <h1>Quotation Details</h1>

      {/* Quotation Information */}
      <div>
        <h3>Quotation Number: {quotationNumber}</h3>
        <p>
          <strong>Client:</strong> {client}
        </p>
        <p>
          <strong>Billing Cycle:</strong> {billingCycle}
        </p>
        <p>
          <strong>Business Type:</strong> {businessType}
        </p>
        <p>
          <strong>Contact Email:</strong> {contactEmail}
        </p>
        <p>
          <strong>Phone Number:</strong> {phoneNumber}
        </p>
        <p>
          <strong>Client Since:</strong> {clientSince}
        </p>
        <p>
          <strong>Notes:</strong> {notes}
        </p>
      </div>

      {/* Quotation Table */}
      <table
        style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Description</th>
            <th>Rate</th>
            <th>Unit</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {table.map((item, index) => (
            <tr key={index}>
              <td>{item.description}</td>
              <td>{item.rate}</td>
              <td>{item.unit}</td>
              <td>{item.qty}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Subtotal:</strong> ${subtotal}
        </p>
        <p>
          <strong>Total Tax ({quoteArray.taxPercentage}%):</strong> ${totalTax}
        </p>
        <p>
          <strong>Grand Total:</strong> ${grandTotal}
        </p>
      </div>

      {/* Terms */}
      <div style={{ marginTop: "20px" }}>
        <h3>Terms</h3>
        <p>{terms}</p>
      </div>

      {/* Additional Info */}
      <div style={{ marginTop: "20px" }}>
        <h3>Additional Information</h3>
        <p>{additionalInfo}</p>
      </div>
    </div>
  );
};

export default QuotationDetailPage;
