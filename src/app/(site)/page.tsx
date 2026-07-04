import Link from "next/link";
import { getThreads } from "@/lib/store";
import { createThreadAction } from "@/lib/actions";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";
import ThreadListClient from "@/components/ThreadListClient";
import type { Category } from "@/lib/types";

const PAGE_SIZE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; error?: string; q?: string; sort?: string }>;
}) {
  const { category: activeCategory, page: pageParam, error, q, sort } = await searchParams;
  const validCategory =
    activeCategory && activeCategory in CATEGORY_CONFIG
      ? (activeCategory as Category)
      : null;
  const keyword = q?.trim() || undefined;
  const sortBy = sort === "activity" || sort === "replies" ? sort : "newest";

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const allThreads = await getThreads(keyword, sortBy);
  const filtered = validCategory
    ? allThreads.filter((t) => t.category === validCategory)
    : allThreads;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const threads = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageLink = (p: number) => {
    const params = new URLSearchParams();
    if (validCategory) params.set("category", validCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (keyword) params.set("q", keyword);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  const sortLink = (s: string) => {
    const params = new URLSearchParams();
    if (validCategory) params.set("category", validCategory);
    if (keyword) params.set("q", keyword);
    if (s !== "newest") params.set("sort", s);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-5 space-y-6">
        {/* 検索フォーム */}
        <form method="get" className="flex gap-2">
          {validCategory && <input type="hidden" name="category" value={validCategory} />}
          {sortBy !== "newest" && <input type="hidden" name="sort" value={sortBy} />}
          <input
            type="search"
            name="q"
            defaultValue={keyword ?? ""}
            placeholder="スレッドを検索..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            検索
          </button>
          {keyword && (
            <Link
              href={validCategory ? `/?category=${validCategory}` : "/"}
              className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            >
              クリア
            </Link>
          )}
        </form>
        {keyword && (
          <p className="text-sm text-gray-500 -mt-3">
            「{keyword}」の検索結果: {filtered.length}件
          </p>
        )}

        {/* スレッド作成フォーム */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            新しいスレッドを立てる
          </p>
          {error && (
            <p className="text-sm text-red-600 mb-3 px-1">
              {error === "rate_limit"
                ? "投稿が多すぎます。60秒後に再度お試しください。"
                : error === "ng_word"
                ? "NGワードが含まれているため投稿できません。"
                : error === "create"
                ? "スレッドの作成に失敗しました。再度お試しください。"
                : error === "ip_blocked"
                ? "このIPアドレスからの投稿は制限されています。"
                : null}
            </p>
          )}
          <form action={createThreadAction} className="space-y-3">
            <input
              type="text"
              name="title"
              placeholder="タイトル"
              required
              maxLength={50}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            />
            <input
              type="text"
              name="author"
              placeholder="名無しさん"
              maxLength={20}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            />
            <div className="space-y-1">
              <textarea
                name="body"
                placeholder="本文"
                required
                rows={3}
                maxLength={1000}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent resize-none leading-relaxed"
              />
              <p className="text-xs text-gray-400">
                画像を投稿したい場合は Gyazo や Imgur の URL を本文に貼り付けてください
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <select
                  name="category"
                  required
                  defaultValue=""
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-9 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-700"
                >
                  <option value="" disabled>
                    カテゴリを選択
                  </option>
                  {CATEGORY_ORDER.map((key) => (
                    <option key={key} value={key}>
                      {CATEGORY_CONFIG[key].label}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs">
                  ▼
                </span>
              </div>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors sm:shrink-0"
              >
                投稿する
              </button>
            </div>
          </form>
        </div>

        {/* ソートボタン */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">並び順:</span>
          {[
            { value: "newest", label: "新着順" },
            { value: "activity", label: "更新順" },
            { value: "replies", label: "レス数順" },
          ].map(({ value, label }) => (
            <Link
              key={value}
              href={sortLink(value)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                sortBy === value
                  ? "bg-slate-800 text-white border-slate-800"
                  : "text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* スレッド一覧 */}
        <ThreadListClient
          threads={threads.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            body: t.body ?? undefined,
            createdAt: t.createdAt.toISOString(),
            replyCount: t.posts.length + (t.body ? 1 : 0),
          }))}
        />

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            {safePage > 1 ? (
              <Link
                href={pageLink(safePage - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
              >
                前へ
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm text-gray-300 border border-gray-100 rounded-lg cursor-default">
                前へ
              </span>
            )}
            <span className="text-sm text-gray-500">
              {safePage} / {totalPages}
            </span>
            {safePage < totalPages ? (
              <Link
                href={pageLink(safePage + 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
              >
                次へ
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm text-gray-300 border border-gray-100 rounded-lg cursor-default">
                次へ
              </span>
            )}
          </div>
        )}
      </main>
  );
}
