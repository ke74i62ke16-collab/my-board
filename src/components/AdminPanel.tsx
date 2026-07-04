"use client";

import { useState, useEffect, useTransition } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { NgWord, AdminThread, AdminPost, BlockedIp } from "@/lib/store";
import Logo from "@/components/Logo";
import type { Feedback } from "@/lib/types";
import type { Category } from "@/lib/types";
import {
  addNgWordAction,
  adminLogoutAction,
  restorePostAction,
  deleteFeedbackDirectAction,
  updateFeedbackStatusDirectAction,
  fetchPostTrendAction,
  fetchStatsByCategoryAction,
  fetchTotalLikesAction,
  blockIpDirectAction,
  unblockIpDirectAction,
  deleteThreadDirectAction,
} from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";

export type Section = "dashboard" | "threads" | "posts" | "ngwords" | "feedbacks" | "ipblock";

type Stats = {
  totalThreads: number;
  totalPosts: number;
  todayPosts: number;
  dailyPosts: { date: string; count: number }[];
};

type Props = {
  initialSection: Section;
  stats: Stats;
  feedbacks: Feedback[];
  ngWords: NgWord[];
  adminThreads: AdminThread[];
  adminPosts: AdminPost[];
  blockedIps: BlockedIp[];
};

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "ダッシュボード",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: "threads",
    label: "スレッド管理",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    id: "posts",
    label: "投稿管理",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    id: "ngwords",
    label: "NGワード管理",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    id: "feedbacks",
    label: "お問い合わせ",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: "ipblock",
    label: "IPブロック",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

