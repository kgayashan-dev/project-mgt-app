import React, { useState } from "react";

// Define the type for a row
type Row = {
  description: string;
  rate: number;
  qty: number;
  total: number;
};

const EditableTable = () => {
  const [rows, setRows] = useState<Row[]>([
    { description: "", rate: 0, qty: 0, total: 0 },
  ]);

  // Update the handleInputChange function to expect only valid field names
  const handleInputChange = <K extends keyof Row>(
    index: number,
    field: K,
    value: Row[K]
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "rate" || field === "qty") {
      updatedRows[index].total = updatedRows[index].rate * updatedRows[index].qty;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { description: "", rate: 0, qty: 0, total: 0 }]);
  };

  return (
    <div>
      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Rate</th>
            <th className="border px-2 py-1">Qty</th>
            <th className="border px-2 py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                  className="w-full px-2 py-1"
                />
              </td>
              <td className="border">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleInputChange(index, "rate", Number(e.target.value))
                  }
                  className="w-full px-2 py-1"
                />
              </td>
              <td className="border">
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) =>
                    handleInputChange(index, "qty", Number(e.target.value))
                  }
                  className="w-full px-2 py-1"
                />
              </td>
              <td className="border px-2 py-1">{row.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="mt-2 px-4 py-1 bg-green-500 text-white rounded-md"
      >
        Add Row
      </button>
    </div>
  );
};

export default EditableTable;
