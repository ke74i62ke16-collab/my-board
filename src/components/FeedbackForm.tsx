"use client";

import { useState } from "react";
import { createFeedbackAction } from "@/lib/actions";

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent";

const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1";

export default function FeedbackForm() {
  const [type, setType] = useState("");

  return (
    <form action={createFeedbackAction} className="space-y-4">
      {/* 名前 */}
      <input
        type="text"
        name="name"
        placeholder="名前（任意）"
        maxLength={20}
        className={INPUT_CLASS}
      />

      {/* お問い合わせ種別 */}
      <div>
        <label className={LABEL_CLASS}>
          お問い合わせ種別 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className={`${INPUT_CLASS} appearance-none pr-9 bg-white`}
          >
            <option value="" disabled hidden>お問い合わせ種別を選択してください</option>
            <option value="general">サイトへのご意見・改善要望</option>
            <option value="delete_request">投稿の削除依頼</option>
            <option value="other">その他</option>
          </select>
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-xs">
            ▼
          </span>
        </div>
      </div>

      {/* 削除依頼の追加フィールド */}
      {type === "delete_request" && (
        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700 font-medium">
            削除依頼の詳細情報を入力してください
          </p>

          <div>
            <label className={LABEL_CLASS}>
              該当スレッドのURLまたはタイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="targetUrl"
              placeholder="スレッドのURLかタイトルを入力"
              required
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>
              投稿番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="postNumber"
              placeholder="例：5"
              required
              className={`${INPUT_CLASS} max-w-xs`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>
              削除理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="deleteReason"
              placeholder="削除を希望する理由をご記入ください"
              required
              rows={4}
              maxLength={1000}
              className={`${INPUT_CLASS} resize-none leading-relaxed`}
            />
          </div>
        </div>
      )}

      {/* 本文 */}
      <div>
        {type === "general" && (
          <label className={LABEL_CLASS}>
            ご意見・要望内容 <span className="text-red-500">*</span>
          </label>
        )}
        {type === "other" && (
          <label className={LABEL_CLASS}>
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
        )}
        {type === "delete_request" && (
          <label className={LABEL_CLASS}>その他のコメント（任意）</label>
        )}
        <textarea
          name="content"
          placeholder={
            type === "general"
              ? "ご意見・要望を入力してください"
              : type === "other"
              ? "お問い合わせ内容を入力してください"
              : "本文"
          }
          required={type === "general" || type === "other"}
          rows={6}
          maxLength={2000}
          className={`${INPUT_CLASS} resize-none leading-relaxed`}
        />
      </div>

      <button
        type="submit"
        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
      >
        送信する
      </button>
    </form>
  );
}
