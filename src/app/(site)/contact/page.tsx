import Breadcrumb from "@/components/Breadcrumb";
import FeedbackForm from "@/components/FeedbackForm";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-5">
        <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "お問い合わせ" }]} />
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-3">お問い合わせ</h1>
          <p className="text-sm text-gray-500 mb-6">
            ご意見・改善要望、投稿の削除依頼など、お気軽にお送りください。
          </p>
          {sent === "1" ? (
            <div className="py-10 text-center">
              <p className="text-lg font-semibold text-gray-700">送信しました！</p>
              <p className="text-sm text-gray-400 mt-2">ご連絡ありがとうございます</p>
            </div>
          ) : (
            <FeedbackForm />
          )}
        </div>
      </main>
  );
}
