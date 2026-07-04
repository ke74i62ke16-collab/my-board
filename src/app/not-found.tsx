import Link from "next/link";
import SiteHeaderWithNav from "@/components/SiteHeaderWithNav";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-full">
      <SiteHeaderWithNav />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-5 flex-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center space-y-5">
          <p className="text-7xl font-bold text-amber-400 tracking-tight">404</p>
          <h1 className="text-2xl font-bold text-slate-800">ページが見つかりません</h1>
          <p className="text-slate-500 text-base max-w-xs mx-auto">
            お探しのページは削除されたか、URLが変更された可能性があります。
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
