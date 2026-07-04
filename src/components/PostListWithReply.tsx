"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPostAction, likePostAction, likeThreadAction } from "@/lib/actions";
import { CATEGORY_CONFIG } from "@/lib/categories";
import type { Post, Category } from "@/lib/types";

type Props = {
  posts: Post[];
  allPosts: Post[];
  postOffset: number;
  page: number;
  totalPages: number;
  showAll: boolean;
  threadId: string;
  threadTitle: string;
  threadCategory: Category;
  threadBody?: string;
  threadLikes: number;
  threadCreatedAt: string;
  isFull: boolean;
};

type Tip = { postNumber: number; content: string; x: number; y: number };

const ANCHOR_BADGE_CLASS =
  "inline-block font-mono text-sm font-semibold text-gray-600 " +
  "bg-gray-100 border border-gray-300 rounded " +
  "px-1.5 py-0.5 cursor-pointer hover:bg-gray-200 transition-colors";

const REPLY_BTN_CLASS =
  "text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded " +
  "px-1.5 py-0.5 hover:bg-gray-200 transition-colors -translate-x-1";

const ThumbsUpIcon = ({ filled }: { filled: boolean }) =>
  filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.18c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
    </svg>
  );

// Image URL detection
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|webp)([?#]|$)/i;
const IMAGE_HOST_RE = /^https?:\/\/(i\.gyazo\.com|gyazo\.com|i\.imgur\.com|imgur\.com)\//i;

function isImageUrl(url: string): boolean {
  return IMAGE_EXT_RE.test(url) || IMAGE_HOST_RE.test(url);
}

function extractImageUrls(body: string): string[] {
  const urls = body.match(/https?:\/\/[^\s]+/g) ?? [];
  return [...new Set(urls.filter(isImageUrl))];
}

// Renders post body: >>N badges, clickable non-image URLs, plain text.
// Image URLs are skipped here and rendered as ImagePreview below the body.
function parsePostBody(
  body: string,
  onHover: (n: number, el: HTMLElement) => void,
  onLeave: () => void,
  onLinkClick: (url: string) => void
) {
  const segments = body.split(/(>>\d+)/g);
  const nodes: React.ReactNode[] = [];

  segments.forEach((seg, si) => {
    const anchorMatch = seg.match(/^>>(\d+)$/);
    if (anchorMatch) {
      const n = parseInt(anchorMatch[1], 10);
      nodes.push(
        <span
          key={`a-${si}`}
          className={ANCHOR_BADGE_CLASS}
          onMouseEnter={(e) => onHover(n, e.currentTarget)}
          onMouseLeave={onLeave}
          onTouchStart={(e) => { e.preventDefault(); onHover(n, e.currentTarget); }}
        >
          {seg}
        </span>
      );
      return;
    }
    // Split text segment on URLs
    const urlParts = seg.split(/(https?:\/\/[^\s]+)/g);
    urlParts.forEach((part, pi) => {
      if (/^https?:\/\//.test(part)) {
        if (!isImageUrl(part)) {
          // Non-image URL → warning modal before navigating
          nodes.push(
            <button
              key={`u-${si}-${pi}`}
              type="button"
              onClick={() => onLinkClick(part)}
              className="text-blue-600 hover:underline break-all text-left"
            >
              {part}
            </button>
          );
        }
        // Image URLs: skip here — rendered as ImagePreview below
      } else {
        nodes.push(<span key={`t-${si}-${pi}`}>{part}</span>);
      }
    });
  });

  return nodes;
}

function LinkWarningModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-900 mb-1">外部サイトへ移動します</h3>
        <p className="text-xs text-gray-500 mb-2">以下のURLに移動しようとしています：</p>
        <p className="text-xs text-blue-600 break-all mb-5 bg-gray-50 rounded px-3 py-2">{url}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            移動する
          </a>
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ url, onOpen }: { url: string; onOpen: (url: string) => void }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2 mb-1 break-all"
      >
        🔗 画像を開く
      </a>
    );
  }
  return (
    <button type="button" onClick={() => onOpen(url)} className="block mt-2 mb-1 text-left">
      <img
        src={url}
        alt=""
        className="w-20 h-20 rounded border border-gray-200 object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </button>
  );
}

function ImageModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-md text-sm font-bold"
        >
          ✕
        </button>
        <img
          src={url}
          alt=""
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-xl"
        />
      </div>
    </div>
  );
}

export default function PostListWithReply({
  posts,
  allPosts,
  postOffset,
  page,
  totalPages,
  showAll,
  threadId,
  threadTitle,
  threadCategory,
  threadBody,
  threadLikes,
  threadCreatedAt,
  isFull,
}: Props) {
  const router = useRouter();
  const config = CATEGORY_CONFIG[threadCategory];

  const [inlineReplyTo, setInlineReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [likesMap, setLikesMap] = useState<Record<string, number>>(
    Object.fromEntries(posts.map((p) => [p.id, p.likes]))
  );
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [threadLikesCount, setThreadLikesCount] = useState(threadLikes);
  const [threadLiked, setThreadLiked] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [refreshSpinning, setRefreshSpinning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerNewCount, setBannerNewCount] = useState(0);
  const [bannerFirstPostNum, setBannerFirstPostNum] = useState(0);

  // Tooltip stack: each entry is one tooltip level (depth 0 = outermost)
  const [tipStack, setTipStack] = useState<Tip[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAllPostsRef = useRef(allPosts);
  const isExpectingRefreshRef = useRef(false);
  const countBeforeRefreshRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check for unread replies vs localStorage baseline.
  // Show banner if new replies exist; otherwise mark as read immediately.
  useEffect(() => {
    const total = allPosts.length + (threadBody ? 1 : 0);
    try {
      const stored = localStorage.getItem(`threadBaseline_${threadId}`);
      if (stored !== null) {
        const baseline = parseInt(stored, 10);
        const diff = total - baseline;
        if (diff > 0) {
          setBannerNewCount(diff);
          setBannerFirstPostNum(baseline + 1);
          setShowBanner(true);
          return; // mark as read deferred to banner dismiss
        }
      }
    } catch { /* ignore */ }
    try {
      localStorage.setItem(`threadBaseline_${threadId}`, String(total));
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissBanner = (scroll: boolean) => {
    if (bannerAutoTimerRef.current) { clearTimeout(bannerAutoTimerRef.current); bannerAutoTimerRef.current = null; }
    if (bannerFadeTimerRef.current) clearTimeout(bannerFadeTimerRef.current);
    setBannerVisible(false);
    const total = allPosts.length + (threadBody ? 1 : 0);
    try { localStorage.setItem(`threadBaseline_${threadId}`, String(total)); } catch { /* ignore */ }
    if (scroll && bannerFirstPostNum > 0) {
      setTimeout(() => {
        document.getElementById(`post-${bannerFirstPostNum}`)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
    bannerFadeTimerRef.current = setTimeout(() => setShowBanner(false), 500);
  };

  // Fade in on mount, auto-dismiss after 10 seconds
  useEffect(() => {
    if (!showBanner) return;
    const fadeInTimer = setTimeout(() => setBannerVisible(true), 50);
    bannerAutoTimerRef.current = setTimeout(() => {
      setBannerVisible(false);
      const total = allPosts.length + (threadBody ? 1 : 0);
      try { localStorage.setItem(`threadBaseline_${threadId}`, String(total)); } catch { /* ignore */ }
      bannerFadeTimerRef.current = setTimeout(() => setShowBanner(false), 500);
    }, 10000);
    return () => {
      clearTimeout(fadeInTimer);
      if (bannerAutoTimerRef.current) { clearTimeout(bannerAutoTimerRef.current); bannerAutoTimerRef.current = null; }
      if (bannerFadeTimerRef.current) { clearTimeout(bannerFadeTimerRef.current); bannerFadeTimerRef.current = null; }
    };
  }, [showBanner]); // eslint-disable-line react-hooks/exhaustive-deps

  const replyRefs = useMemo(() => {
    const map: Record<number, number[]> = {};
    allPosts.forEach((post, index) => {
      const postNum = index + 2;
      const matches = [...post.body.matchAll(/>>(\d+)/g)];
      matches.forEach((m) => {
        const refNum = parseInt(m[1], 10);
        if (!map[refNum]) map[refNum] = [];
        if (!map[refNum].includes(postNum)) map[refNum].push(postNum);
      });
    });
    return map;
  }, [allPosts]);

  const calcPos = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const W = 300, H = 130;
    let x = rect.right + 2;
    let y = rect.top;
    if (x + W > window.innerWidth - 8) x = rect.left - W - 2;
    if (x < 8) x = 8;
    if (y + H > window.innerHeight - 8) y = window.innerHeight - H - 8;
    if (y < 8) y = 8;
    return { x, y };
  }, []);

  // ── Tooltip controls ──────────────────────────────────────────────────
  const cancelHide = useCallback(() => {
    if (hideRef.current) { clearTimeout(hideRef.current); hideRef.current = null; }
  }, []);

  const startHide = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => {
      setTipStack([]);
      hideRef.current = null;
    }, 400);
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const handleRefresh = useCallback(() => {
    countBeforeRefreshRef.current = allPosts.length;
    isExpectingRefreshRef.current = true;
    setRefreshSpinning(true);
    router.refresh();
  }, [allPosts.length, router]);

  useEffect(() => {
    if (prevAllPostsRef.current !== allPosts) {
      prevAllPostsRef.current = allPosts;
      if (isExpectingRefreshRef.current) {
        isExpectingRefreshRef.current = false;
        setRefreshSpinning(false);
        const newCount = allPosts.length - countBeforeRefreshRef.current;
        if (newCount > 0) {
          showToast(`+${newCount}件の新着レスがあります`);
          const firstNewPostNumber = countBeforeRefreshRef.current + 2;
          setTimeout(() => {
            document.getElementById(`post-${firstNewPostNumber}`)?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          showToast("新着はありません");
        }
      }
    }
  }, [allPosts, showToast]);

  // Push a tooltip at `depth`, replacing anything at depth or deeper
  const pushTip = useCallback((n: number, el: HTMLElement, depth: number) => {
    cancelHide();
    const content = n === 1 ? threadBody : allPosts[n - 2]?.body;
    if (!content) return;
    const { x, y } = calcPos(el);
    setTipStack(prev => [...prev.slice(0, depth), { postNumber: n, content, x, y }]);
  }, [posts, threadBody, cancelHide, calcPos]);

  // ── Post interaction handlers ─────────────────────────────────────────

  const handleLike = async (postId: string) => {
    if (likedPosts.has(postId)) return;
    setLikedPosts((prev) => new Set([...prev, postId]));
    setLikesMap((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
    try {
      await likePostAction(postId);
    } catch {
      setLikedPosts((prev) => { const next = new Set(prev); next.delete(postId); return next; });
      setLikesMap((prev) => ({ ...prev, [postId]: (prev[postId] ?? 1) - 1 }));
    }
  };

  const handleThreadLike = async () => {
    if (threadLiked) return;
    setThreadLiked(true);
    setThreadLikesCount((prev) => prev + 1);
    try {
      await likeThreadAction(threadId);
    } catch {
      setThreadLiked(false);
      setThreadLikesCount((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const body = textarea.value.trim();
    if (!body) return;
    const trimmedAuthor = authorName.trim();
    if (trimmedAuthor.length > 20) {
      setSubmitError("名前は20文字以内で入力してください");
      return;
    }
    if (body.length > 1000) {
      setSubmitError("本文は1000文字以内で入力してください");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const formData = new FormData();
    formData.set("threadId", threadId);
    formData.set("body", body);
    formData.set("author", trimmedAuthor || "名無しさん");
    try {
      const result = await createPostAction(formData);
      if (result && "error" in result) {
        setSubmitError(result.error);
        return;
      }
      textarea.value = "";
      router.refresh();
    } catch {
      setSubmitError("投稿に失敗しました。再度お試しください");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineSubmit = async (e: React.FormEvent<HTMLFormElement>, targetNumber: number) => {
    e.preventDefault();
    if (submitting) return;
    const textarea = inlineTextareaRef.current;
    if (!textarea) return;
    const body = textarea.value.trim();
    if (!body) return;
    const trimmedAuthor = authorName.trim();
    if (trimmedAuthor.length > 20) {
      setSubmitError("名前は20文字以内で入力してください");
      return;
    }
    if (body.length > 1000) {
      setSubmitError("本文は1000文字以内で入力してください");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const formData = new FormData();
    formData.set("threadId", threadId);
    formData.set("body", `>>${targetNumber}\n${body}`);
    formData.set("author", trimmedAuthor || "名無しさん");
    try {
      const result = await createPostAction(formData);
      if (result && "error" in result) {
        setSubmitError(result.error);
        return;
      }
      textarea.value = "";
      setInlineReplyTo(null);
      router.refresh();
    } catch {
      setSubmitError("投稿に失敗しました。再度お試しください");
    } finally {
      setSubmitting(false);
    }
  };

  // Reply reference badges in number row
  const ReplyRefBadges = ({ postNumber }: { postNumber: number }) => {
    const refs = replyRefs[postNumber];
    if (!refs || refs.length === 0) return null;
    return (
      <>
        {refs.map((refNum) => (
          <span
            key={refNum}
            className={ANCHOR_BADGE_CLASS}
            onMouseEnter={(e) => pushTip(refNum, e.currentTarget, 0)}
            onMouseLeave={startHide}
            onTouchStart={(e) => { e.preventDefault(); pushTip(refNum, e.currentTarget, 0); }}
          >
            &gt;&gt;{refNum}
          </span>
        ))}
      </>
    );
  };

  const totalCount = allPosts.length + (threadBody ? 1 : 0);
  const remaining = 100 - totalCount;
  const isAlmostFull = totalCount >= 90 && !isFull;

  // Inline reply form rendered directly below a post
  const InlineReplyForm = ({ targetNumber }: { targetNumber: number }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">
          <span className="font-mono font-semibold text-amber-600">&gt;&gt;{targetNumber}</span> への返信
        </span>
        <button
          type="button"
          onClick={() => { setInlineReplyTo(null); setSubmitError(null); }}
          className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      </div>
      <form onSubmit={(e) => handleInlineSubmit(e, targetNumber)} className="space-y-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="名無しさん"
          maxLength={20}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700"
        />
        <div className="space-y-1">
          <textarea
            ref={inlineTextareaRef}
            autoFocus
            placeholder="返信を入力..."
            required
            rows={3}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700 resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-400 pl-1">
            画像を投稿したい場合は Gyazo や Imgur の URL を本文に貼り付けてください
          </p>
        </div>
        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? "投稿中..." : "返信する"}
          </button>
          <button
            type="button"
            onClick={() => { setInlineReplyTo(null); setSubmitError(null); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Dedicated refresh button for thread pages (FloatingRefreshButton hides here) */}
      <button
        type="button"
        onClick={handleRefresh}
        aria-label="スレッドを更新"
        className="fixed right-0 top-[40%] -translate-y-1/2 z-50 bg-slate-800/85 hover:bg-slate-900 text-white w-10 h-12 rounded-l-xl shadow-lg flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-700 ${refreshSpinning ? "rotate-[360deg]" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
          {toast}
        </div>
      )}

      {modalUrl && <ImageModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      {pendingUrl && <LinkWarningModal url={pendingUrl} onClose={() => setPendingUrl(null)} />}

      {/* ── Tooltip stack ── */}
      {tipStack.map((frame, depth) => {
        const tipAuthor =
          frame.postNumber === 1
            ? "名無しさん"
            : allPosts[frame.postNumber - 2]?.author ?? "名無しさん";
        return (
          <div
            key={depth}
            className="fixed bg-gray-100 border border-gray-200 rounded-lg shadow-lg p-3"
            style={{ left: frame.x, top: frame.y, maxWidth: 300, zIndex: 50 + depth }}
            onMouseEnter={cancelHide}
            onMouseLeave={startHide}
          >
            <p className="text-xs font-semibold text-gray-400 mb-1">
              {frame.postNumber}. <span className="text-gray-500 font-medium">{tipAuthor}</span>
            </p>
            <p className="text-base text-gray-700 whitespace-pre-wrap line-clamp-5 leading-relaxed break-all">
              {parsePostBody(
                frame.content,
                (n, el) => pushTip(n, el, depth + 1),
                () => {},
                setPendingUrl
              )}
            </p>
          </div>
        );
      })}

      {/* ── New replies banner (fixed toast, bottom center) ── */}
      {showBanner && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-full shadow-lg w-max max-w-xs transition-opacity duration-500 ${bannerVisible ? "opacity-100" : "opacity-0"}`}
        >
          <button
            type="button"
            onClick={() => dismissBanner(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors whitespace-nowrap"
          >
            <span aria-hidden>▼</span>
            <span>+{bannerNewCount}件の新着レスを見る</span>
          </button>
          <button
            type="button"
            onClick={() => dismissBanner(false)}
            aria-label="閉じる"
            className="text-amber-500 hover:text-amber-700 leading-none transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Thread card: header + post #1 body (visually unified) ── */}
      <div
        {...(threadBody ? { id: "post-1" } : {})}
        className="rounded-xl overflow-hidden border border-slate-200 shadow-sm"
      >
        {/* Header: category badge + reply count + title */}
        <div className={`bg-slate-50 px-5 py-4 sm:py-5${threadBody ? " border-b border-slate-200" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/?category=${threadCategory}`} className={`inline-block px-2.5 py-1 rounded text-sm font-semibold hover:opacity-80 transition-opacity ${config.badgeClass}`}>
              {config.label}
            </Link>
            <span className="text-sm text-slate-500">レス {totalCount}件</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {threadTitle}
          </h1>
          {!threadBody && (
            <p className="text-sm text-slate-400 mt-3">{threadCreatedAt}</p>
          )}
        </div>

        {/* Post #1 body */}
        {threadBody && (
          <div className="bg-white px-4 sm:px-5 pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-base font-semibold text-gray-400">1.</span>
              <span className="text-sm font-medium text-gray-600">名無しさん</span>
              <ReplyRefBadges postNumber={1} />
            </div>
            <hr className="border-gray-100 mb-3" />
            <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed mb-3 break-all">
              {parsePostBody(threadBody, (n, el) => pushTip(n, el, 0), startHide, setPendingUrl)}
            </p>
            {extractImageUrls(threadBody).map((url) => (
              <ImagePreview key={url} url={url} onOpen={setModalUrl} />
            ))}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleThreadLike}
                disabled={threadLiked}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                  threadLiked
                    ? "border-amber-400 bg-amber-50 text-amber-600 cursor-default"
                    : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                }`}
              >
                <ThumbsUpIcon filled={threadLiked} /> {threadLikesCount}
              </button>
              {!isFull && (
                <button
                  onClick={() => setInlineReplyTo(prev => prev === 1 ? null : 1)}
                  className={REPLY_BTN_CLASS}
                >
                  返信する
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">{threadCreatedAt}</p>
            {inlineReplyTo === 1 && <InlineReplyForm targetNumber={1} />}
          </div>
        )}
      </div>

      {/* ── Reply posts (#2+) ── */}
      {allPosts.length === 0 && !threadBody ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-lg">
          まだ投稿がありません
        </div>
      ) : (
        posts.length > 0 && (
          <ul className="space-y-3">
            {posts.map((post, index) => {
              const postNumber = index + postOffset + 2;
              const isLiked = likedPosts.has(post.id);
              const likes = likesMap[post.id] ?? 0;
              return (
                <li key={post.id} id={`post-${postNumber}`}>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-base font-semibold text-gray-400">{postNumber}.</span>
                      <span className="text-sm font-medium text-gray-600">{post.author}</span>
                      <ReplyRefBadges postNumber={postNumber} />
                    </div>
                    <hr className="border-gray-100 mb-3" />
                    {post.isDeleted ? (
                      <p className="text-base text-gray-400 italic py-1">この投稿は削除されました。</p>
                    ) : (
                      <>
                        <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed mb-3 break-all">
                          {parsePostBody(post.body, (n, el) => pushTip(n, el, 0), startHide, setPendingUrl)}
                        </p>
                        {extractImageUrls(post.body).map((url) => (
                          <ImagePreview key={url} url={url} onOpen={setModalUrl} />
                        ))}
                      </>
                    )}
                    {!post.isDeleted && (
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          disabled={isLiked}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                            isLiked
                              ? "border-amber-400 bg-amber-50 text-amber-600 cursor-default"
                              : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <ThumbsUpIcon filled={isLiked} /> {likes}
                        </button>
                        {!isFull && (
                          <button
                            onClick={() => setInlineReplyTo(prev => prev === postNumber ? null : postNumber)}
                            className={REPLY_BTN_CLASS}
                          >
                            返信する
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      {post.createdAt.toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {inlineReplyTo === postNumber && <InlineReplyForm targetNumber={postNumber} />}
                </li>
              );
            })}
          </ul>
        )
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
          {showAll ? (
            <Link
              href={`/threads/${threadId}`}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
            >
              ページ表示に戻る
            </Link>
          ) : (
            <>
              {page > 1 ? (
                <Link
                  href={`/threads/${threadId}?page=${page - 1}`}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
                >
                  前へ
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm text-gray-300 border border-gray-100 rounded-lg cursor-default">
                  前へ
                </span>
              )}
              <span className="text-sm text-gray-500 px-1">{page} / {totalPages}ページ</span>
              {page < totalPages ? (
                <Link
                  href={`/threads/${threadId}?page=${page + 1}`}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
                >
                  次へ
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm text-gray-300 border border-gray-100 rounded-lg cursor-default">
                  次へ
                </span>
              )}
              <span className="w-px h-5 bg-gray-200 mx-1 self-center" />
              <Link
                href={`/threads/${threadId}?all=1`}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                全て表示
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── Reply form or full / almost-full message ── */}
      {isFull ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-lg font-semibold text-gray-600">
            このスレッドは書き込みが終了しました。新しいスレッドを立ててください
          </p>
          <Link href="/" className="inline-block text-base text-amber-600 hover:underline font-medium">
            トップページへ →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
          {isAlmostFull && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              ⚠️ 残り{remaining}レスで書き込めなくなります
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="名無しさん"
              maxLength={20}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700"
            />
            <div className="space-y-1">
              <textarea
                ref={textareaRef}
                name="body"
                placeholder="本文を入力..."
                required
                rows={4}
                maxLength={1000}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-700 resize-none leading-relaxed"
              />
              <p className="text-xs text-gray-400 pl-1">
                画像を投稿したい場合は Gyazo や Imgur の URL を本文に貼り付けてください
              </p>
            </div>
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              {submitting ? "投稿中..." : "投稿する"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
