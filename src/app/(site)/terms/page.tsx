export const metadata = {
  title: "利用規約 | ポケトレ板",
};

export default function TermsPage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">利用規約</h1>
          <p className="text-sm text-slate-400 mb-8">最終更新日：2026年6月28日</p>

          <div className="space-y-7 text-base text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第1条（サービスの概要）</h2>
              <p>
                ポケトレ板（以下「本サービス」）は、ポケモンカードの投資・コレクションに関する情報交換を目的とした匿名掲示板です。
                ユーザーはスレッドを作成し、自由に投稿・コメントを行うことができます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第2条（利用条件）</h2>
              <p>本サービスをご利用いただくにあたり、以下の条件に同意いただくものとします。</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>日本国内の法令を遵守すること</li>
                <li>本規約の内容を理解・同意した上で利用すること</li>
                <li>投稿内容について自ら責任を負うこと</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第3条（禁止事項）</h2>
              <p>ユーザーは以下の行為を行ってはなりません。</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>荒らし行為、スパム投稿、連続投稿などの迷惑行為</li>
                <li>他のユーザーへの誹謗・中傷・脅迫・ハラスメント</li>
                <li>著作権・商標権など第三者の知的財産権を侵害する投稿</li>
                <li>他者の個人情報（氏名・住所・電話番号・メールアドレスなど）の無断公開</li>
                <li>わいせつ・暴力的・差別的なコンテンツの投稿</li>
                <li>詐欺・フィッシング・マルウェア等の不正行為に関連する投稿</li>
                <li>特定の個人・団体への不当な攻撃または風評被害を目的とした投稿</li>
                <li>虚偽の情報を意図的に流布する行為</li>
                <li>本サービスのシステムへの不正アクセス・クラッキング行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第4条（投稿コンテンツについて）</h2>
              <p>
                ユーザーが投稿したコンテンツの著作権は投稿者に帰属します。ただし、投稿することにより、
                運営者はそのコンテンツをサービス運営・改善目的で無償かつ非独占的に利用できるものとします。
              </p>
              <p className="mt-2">
                投稿内容が法令・本規約に違反すると判断される場合、運営者は予告なくその投稿を削除する権限を有します。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第5条（投稿の削除について）</h2>
              <p>以下のいずれかに該当する投稿は、運営者の判断により削除することがあります。</p>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2 text-slate-600">
                <li>本規約の禁止事項に違反する投稿</li>
                <li>第三者から削除依頼があり、正当な理由があると判断した投稿</li>
                <li>スレッドの趣旨と著しく無関係な投稿</li>
                <li>その他、運営上の理由により削除が必要と判断した投稿</li>
              </ul>
              <p className="mt-2">
                削除に関するご依頼は、<a href="/contact" className="text-amber-600 hover:underline">お問い合わせページ</a>よりお送りください。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第6条（免責事項）</h2>
              <p>
                本サービスに掲載された情報の正確性・完全性・有用性について、運営者は一切の保証を行いません。
                ユーザーが本サービスを通じて得た情報を利用したことにより生じた損害について、運営者は責任を負いかねます。
              </p>
              <p className="mt-2">
                また、ユーザー間のトラブルについては、当事者間で解決するものとし、運営者は関与しません。
              </p>
              <p className="mt-2">
                本サービスは、システムメンテナンスや障害等により予告なく停止することがあります。
                これにより生じた損害について、運営者は責任を負いかねます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第7条（規約の変更について）</h2>
              <p>
                運営者は必要に応じて本規約を変更することがあります。変更後の規約はサイト上に掲載した時点から効力を持ち、
                継続して本サービスを利用することで、ユーザーは変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-2">第8条（準拠法・管轄裁判所）</h2>
              <p>
                本規約は日本法に準拠するものとします。本サービスに関して紛争が生じた場合は、
                運営者所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

          </div>
        </div>
      </main>
  );
}
