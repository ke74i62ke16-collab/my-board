"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useRefreshCallback } from "@/components/RefreshCallbackContext";

export default function FloatingRefreshButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { call } = useRefreshCallback();
  const [spinning, setSpinning] = useState(false);

  if (pathname.startsWith("/threads/")) return null;

  const handleClick = async () => {
    setSpinning(true);
    router.refresh();
    await call();
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="ページを更新"
      className="fixed right-0 top-[40%] -translate-y-1/2 z-50 bg-slate-800/85 hover:bg-slate-900 text-white w-10 h-12 rounded-l-xl shadow-lg flex items-center justify-center transition-colors backdrop-blur-sm"
    >
      <svg
        className={`w-5 h-5 transition-transform duration-700 ${spinning ? "rotate-[360deg]" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>
  );
}
