  export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

export const renderUnknownValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (typeof value === "string") {
    return value.trim() || "N/A";
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return "N/A";
  }
  return JSON.stringify(value);
};

export const formatCurrency = (value?: number) => {
  return (
    value?.toLocaleString("en-US", {
      style: "decimal", // Changed from "currency" to "decimal" to remove currency symbol
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00"
  );
};

export  const formatDate2 = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  
export const formatCurrencyOrNA = (value: number | null | undefined) => {
  return value !== null && value !== undefined 
    ? formatCurrency(value) 
    : renderUnknownValue(value);
};

export const renderCurrencyValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  
  if (typeof value === "number") {
    return formatCurrency(value);
  }
  
  // If it's somehow not a number, try to convert it
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return formatCurrency(numValue);
  }
  
  return "N/A";
};
