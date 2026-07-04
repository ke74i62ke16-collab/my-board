import { cookies } from "next/headers";
import { getStats, getFeedbacks, getNgWords, getAdminThreads, getAdminPosts, getBlockedIps } from "@/lib/store";
import { adminLoginAction } from "@/lib/actions";
import AdminPanel, { type Section } from "@/components/AdminPanel";

const VALID_SECTIONS: Section[] = ["dashboard", "threads", "posts", "ngwords", "feedbacks", "ipblock"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; section?: string }>;
}) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth")?.value === "1";
  const { error, section } = await searchParams;

  if (!isAuth) {
    return (
      <main className="w-full max-w-sm mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">管理画面</h1>
          <p className="text-sm text-slate-400 mt-1">ポケトレ板 Admin</p>
        </div>
        {error === "1" && (
          <p className="text-red-600 text-sm mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            パスワードが違います
          </p>
        )}
        <form action={adminLoginAction} className="space-y-3">
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700"
          />
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            ログイン
          </button>
        </form>
      </main>
    );
  }

  const initialSection: Section = VALID_SECTIONS.includes(section as Section)
    ? (section as Section)
    : "dashboard";

  const [stats, feedbacks, ngWords, adminThreads, adminPosts, blockedIps] = await Promise.all([
    getStats(),
    getFeedbacks(),
    getNgWords().catch(() => [] as Awaited<ReturnType<typeof getNgWords>>),
    getAdminThreads(),
    getAdminPosts(),
    getBlockedIps().catch(() => [] as Awaited<ReturnType<typeof getBlockedIps>>),
  ]);

  return (
    <AdminPanel
      initialSection={initialSection}
      stats={stats}
      feedbacks={feedbacks}
      ngWords={ngWords}
      adminThreads={adminThreads}
      adminPosts={adminPosts}
      blockedIps={blockedIps}
    />
  );
}