export default function AdminPanel({
  initialSection,
  stats,
  feedbacks,
  ngWords,
  adminThreads,
  adminPosts,
  blockedIps: initialBlockedIps,
}: Props) {
  const [active, setActive] = useState<Section>(initialSection);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>(initialBlockedIps);

  const handleBlockIp = async (ip: string, reason?: string): Promise<{ error?: string }> => {
    const result = await blockIpDirectAction(ip, reason);
    if (result.error) return { error: result.error };
    setBlockedIps((prev) => [
      { id: result.id!, ip, reason: reason || undefined, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    return {};
  };

  const handleUnblockIp = async (id: string): Promise<{ error?: string }> => {
    const result = await unblockIpDirectAction(id);
    if (result.error) return { error: result.error };
    setBlockedIps((prev) => prev.filter((b) => b.id !== id));
    return {};
  };

  const counts: Partial<Record<Section, number>> = {
    threads: adminThreads.length,
    posts: adminPosts.length,
    ngwords: ngWords.length,
    feedbacks: feedbacks.length,
    ipblock: blockedIps.length,
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Admin Header ── */}
      <header className="shrink-0 bg-[#1d2327] border-b border-white/10 h-12 flex items-center px-6 gap-3">
        <Logo size="sm" variant="dark" />
        <span className="w-px h-4 bg-white/20" />
        <h1 className="text-white/80 text-sm font-medium">管理画面</h1>
      </header>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-56 shrink-0 bg-[#1d2327] flex flex-col overflow-y-auto">
          <nav className="flex-1 py-3">
            {NAV.map((item) => {
              const isActive = active === item.id;
              const count = counts[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center justify-between pl-4 pr-3 py-3 text-sm font-medium border-l-[3px] transition-colors text-left group ${
                    isActive
                      ? "border-amber-400 bg-[#2c3338] text-amber-400"
                      : "border-transparent text-[#a7aaad] hover:text-white hover:bg-[#2c3338]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded tabular-nums shrink-0 ${
                      isActive
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-[#3c434a] text-[#a7aaad] group-hover:bg-[#3c434a]"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3 shrink-0">
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#a7aaad] hover:text-white hover:bg-[#2c3338] rounded transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                ログアウト
              </button>
            </form>
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="flex-1 bg-[#f0f0f1] overflow-y-auto min-w-0">
          <div className="p-6 sm:p-8 max-w-5xl space-y-6">
            <h1 className="text-2xl font-bold text-[#1d2327]">
              {NAV.find((n) => n.id === active)?.label}
            </h1>

            {active === "dashboard" && (
              <DashboardSection stats={stats} adminThreads={adminThreads} adminPosts={adminPosts} feedbacks={feedbacks} />
            )}
            {active === "threads" && <ThreadsSection threads={adminThreads} onBlock={handleBlockIp} />}
            {active === "posts" && <PostsSection posts={adminPosts} onBlock={handleBlockIp} />}
            {active === "ngwords" && <NgWordsSection ngWords={ngWords} />}
            {active === "feedbacks" && <FeedbacksSection feedbacks={feedbacks} />}
            {active === "ipblock" && <IpBlockSection blockedIps={blockedIps} onBlock={handleBlockIp} onUnblock={handleUnblockIp} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

function Card({
  title,
  count,
  children,
  action,
}: {
  title?: string;
  count?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#c3c4c7] overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e4e7] bg-gray-50">
          <h2 className="text-base font-semibold text-[#1d2327]">{title}</h2>
          <div className="flex items-center gap-3">
            {action}
            {count !== undefined && (
              <span className="text-sm bg-[#e2e4e7] text-[#50575e] px-2 py-0.5 rounded-full font-medium">
                {count}件
              </span>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function FilterBar<T extends string>({
  options,
  active,
  onChange,
  counts,
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {options.map((opt) => {
        const isActive = active === opt.value;
        const cnt = counts?.[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
              isActive
                ? "bg-[#1d2327] text-white border-[#1d2327]"
                : "bg-white text-[#646970] border-[#c3c4c7] hover:border-[#646970] hover:text-[#1d2327]"
            }`}
          >
            {opt.label}
            {cnt !== undefined && (
              <span className={`text-xs tabular-nums ${isActive ? "opacity-70" : "text-[#a7aaad]"}`}>
                {cnt}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PeriodTabs<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-xs px-2.5 py-1 rounded transition-colors ${
            active === opt.value
              ? "bg-[#1d2327] text-white"
              : "text-[#646970] hover:bg-[#e2e4e7]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sections ──────────────────────────────────────────────────────────────────

type TrendPeriod = "today" | "7days" | "30days";
type CatPeriod = "all" | "this_month" | "last_month" | "last_7_days";

function DashboardSection({
  stats,
  adminThreads,
  adminPosts,
  feedbacks,
}: {
  stats: Stats;
  adminThreads: AdminThread[];
  adminPosts: AdminPost[];
  feedbacks: Feedback[];
}) {
  const pendingDeletes = feedbacks.filter(
    (f) => f.type === "delete_request" && (f.status === "pending" || !f.status)
  ).length;

  // Trend chart state
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("7days");
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>(stats.dailyPosts);
  const [trendLoading, setTrendLoading] = useState(false);

  // Category stats chart state
  const [catPeriod, setCatPeriod] = useState<CatPeriod>("all");
  const [catData, setCatData] = useState<{ category: string; label?: string; threadCount: number; postCount: number }[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  const [totalLikes, setTotalLikes] = useState<{ threadLikes: number; postLikes: number } | null>(null);

  useEffect(() => {
    setTrendLoading(true);
    fetchPostTrendAction(trendPeriod).then((data) => {
      setTrendData(data);
      setTrendLoading(false);
    });
  }, [trendPeriod]);

  useEffect(() => {
    setCatLoading(true);
    fetchStatsByCategoryAction(catPeriod).then((data) => {
      setCatData(data.map((d) => ({
        ...d,
        label: CATEGORY_CONFIG[d.category as keyof typeof CATEGORY_CONFIG]?.label ?? d.category,
      })));
      setCatLoading(false);
    });
  }, [catPeriod]);

  useEffect(() => {
    fetchTotalLikesAction().then(setTotalLikes);
  }, []);

  const trendPeriodOptions: { value: TrendPeriod; label: string }[] = [
    { value: "today", label: "本日" },
    { value: "7days", label: "7日" },
    { value: "30days", label: "30日" },
  ];

  const catPeriodOptions: { value: CatPeriod; label: string }[] = [
    { value: "all", label: "全期間" },
    { value: "this_month", label: "今月" },
    { value: "last_month", label: "先月" },
    { value: "last_7_days", label: "直近7日" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: stats.totalThreads, label: "総スレッド数", gold: false },
          { value: stats.totalPosts, label: "総投稿数", gold: false },
          { value: stats.todayPosts, label: "本日の投稿数", gold: true },
          { value: pendingDeletes, label: "未対応の削除依頼", gold: false, alert: pendingDeletes > 0 },
        ].map(({ value, label, gold, alert }) => (
          <div
            key={label}
            className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
              alert ? "border-red-300" : gold ? "border-amber-300" : "border-[#c3c4c7]"
            }`}
          >
            {alert ? <div className="h-1 bg-red-400" /> : gold ? <div className="h-1 bg-amber-400" /> : <div className="h-1 bg-slate-700" />}
            <div className="px-4 py-5 text-center">
              <p className={`text-4xl font-bold tabular-nums ${
                alert && value > 0 ? "text-red-500" : gold ? "text-amber-500" : "text-[#1d2327]"
              }`}>
                {value}
              </p>
              <p className="text-xs text-[#646970] mt-2 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Likes summary cards */}
      {totalLikes !== null && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: totalLikes.threadLikes, label: "総いいね数（スレッド）" },
            { value: totalLikes.postLikes, label: "総いいね数（投稿）" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-lg shadow-sm border border-pink-200 overflow-hidden">
              <div className="h-1 bg-pink-400" />
              <div className="px-4 py-5 text-center">
                <p className="text-4xl font-bold tabular-nums text-pink-500">{value}</p>
                <p className="text-xs text-[#646970] mt-2 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete request alert */}
      {pendingDeletes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-base text-red-700 font-medium">
            未対応の削除依頼が <span className="font-bold">{pendingDeletes}件</span> あります
          </p>
        </div>
      )}

      {/* Post trend chart */}
      <Card
        title="投稿数トレンド"
        action={
          <div className="flex items-center gap-2">
            <PeriodTabs options={trendPeriodOptions} active={trendPeriod} onChange={setTrendPeriod} />
            <button
              type="button"
              onClick={() => downloadCsv(`post-trend-${trendPeriod}.csv`, trendData)}
              className="text-xs px-2.5 py-1 border border-[#c3c4c7] text-[#646970] rounded hover:bg-[#e2e4e7] transition-colors"
            >
              CSV
            </button>
          </div>
        }
      >
        <div className="px-2 py-5 h-56 relative">
          {trendLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <span className="text-sm text-[#646970]">読み込み中...</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#646970" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#646970" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #c3c4c7" }}
                formatter={(v: any) => [`${v}件`, "投稿数"]}
              />
              <Bar dataKey="count" fill="#334155" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category stats chart */}
      <Card
        title="カテゴリ別統計"
        action={
          <div className="flex items-center gap-2">
            <PeriodTabs options={catPeriodOptions} active={catPeriod} onChange={setCatPeriod} />
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `category-stats-${catPeriod}.csv`,
                  catData.map((d) => ({ カテゴリ: d.label ?? d.category, スレッド数: d.threadCount, 投稿数: d.postCount }))
                )
              }
              className="text-xs px-2.5 py-1 border border-[#c3c4c7] text-[#646970] rounded hover:bg-[#e2e4e7] transition-colors"
            >
              CSV
            </button>
          </div>
        }
      >
        <div className="px-2 py-5 h-64 relative">
          {catLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <span className="text-sm text-[#646970]">読み込み中...</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e7" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#646970" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#646970" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #c3c4c7" }}
                formatter={(v: any, name: any) => [
                  `${v}件`,
                  name === "threadCount" ? "スレッド" : "投稿",
                ]}
              />
              <Legend formatter={(v) => (v === "threadCount" ? "スレッド" : "投稿")} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="threadCount" fill="#334155" radius={[3, 3, 0, 0]} />
              <Bar dataKey="postCount" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ThreadsSection({ threads: initialThreads, onBlock }: { threads: AdminThread[]; onBlock: (ip: string) => Promise<{ error?: string }> }) {
  type FilterVal = "all" | Category;
  const [filter, setFilter] = useState<FilterVal>("all");
  const [threads, setThreads] = useState<AdminThread[]>(initialThreads);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`「${title}」を削除しますか？`)) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteThreadDirectAction(id);
      if ("error" in result) {
        setDeleteError(result.error);
      } else {
        setThreads((prev) => prev.filter((t) => t.id !== id));
      }
    });
  };

  const filterOptions: { value: FilterVal; label: string }[] = [
    { value: "all", label: "すべて" },
    ...CATEGORY_ORDER.map((k) => ({ value: k as FilterVal, label: CATEGORY_CONFIG[k].label })),
  ];
  const filterCounts: Partial<Record<FilterVal, number>> = {
    all: threads.length,
    ...Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, threads.filter((t) => t.category === k).length])
    ),
  };

  const visible = filter === "all" ? threads : threads.filter((t) => t.category === filter);

  return (
    <div>
      <FilterBar options={filterOptions} active={filter} onChange={setFilter} counts={filterCounts} />
      {deleteError && (
        <div className="mx-0 mb-3 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700 flex-1">
            削除に失敗しました: {deleteError}
            {deleteError.includes("policy") || deleteError.includes("RLS") || deleteError.includes("permission") ? (
              <span className="block mt-1 font-mono text-xs bg-red-100 rounded px-2 py-1 mt-2">
                Supabaseで以下のSQLを実行してください:<br />
                CREATE POLICY &quot;allow_delete&quot; ON posts FOR DELETE USING (true);<br />
                CREATE POLICY &quot;allow_delete&quot; ON threads FOR DELETE USING (true);
              </span>
            ) : null}
          </p>
          <button type="button" onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
        </div>
      )}
      <Card count={visible.length}>
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-base text-[#646970] text-center">スレッドはありません</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f1]">
            {visible.map((t) => {
              const cat = CATEGORY_CONFIG[t.category as keyof typeof CATEGORY_CONFIG];
              return (
                <li key={t.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <span className={`shrink-0 text-sm px-2 py-0.5 rounded font-medium ${cat?.badgeClass ?? "bg-gray-100 text-gray-600"}`}>
                    {cat?.label ?? t.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-base text-[#1d2327] truncate block">{t.title}</span>
                    {t.ip && <span className="text-xs font-mono text-[#a7aaad]">{t.ip}</span>}
                  </div>
                  <span className="text-sm text-[#646970] shrink-0 hidden sm:block whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                  {t.ip && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`${t.ip} をブロックしますか？`)) return;
                        const result = await onBlock(t.ip!);
                        if (result?.error) alert(`ブロックに失敗しました: ${result.error}`);
                      }}
                      className="text-xs px-2 py-0.5 border border-orange-200 text-orange-600 rounded hover:bg-orange-50 transition-colors whitespace-nowrap shrink-0"
                    >
                      ブロック
                    </button>
                  )}
                  <a
                    href={`/threads/${t.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm px-2.5 py-1 border border-[#c3c4c7] text-[#646970] rounded hover:bg-gray-100 hover:text-[#1d2327] transition-colors whitespace-nowrap"
                  >
                    表示
                  </a>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(t.id, t.title)}
                    className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                  >
                    削除
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PostsSection({ posts, onBlock }: { posts: AdminPost[]; onBlock: (ip: string) => Promise<{ error?: string }> }) {
  type FilterVal = "all" | Category;
  const [filter, setFilter] = useState<FilterVal>("all");

  const filterOptions: { value: FilterVal; label: string }[] = [
    { value: "all", label: "すべて" },
    ...CATEGORY_ORDER.map((k) => ({ value: k as FilterVal, label: CATEGORY_CONFIG[k].label })),
  ];
  const filterCounts: Partial<Record<FilterVal, number>> = {
    all: posts.length,
    ...Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, posts.filter((p) => p.threadCategory === k).length])
    ),
  };

  const visible = filter === "all" ? posts : posts.filter((p) => p.threadCategory === filter);

  return (
    <div>
      <FilterBar options={filterOptions} active={filter} onChange={setFilter} counts={filterCounts} />
      <Card count={visible.length}>
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-base text-[#646970] text-center">投稿はありません</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f1]">
            {visible.map((p) => (
              <li key={p.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-[#646970] bg-[#f0f0f1] px-1.5 py-0.5 rounded shrink-0">
                      #{p.postNumber}
                    </span>
                    <span className="text-sm font-semibold text-[#1d2327]">{p.author}</span>
                    <span className="text-sm text-[#646970]">{new Date(p.createdAt).toLocaleString("ja-JP")}</span>
                    {p.isDeleted && (
                      <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-medium">削除済</span>
                    )}
                  </div>
                  <p className={`text-base truncate ${p.isDeleted ? "text-[#a7aaad] italic" : "text-[#1d2327]"}`}>
                    {p.content}
                  </p>
                  {p.threadTitle && (
                    <p className="text-sm text-[#646970] mt-0.5 truncate">
                      <span className="text-[#a7aaad]">スレッド:</span> {p.threadTitle}
                    </p>
                  )}
                  {p.ip && (
                    <p className="text-xs font-mono text-[#a7aaad] mt-0.5">IP: {p.ip}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.ip && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`${p.ip} をブロックしますか？`)) return;
                        const result = await onBlock(p.ip!);
                        if (result?.error) alert(`ブロックに失敗しました: ${result.error}`);
                      }}
                      className="text-xs px-2 py-0.5 border border-orange-200 text-orange-600 rounded hover:bg-orange-50 transition-colors whitespace-nowrap"
                    >
                      ブロック
                    </button>
                  )}
                  <a
                    href={`/threads/${p.threadId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-2.5 py-1 border border-[#c3c4c7] text-[#646970] rounded hover:bg-gray-100 hover:text-[#1d2327] transition-colors whitespace-nowrap"
                  >
                    スレッド表示
                  </a>
                  {p.isDeleted ? (
                    <form action={restorePostAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-sm px-2.5 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        削除取消
                      </button>
                    </form>
                  ) : (
                    <DeleteButton type="post" id={p.id} label="この投稿" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function NgWordsSection({ ngWords }: { ngWords: NgWord[] }) {
  return (
    <div className="space-y-5">
      <Card title="NGワードを追加">
        <div className="px-6 py-4">
          <form action={addNgWordAction} className="flex gap-2">
            <input
              type="text"
              name="word"
              placeholder="NGワードを入力（小文字に正規化されます）"
              required
              className="flex-1 border border-[#c3c4c7] rounded px-3 py-2.5 text-base text-[#1d2327] placeholder-[#a7aaad] focus:outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]"
            />
            <button
              type="submit"
              className="bg-[#1d2327] hover:bg-[#2c3338] text-white px-5 py-2.5 rounded text-base font-medium transition-colors shrink-0"
            >
              追加
            </button>
          </form>
        </div>
      </Card>

      <Card title="登録済みNGワード" count={ngWords.length}>
        {ngWords.length === 0 ? (
          <p className="px-6 py-10 text-base text-[#646970] text-center">NGワードはまだ登録されていません</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f1]">
            {ngWords.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <code className="text-base text-[#1d2327] bg-[#f0f0f1] px-2.5 py-1 rounded font-mono">{w.word}</code>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-[#646970] hidden sm:block whitespace-nowrap">
                    {new Date(w.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                  <DeleteButton type="ngword" id={w.id} label={`「${w.word}」`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:     { label: "未対応",  cls: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "対応中",  cls: "bg-blue-100 text-blue-600" },
  resolved:    { label: "対応済み", cls: "bg-green-100 text-green-700" },
};

function StatusUpdater({
  feedbackId,
  initialStatus,
  onUpdate,
}: {
  feedbackId: string;
  initialStatus: string;
  onUpdate: (id: string, status: string) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateFeedbackStatusDirectAction(feedbackId, status);
    onUpdate(feedbackId, status);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="text-sm border border-[#c3c4c7] rounded px-2 py-1.5 text-[#1d2327] focus:outline-none focus:border-[#2271b1]"
      >
        <option value="pending">未対応</option>
        <option value="in_progress">対応中</option>
        <option value="resolved">対応済み</option>
      </select>
      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="text-sm px-3 py-1.5 bg-[#1d2327] hover:bg-[#2c3338] text-white rounded transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {saving ? "更新中..." : "更新"}
      </button>
    </div>
  );
}

type FbFilter = "all" | "delete_request" | "general" | "other";

function FeedbacksSection({ feedbacks: initialFeedbacks }: { feedbacks: Feedback[] }) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [filter, setFilter] = useState<FbFilter>("all");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("このお問い合わせを完全に削除しますか？この操作は取り消せません。")) return;
    setDeleteError(null);
    const result = await deleteFeedbackDirectAction(id);
    if (result?.error) {
      const isRls = result.error === "RLS_BLOCKED";
      setDeleteError(
        isRls
          ? "削除に失敗しました。Supabase の feedbacks テーブルに DELETE ポリシーが設定されていません。"
          : `削除に失敗しました: ${result.error}`
      );
      return;
    }
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, status: newStatus } : f));
  };

  const filterOptions: { value: FbFilter; label: string }[] = [
    { value: "all",            label: "すべて" },
    { value: "delete_request", label: "削除依頼" },
    { value: "general",        label: "ご意見・改善要望" },
    { value: "other",          label: "その他" },
  ];
  const filterCounts: Partial<Record<FbFilter, number>> = {
    all:            feedbacks.length,
    delete_request: feedbacks.filter((f) => f.type === "delete_request").length,
    general:        feedbacks.filter((f) => f.type === "general").length,
    other:          feedbacks.filter((f) => f.type === "other").length,
  };

  const visible = filter === "all" ? feedbacks : feedbacks.filter((f) => f.type === filter);

  const emptyMsg =
    filter === "delete_request" ? "削除依頼はありません" :
    filter === "general"        ? "ご意見・改善要望はありません" :
    filter === "other"          ? "その他のお問い合わせはありません" :
    "お問い合わせはありません";

  return (
    <div>
      {deleteError && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-5 py-4">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.05 3.378c.866-1.5 3.032-1.5 3.898 0l5.355 9.748zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-700">{deleteError}</p>
          </div>
          <button type="button" onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <FilterBar options={filterOptions} active={filter} onChange={setFilter} counts={filterCounts} />
      <Card>
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-base text-[#646970] text-center">{emptyMsg}</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f1]">
            {visible.map((fb) => {
              const statusCfg = STATUS_CONFIG[fb.status ?? "pending"] ?? STATUS_CONFIG.pending;
              const isDelete = fb.type === "delete_request";
              return (
                <li key={fb.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {(filter === "all") && (
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            fb.type === "delete_request" ? "bg-red-100 text-red-600" :
                            fb.type === "other"          ? "bg-gray-100 text-gray-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            {fb.type === "delete_request" ? "削除依頼" :
                             fb.type === "other"          ? "その他" : "ご意見"}
                          </span>
                        )}
                        <span className="text-base font-semibold text-[#1d2327]">{fb.name}</span>
                        <span className="text-sm text-[#646970]">
                          {new Date(fb.createdAt).toLocaleString("ja-JP")}
                        </span>
                        {isDelete && (
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                        )}
                      </div>
                      {isDelete && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-1 text-sm">
                          {fb.targetUrl && (
                            <p><span className="font-medium text-[#646970]">対象スレッド:</span>{" "}
                              <span className="text-[#1d2327]">{fb.targetUrl}</span></p>
                          )}
                          {fb.postNumber && (
                            <p><span className="font-medium text-[#646970]">投稿番号:</span>{" "}
                              <span className="text-[#1d2327]">#{fb.postNumber}</span></p>
                          )}
                          {fb.deleteReason && (
                            <p><span className="font-medium text-[#646970]">削除理由:</span>{" "}
                              <span className="text-[#1d2327] whitespace-pre-wrap">{fb.deleteReason}</span></p>
                          )}
                        </div>
                      )}
                      {fb.content && (
                        <p className="text-base text-[#3c434a] whitespace-pre-wrap leading-relaxed">{fb.content}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {isDelete && (
                        <StatusUpdater
                          feedbackId={fb.id}
                          initialStatus={fb.status ?? "pending"}
                          onUpdate={handleStatusUpdate}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(fb.id)}
                        className="text-xs px-2.5 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors whitespace-nowrap"
                      >
                        完全削除
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── IP Block ──────────────────────────────────────────────────────────────────

function IpBlockSection({
  blockedIps,
  onBlock,
  onUnblock,
}: {
  blockedIps: BlockedIp[];
  onBlock: (ip: string, reason?: string) => Promise<{ error?: string }>;
  onUnblock: (id: string) => Promise<{ error?: string }>;
}) {
  const [ipInput, setIpInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ip = ipInput.trim();
    if (!ip) return;
    setAdding(true);
    setAddError(null);
    const result = await onBlock(ip, reasonInput.trim() || undefined);
    setAdding(false);
    if (result?.error) {
      setAddError(result.error);
      return;
    }
    setIpInput("");
    setReasonInput("");
  };

  const handleUnblock = async (id: string, ip: string) => {
    if (!window.confirm(`${ip} のブロックを解除しますか？`)) return;
    const result = await onUnblock(id);
    if (result?.error) {
      alert(`解除に失敗しました: ${result.error}`);
    }
  };

  return (
    <div className="space-y-5">
      <Card title="IPアドレスをブロック">
        <div className="px-6 py-4">
          {addError && (
            <p className="text-sm text-red-600 mb-3">{addError}</p>
          )}
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="IPアドレス（例: 192.168.1.1）"
                required
                className="flex-1 border border-[#c3c4c7] rounded px-3 py-2.5 text-base text-[#1d2327] placeholder-[#a7aaad] focus:outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="理由（任意）"
                className="flex-1 border border-[#c3c4c7] rounded px-3 py-2.5 text-base text-[#1d2327] placeholder-[#a7aaad] focus:outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1]"
              />
              <button
                type="submit"
                disabled={adding}
                className="bg-[#1d2327] hover:bg-[#2c3338] text-white px-5 py-2.5 rounded text-base font-medium transition-colors shrink-0 disabled:opacity-50"
              >
                {adding ? "追加中..." : "ブロック"}
              </button>
            </div>
          </form>
        </div>
      </Card>

      <Card title="ブロック済みIPアドレス" count={blockedIps.length}>
        {blockedIps.length === 0 ? (
          <p className="px-6 py-10 text-base text-[#646970] text-center">ブロック済みのIPアドレスはありません</p>
        ) : (
          <ul className="divide-y divide-[#f0f0f1]">
            {blockedIps.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <code className="text-base text-[#1d2327] bg-[#f0f0f1] px-2.5 py-1 rounded font-mono shrink-0">
                  {b.ip}
                </code>
                <span className="flex-1 text-sm text-[#646970] truncate">{b.reason ?? "—"}</span>
                <span className="text-sm text-[#646970] shrink-0 hidden sm:block whitespace-nowrap">
                  {new Date(b.createdAt).toLocaleDateString("ja-JP")}
                </span>
                <button
                  type="button"
                  onClick={() => handleUnblock(b.id, b.ip)}
                  className="text-sm px-2.5 py-1 border border-[#c3c4c7] text-[#646970] rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors whitespace-nowrap shrink-0"
                >
                  解除
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
