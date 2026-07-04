"use client";

import { createContext, useContext, useRef, useCallback } from "react";
import type { ReactNode } from "react";

type Ctx = {
  register: (fn: () => Promise<void>) => void;
  call: () => Promise<void>;
};

const RefreshCallbackContext = createContext<Ctx>({
  register: () => {},
  call: async () => {},
});

export function RefreshCallbackProvider({ children }: { children: ReactNode }) {
  const callbackRef = useRef<(() => Promise<void>) | null>(null);

  const register = useCallback((fn: () => Promise<void>) => {
    callbackRef.current = fn;
  }, []);

  const call = useCallback(async () => {
    if (callbackRef.current) await callbackRef.current();
  }, []);

  return (
    <RefreshCallbackContext.Provider value={{ register, call }}>
      {children}
    </RefreshCallbackContext.Provider>
  );
}

export function useRefreshCallback() {
  return useContext(RefreshCallbackContext);
}
