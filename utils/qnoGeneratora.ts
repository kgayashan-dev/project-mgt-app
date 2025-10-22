// Simple version - add this to your component
export const generateQuotationNumber = () => {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QTN-${currentYear}-${randomSuffix}`;
};

