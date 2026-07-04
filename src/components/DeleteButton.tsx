"use client";

import { deleteThreadAction, deletePostAction, deleteNgWordAction } from "@/lib/actions";

type Props =
  | { type: "thread"; id: string; label: string }
  | { type: "post"; id: string; label: string }
  | { type: "ngword"; id: string; label: string };

export default function DeleteButton({ type, id, label }: Props) {
  const action =
    type === "thread"
      ? deleteThreadAction
      : type === "post"
      ? deletePostAction
      : deleteNgWordAction;

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`${label}を削除しますか？`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-red-500 hover:text-red-700 text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0"
      >
        削除
      </button>
    </form>
  );
}
