"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type DescriptionRecord = { description: string };

interface DescriptionContextType {
  description: string;
  setDescription: (desc: string) => void;
  records: DescriptionRecord[];
  setRecords: (records: DescriptionRecord[]) => void;
}

const DescriptionContext = createContext<DescriptionContextType | undefined>(
  undefined
);

export const useDescription = () => {
  const context = useContext(DescriptionContext);
  if (!context) {
    throw new Error("useDescription must be used within a DescriptionProvider");
  }
  return context;
};

export const DescriptionProvider = ({ children }: { children: ReactNode }) => {
  const [description, setDescription] = useState("");
  const [records, setRecords] = useState<DescriptionRecord[]>([]);

  return (
    <DescriptionContext.Provider
      value={{ description, setDescription, records, setRecords }}
    >
      {children}
    </DescriptionContext.Provider>
  );
};
