export const metadata = {
  title: "プライバシーポリシー | ポケトレ板",
};

export default function PrivacyPage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">プライバシーポリシー</h1>
          <p className="text-sm text-slate-400 mb-8">最終更新日：2026年6月28日</p>

          <div className="space-y-7 text-base text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">はじめに</h2>
              <p>
                ポケトレ板（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の適切な管理に努めています。
                本プライバシーポリシーでは、本サービスにおける情報の収集・利用・管理方針について説明します。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第1条（収集する情報）</h2>
              <p>本サービスでは、以下の情報を自動的に収集することがあります。</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>IPアドレス（スパム・荒らし対策の目的で記録されます）</li>
                <li>アクセス日時・閲覧ページ・リファラー・ブラウザ情報などのアクセスログ</li>
                <li>投稿時に入力されたニックネーム（任意）および投稿本文</li>
              </ul>
              <p className="mt-2">
                本サービスは会員登録機能を持たないため、氏名・メールアドレス・住所等の個人を特定する情報は原則として収集しません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第2条（情報の利用目的）</h2>
              <p>収集した情報は以下の目的で利用します。</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>本サービスの正常な提供・運営</li>
                <li>荒らし・スパム・不正アクセス等の防止および対策</li>
                <li>アクセス状況の分析によるサービス改善</li>
                <li>法令に基づく情報提供の対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第3条（Googleアナリティクスの利用）</h2>
              <p>
                本サービスでは、Googleが提供するアクセス解析ツール「Googleアナリティクス」を利用しています。
                Googleアナリティクスはデータ収集のためにCookieを使用します。このデータは匿名で収集されており、
                個人を特定するものではありません。
              </p>
              <p className="mt-2">
                Googleアナリティクスのデータ収集を無効にしたい場合は、
                <a
                  href="https://tools.google.com/dlpage/gaoptout?hl=ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:underline"
                >
                  Googleアナリティクスオプトアウトアドオン
                </a>
                をご利用ください。Googleアナリティクスの利用規約・プライバシーポリシーについては、Googleの公式サイトをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第4条（広告配信について）</h2>
              <p>
                本サービスでは、将来的に第三者の広告配信サービス（Google AdSense・A8.net等のASPを含む）を利用する場合があります。
                これらの広告配信会社は、ユーザーの興味に応じた広告を表示するために、CookieやWebビーコンを使用することがあります。
              </p>
              <p className="mt-2">
                広告配信にともなうCookieの利用については、各広告配信会社のプライバシーポリシーをご確認ください。
                Cookieを無効にすることでパーソナライズ広告の表示を停止できますが、その場合も広告自体は表示されることがあります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第5条（Cookieについて）</h2>
              <p>
                Cookie（クッキー）とは、ウェブサイトがブラウザに送信する小さなデータファイルです。
                本サービスでは以下の目的でCookieを使用します。
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>セッション管理（管理者ログイン状態の保持）</li>
                <li>アクセス解析（Googleアナリティクス）</li>
                <li>広告配信の最適化（将来的な広告サービス導入時）</li>
              </ul>
              <p className="mt-2">
                ブラウザの設定からCookieを無効にすることができますが、一部の機能が正常に動作しなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第6条（第三者への情報提供）</h2>
              <p>収集した情報は、以下の場合を除き第三者に提供しません。</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>ユーザー本人の同意がある場合</li>
                <li>法令に基づき、裁判所・警察等の公的機関から開示を求められた場合</li>
                <li>人の生命・身体・財産の保護のために必要であり、本人の同意を得ることが困難な場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第7条（個人情報の管理）</h2>
              <p>
                収集した情報は、不正アクセス・紛失・漏洩・改ざんを防ぐために適切なセキュリティ対策を講じて管理します。
                ただし、インターネット上での完全なセキュリティを保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第8条（プライバシーポリシーの変更）</h2>
              <p>
                本プライバシーポリシーは必要に応じて改訂することがあります。
                変更後のポリシーはサイト上に掲載した時点から効力を持ちます。
                重要な変更がある場合は、サイト上でお知らせします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第9条（お問い合わせ先）</h2>
              <p>
                本プライバシーポリシーに関するお問い合わせは、
                <a href="/contact" className="text-amber-600 hover:underline">お問い合わせページ</a>
                よりご連絡ください。
              </p>
            </section>

          </div>
        </div>
      </main>
  );
}
