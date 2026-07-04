"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import {
  createThread, createPost, likePost, likeThread, createFeedback,
  getNgWords, addNgWord, deleteNgWord, deleteThread, deletePost,
  updateFeedbackStatus, restorePost, deleteFeedback,
  getPostCountByDate, getPostCountByHour, getStatsByCategory,
  getTotalLikes,
  isIpBlocked, blockIp, unblockIp,
  getThreadReplyCounts,
} from "./store";
import type { Category } from "./types";
import { checkRateLimit } from "./rateLimit";

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

async function hasNgWord(text: string): Promise<boolean> {
  try {
    const words = await getNgWords();
    const lower = text.toLowerCase();
    return words.some((w) => lower.includes(w.word.toLowerCase()));
  } catch {
    return false;
  }
}

export async function createThreadAction(formData: FormData) {
  const ip = await getClientIp();
  if (!checkRateLimit(ip)) redirect("/?error=rate_limit");
  if (await isIpBlocked(ip)) redirect("/?error=ip_blocked");

  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim() ?? "";
  const category = formData.get("category") as Category;
  const author = ((formData.get("author") as string)?.trim()) || "名無しさん";
  if (!title || !category) return;
  if (title.length > 50 || body.length > 1000 || author.length > 20) return;

  if (await hasNgWord(`${title} ${body}`)) redirect("/?error=ng_word");

  let thread;
  try {
    thread = await createThread(title, category, body, author, ip);
  } catch (err) {
    console.error("[createThreadAction]", err);
    redirect("/?error=create");
  }
  redirect(`/threads/${thread.id}`);
}

export async function createPostAction(formData: FormData): Promise<{ error: string } | void> {
  const ip = await getClientIp();
  if (!checkRateLimit(ip)) return { error: "投稿が多すぎます。60秒後に再度お試しください" };
  if (await isIpBlocked(ip)) return { error: "このIPアドレスからの投稿は制限されています。" };

  const threadId = formData.get("threadId") as string;
  const body = (formData.get("body") as string)?.trim();
  const author = ((formData.get("author") as string)?.trim()) || "名無しさん";
  if (!threadId || !body) return { error: "本文を入力してください" };
  if (body.length > 1000) return { error: "本文は1000文字以内で入力してください" };
  if (author.length > 20) return { error: "名前は20文字以内で入力してください" };

  if (await hasNgWord(body)) return { error: "NGワードが含まれているため投稿できません" };

  try {
    await createPost(threadId, body, author, ip);
  } catch (err) {
    console.error("[createPostAction]", err);
    return { error: "投稿に失敗しました。再度お試しください" };
  }
}

export async function likePostAction(postId: string): Promise<void> {
  await likePost(postId);
}

export async function likeThreadAction(threadId: string): Promise<void> {
  await likeThread(threadId);
}

export async function createFeedbackAction(formData: FormData) {
  const name = ((formData.get("name") as string)?.trim()) || "名無しさん";
  const type = ((formData.get("type") as string)?.trim()) || "general";
  const content = (formData.get("content") as string)?.trim() ?? "";
  const targetUrl = (formData.get("targetUrl") as string)?.trim() || undefined;
  const postNumber = (formData.get("postNumber") as string)?.trim() || undefined;
  const deleteReason = (formData.get("deleteReason") as string)?.trim() || undefined;

  if (name.length > 20) return;
  if ((type === "general" || type === "other") && (!content || content.length > 2000)) return;
  if (type === "delete_request" && !deleteReason) return;
  if (content.length > 2000) return;

  await createFeedback(name, type, content, targetUrl, postNumber, deleteReason);
  redirect("/contact?sent=1");
}

export async function adminLoginAction(formData: FormData) {
  const password = (formData.get("password") as string)?.trim();
  if (password && password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "1", { httpOnly: true, path: "/" });
    redirect("/mgmt-p8x2k");
  }
  redirect("/mgmt-p8x2k?error=1");
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/mgmt-p8x2k");
}

export async function addNgWordAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const word = (formData.get("word") as string)?.trim().toLowerCase();
  if (!word) return;
  try {
    await addNgWord(word);
  } catch (err) {
    console.error("[addNgWordAction]", err);
  }
  redirect("/mgmt-p8x2k?section=ngwords");
}

export async function deleteNgWordAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteNgWord(id);
  redirect("/mgmt-p8x2k?section=ngwords");
}

export async function deleteThreadAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteThread(id);
  redirect("/mgmt-p8x2k?section=threads");
}

export async function deleteThreadDirectAction(id: string): Promise<{ ok: true } | { error: string }> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return { error: "認証エラー" };
  if (!id) return { error: "IDが見つかりません" };
  try {
    await deleteThread(id);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "削除に失敗しました" };
  }
}

export async function deletePostAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const id = formData.get("id") as string;
  if (!id) return;
  await deletePost(id);
  redirect("/mgmt-p8x2k?section=posts");
}

export async function updateFeedbackStatusAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const validStatuses = ["pending", "in_progress", "resolved"];
  if (!id || !validStatuses.includes(status)) return;
  await updateFeedbackStatus(id, status);
  redirect("/mgmt-p8x2k?section=feedbacks");
}

export async function updateFeedbackStatusDirectAction(id: string, status: string): Promise<void> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const validStatuses = ["pending", "in_progress", "resolved"];
  if (!id || !validStatuses.includes(status)) return;
  await updateFeedbackStatus(id, status);
}

export async function restorePostAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const id = formData.get("id") as string;
  if (!id) return;
  await restorePost(id);
  redirect("/mgmt-p8x2k?section=posts");
}

export async function deleteFeedbackAction(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return;
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteFeedback(id);
  redirect("/mgmt-p8x2k?section=feedbacks");
}

export async function fetchPostTrendAction(
  period: "today" | "7days" | "30days"
): Promise<{ date: string; count: number }[]> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return [];
  if (period === "today") return getPostCountByHour();
  if (period === "30days") return getPostCountByDate(30);
  return getPostCountByDate(7);
}

export async function fetchStatsByCategoryAction(
  period: string
): Promise<{ category: string; threadCount: number; postCount: number }[]> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return [];
  return getStatsByCategory(period);
}

export async function deleteFeedbackDirectAction(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return { error: "認証エラー" };
  if (!id) return { error: "IDが指定されていません" };
  try {
    await deleteFeedback(id);
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[deleteFeedbackDirectAction]", msg);
    return { error: msg };
  }
}

export async function fetchTotalLikesAction(): Promise<{ threadLikes: number; postLikes: number }> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return { threadLikes: 0, postLikes: 0 };
  return getTotalLikes();
}


export async function blockIpDirectAction(
  ip: string,
  reason?: string
): Promise<{ id?: string; error?: string }> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return { error: "認証エラー" };
  if (!ip.trim()) return { error: "IPアドレスを入力してください" };
  try {
    const id = await blockIp(ip.trim(), reason?.trim() || undefined);
    return { id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[blockIpDirectAction]", msg);
    const isDuplicate = msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505");
    return { error: isDuplicate ? "そのIPアドレスは既にブロック済みです" : `追加に失敗しました: ${msg}` };
  }
}

export async function unblockIpDirectAction(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") return { error: "認証エラー" };
  if (!id) return { error: "IDが指定されていません" };
  try {
    await unblockIp(id);
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[unblockIpDirectAction]", msg);
    return { error: msg };
  }
}

export async function getThreadsAction(): Promise<{ id: string; count: number }[]> {
  return getThreadReplyCounts();
}
