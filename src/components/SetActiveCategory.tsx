"use client";

import { useEffect } from "react";
import { useActiveCategory } from "@/components/ActiveCategoryContext";
import type { Category } from "@/lib/types";

export default function SetActiveCategory({ category }: { category: Category }) {
  const { setActiveCategory } = useActiveCategory();
  useEffect(() => {
    setActiveCategory(category);
    return () => setActiveCategory(null);
  }, [category, setActiveCategory]);
  return null;
}
