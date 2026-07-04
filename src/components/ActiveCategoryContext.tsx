"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Category } from "@/lib/types";

type Ctx = {
  activeCategory: Category | null;
  setActiveCategory: (cat: Category | null) => void;
};

const ActiveCategoryContext = createContext<Ctx>({
  activeCategory: null,
  setActiveCategory: () => {},
});

export function ActiveCategoryProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  return (
    <ActiveCategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </ActiveCategoryContext.Provider>
  );
}

export function useActiveCategory() {
  return useContext(ActiveCategoryContext);
}
