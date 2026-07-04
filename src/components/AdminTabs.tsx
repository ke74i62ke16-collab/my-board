"use client";

import { useState } from "react";
import type { NgWord, AdminThread, AdminPost } from "@/lib/store";
import type { Feedback } from "@/lib/types";
import { addNgWordAction } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";
import { CATEGORY_CONFIG } from "@/lib/categories";

export type TabId = "stats" | "threads" | "posts" | "ngwords" | "feedbacks";

type Props = {
  initialTab: TabId;
  stats: { totalThreads: number; totalPosts: number; todayPosts: number };
  feedbacks: Feedback[];
  ngWords: NgWord[];
  adminThreads: AdminThread[];
  adminPosts: AdminPost[];
};

const TABS: { id: TabId; label: string }[] = [
  { id: "stats", label: "統計" },
  { id: "threads", label: "スレッド管理" },
  { id: "posts", label: "投稿管理" },
  { id: "ngwords", label: "NGワード" },
  { id: "feedbacks", label: "ご意見・要望" },
];

export default function AdminTabs({ initialTab, stats, feedbacks, ngWords, adminThreads, adminPosts }: Props) {
  const [active, setActive] = useState<TabId>(initialTab);

  const counts: Record<TabId, number | undefined> = {
    stats: undefined,
    threads: adminThreads.length,
    posts: adminPosts.length,
    ngwords: ngWords.length,
    feedbacks: feedbacks.length,
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="bg-slate-800 rounded-xl mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map((tab) => {
            const count = counts[tab.id];
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  isActive
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                {count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive ? "bg-amber-400/20 text-amber-300" : "bg-slate-700 text-slate-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 統計 ── */}
      {active === "stats" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: stats.totalThreads, label: "総スレッド数", accent: false },
            { value: stats.totalPosts, label: "総投稿数", accent: false },
            { value: stats.todayPosts, label: "本日の投稿数", accent: true },
          ].map(({ value, label, accent }) => (
            <div
              key={label}
              className={`rounded-xl p-6 text-center shadow-sm border ${
                accent
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className={`text-5xl font-bold tabular-nums ${accent ? "text-amber-600" : "text-slate-900"}`}>
                {value}
              </p>
              <p className="text-xs text-gray-400 mt-2 tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── スレッド管理 ── */}
      {active === "threads" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-widest">
              スレッド一覧 — {adminThreads.length}件
            </h2>
          </div>
          {adminThreads.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">スレッドはありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {adminThreads.map((t) => {
                const cat = CATEGORY_CONFIG[t.category as keyof typeof CATEGORY_CONFIG];
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${cat?.badgeClass ?? "bg-gray-100 text-gray-600"}`}>
                      {cat?.label ?? t.category}
                    </span>
                    <span className="flex-1 text-sm text-gray-800 truncate">{t.title}</span>
                    <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                      {new Date(t.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    <DeleteButton type="thread" id={t.id} label={`「${t.title}」`} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── 投稿管理 ── */}
      {active === "posts" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-widest">
              投稿一覧 — 最新{adminPosts.length}件
            </h2>
          </div>
          {adminPosts.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">投稿はありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {adminPosts.map((p) => (
                <li key={p.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-700">{p.author}</span>
                      <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString("ja-JP")}</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">{p.content}</p>
                    {p.threadTitle && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        スレッド: {p.threadTitle}
                      </p>
                    )}
                  </div>
                  <DeleteButton type="post" id={p.id} label="この投稿" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── NGワード ── */}
      {active === "ngwords" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-widest">NGワード管理</h2>
          </div>
          <div className="px-5 py-4 border-b border-gray-100">
            <form action={addNgWordAction} className="flex gap-2">
              <input
                type="text"
                name="word"
                placeholder="NGワードを入力（小文字に正規化されます）"
                required
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                追加
              </button>
            </form>
          </div>
          {ngWords.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">NGワードはまだ登録されていません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {ngWords.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-mono text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded">{w.word}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(w.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    <DeleteButton type="ngword" id={w.id} label={`「${w.word}」`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── ご意見・要望 ── */}
      {active === "feedbacks" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-widest">
              ご意見・要望 — {feedbacks.length}件
            </h2>
          </div>
          {feedbacks.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">まだ意見はありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {feedbacks.map((fb) => (
                <li key={fb.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-slate-700">{fb.name}</span>
                    <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleString("ja-JP")}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{fb.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
