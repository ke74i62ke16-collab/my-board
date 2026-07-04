"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { getThreadsAction } from "@/lib/actions";
import { useRefreshCallback } from "@/components/RefreshCallbackContext";
import type { Category } from "@/lib/types";

export type ThreadSummary = {
  id: string;
  title: string;
  category: Category;
  body?: string;
  createdAt: string;
  replyCount: number;
};

const LS_INIT_FLAG = "threadBaseline_initialized";
const lsKey = (id: string) => `threadBaseline_${id}`;

export default function ThreadListClient({ threads }: { threads: ThreadSummary[] }) {
  // null = not yet loaded from localStorage (suppress badges during hydration)
  const [baselines, setBaselines] = useState<Record<string, number> | null>(null);
  const [polledCounts, setPolledCounts] = useState<Record<string, number> | null>(null);
  const { register } = useRefreshCallback();

  // Load baselines from localStorage after mount.
  // First-ever visit: save current counts as baseline for all visible threads and set flag.
  // Subsequent visits/reloads: only read, never overwrite existing entries.
  useEffect(() => {
    try {
      const alreadyInitialized = localStorage.getItem(LS_INIT_FLAG) !== null;
      if (!alreadyInitialized) {
        threads.forEach((t) => {
          localStorage.setItem(lsKey(t.id), String(t.replyCount));
        });
        localStorage.setItem(LS_INIT_FLAG, "1");
      }
      const loaded: Record<string, number> = {};
      threads.forEach((t) => {
        const stored = localStorage.getItem(lsKey(t.id));
        if (stored !== null) loaded[t.id] = parseInt(stored, 10);
        // threads with no entry (created after first visit) are omitted → badge = 0
      });
      setBaselines(loaded);
    } catch {
      setBaselines({});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateBadges = useCallback(async () => {
    try {
      const fresh = await getThreadsAction();
      const map: Record<string, number> = {};
      fresh.forEach((t) => { map[t.id] = t.count; });
      setPolledCounts(map);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    register(updateBadges);
  }, [register, updateBadges]);

  if (threads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
        該当するスレッドがありません
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {threads.map((thread) => {
        const config = CATEGORY_CONFIG[thread.category];
        const latestCount = polledCounts?.[thread.id] ?? thread.replyCount;
        // baselines === null means not yet loaded → suppress badge
        const baseline = baselines?.[thread.id];
        const badge =
          baselines !== null && baseline !== undefined
            ? Math.max(0, latestCount - baseline)
            : 0;

        return (
          <li key={thread.id}>
            <Link
              href={`/threads/${thread.id}`}
              className="block rounded-xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md bg-white border border-gray-200 hover:border-gray-300"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-sm font-medium shrink-0 ${config.badgeClass}`}>
                    {config.label}
                  </span>
                  <span className="text-base text-gray-400">
                    レス {latestCount}件
                  </span>
                  {badge > 0 && (
                    <span className="inline-flex items-center text-xs font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full leading-none tabular-nums">
                      +{badge}
                    </span>
                  )}
                  <span className="ml-auto text-sm text-gray-400 whitespace-nowrap">
                    {new Date(thread.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <p className="text-lg leading-snug font-medium text-gray-800">
                  {thread.title}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
