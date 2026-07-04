import { supabase } from "./supabase";
import type { Thread, Post, Category, Feedback } from "./types";
import { CATEGORY_ORDER } from "./categories";

type DbPost = {
  id: string;
  thread_id: string;
  content: string;
  author: string;
  likes: number;
  created_at: string;
  is_deleted?: boolean | null;
};

type DbThread = {
  id: string;
  title: string;
  body?: string | null;
  author?: string | null;
  likes?: number | null;
  category: string;
  is_archived?: boolean | null;
  created_at: string;
  posts?: DbPost[];
};

function toPost(p: DbPost): Post {
  const deleted = p.is_deleted ?? false;
  return {
    id: p.id,
    threadId: p.thread_id,
    body: deleted ? "この投稿は削除されました。" : p.content,
    author: p.author ?? "名無しさん",
    likes: p.likes ?? 0,
    createdAt: new Date(p.created_at),
    isDeleted: deleted,
  };
}

function toThread(t: DbThread): Thread {
  return {
    id: t.id,
    title: t.title,
    body: t.body ?? undefined,
    author: t.author ?? "名無しさん",
    likes: t.likes ?? 0,
    category: t.category as Category,
    isArchived: t.is_archived ?? false,
    createdAt: new Date(t.created_at),
    posts: (t.posts ?? [])
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(toPost),
  };
}

export async function getThreads(keyword?: string, sortBy?: string): Promise<Thread[]> {
  let query = supabase
    .from("threads")
    .select("*, posts(*)")
    .order("created_at", { ascending: false });
  if (keyword?.trim()) {
    const kw = keyword.trim();
    query = query.or(`title.ilike.%${kw}%,body.ilike.%${kw}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  let threads = (data ?? []).map(toThread);

  if (sortBy === "activity") {
    threads.sort((a, b) => {
      const latest = (t: Thread) =>
        Math.max(t.createdAt.getTime(), ...t.posts.map((p) => p.createdAt.getTime()));
      return latest(b) - latest(a);
    });
  } else if (sortBy === "replies") {
    threads.sort((a, b) => {
      const count = (t: Thread) => t.posts.length + (t.body ? 1 : 0);
      return count(b) - count(a);
    });
  }

  return threads;
}

export async function getThreadReplyCounts(): Promise<{ id: string; count: number }[]> {
  const { data, error } = await supabase
    .from("threads")
    .select("id, body, posts(id)");
  if (error) return [];
  return (data ?? []).map((t: { id: string; body: string | null; posts?: { id: string }[] }) => ({
    id: t.id,
    count: (t.posts ?? []).length + (t.body ? 1 : 0),
  }));
}

export async function getThread(id: string): Promise<Thread | null> {
  const { data, error } = await supabase
    .from("threads")
    .select("*, posts(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (data?.posts) {
    console.log("[getThread] posts likes:", JSON.stringify(
      (data.posts as DbPost[]).map((p) => ({ id: p.id.slice(0, 8), likes: p.likes }))
    ));
  }
  return toThread(data);
}

export async function createThread(
  title: string,
  category: Category,
  body: string,
  author: string,
  ip?: string
): Promise<Thread> {
  console.log("[createThread] inserting body:", JSON.stringify(body));
  const { data, error } = await supabase
    .from("threads")
    .insert({ title, category, body: body || null, author, ip: ip || null })
    .select()
    .single();

  if (error) {
    console.error("[createThread] INSERT error:", error);
    throw error;
  }
  console.log("[createThread] saved body:", JSON.stringify(data.body));
  return toThread(data);
}

export async function createPost(threadId: string, body: string, author: string, ip?: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .insert({ thread_id: threadId, content: body, author, ip: ip || null })
    .select()
    .single();

  if (error) throw error;
  return toPost(data);
}

export async function likeThread(threadId: string): Promise<void> {
  const { data, error: selectError } = await supabase
    .from("threads")
    .select("likes")
    .eq("id", threadId)
    .single();

  if (selectError) throw selectError;

  const newLikes = (data?.likes ?? 0) + 1;
  const { error: updateError, count } = await supabase
    .from("threads")
    .update({ likes: newLikes }, { count: "exact" })
    .eq("id", threadId);

  if (updateError) throw updateError;
  if (count === 0) throw new Error("likeThread: UPDATE affected 0 rows");
}

export async function likePost(postId: string): Promise<void> {
  const { data, error: selectError } = await supabase
    .from("posts")
    .select("likes")
    .eq("id", postId)
    .single();

  if (selectError) {
    console.error("[likePost] SELECT error:", selectError);
    throw selectError;
  }

  const newLikes = (data?.likes ?? 0) + 1;
  const { error: updateError, count } = await supabase
    .from("posts")
    .update({ likes: newLikes }, { count: "exact" })
    .eq("id", postId);

  if (updateError) {
    console.error("[likePost] UPDATE error:", updateError);
    throw updateError;
  }
  console.log("[likePost] UPDATE rows affected:", count, "new likes:", newLikes);
  if (count === 0) {
    throw new Error("UPDATE affected 0 rows — RLS may be blocking anon UPDATE on posts");
  }
}

export async function getStats(): Promise<{
  totalThreads: number;
  totalPosts: number;
  todayPosts: number;
  dailyPosts: { date: string; count: number }[];
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [threadsRes, postsRes, todayRes, recentPostsRes] = await Promise.all([
    supabase.from("threads").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
    supabase.from("posts").select("created_at").gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  const dailyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    dailyMap.set(key, 0);
  }
  (recentPostsRes.data ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  });
  const dailyPosts = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

  return {
    totalThreads: threadsRes.count ?? 0,
    totalPosts: postsRes.count ?? 0,
    todayPosts: todayRes.count ?? 0,
    dailyPosts,
  };
}

// ── Post count analytics ──────────────────────────────────────────────────────

export async function getPostCountByDate(days: number): Promise<{ date: string; count: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("posts")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map.set(`${d.getMonth() + 1}/${d.getDate()}`, 0);
  }
  (data ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  });

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

export async function getPostCountByHour(): Promise<{ date: string; count: number }[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("posts")
    .select("created_at")
    .gte("created_at", today.toISOString());

  const map = new Map<string, number>();
  for (let h = 0; h < 24; h++) map.set(`${h}時`, 0);

  (data ?? []).forEach((p) => {
    const h = new Date(p.created_at).getHours();
    const key = `${h}時`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

export async function getStatsByCategory(
  period: string
): Promise<{ category: Category; threadCount: number; postCount: number }[]> {
  const now = new Date();
  let since: string | null = null;
  let until: string | null = null;

  if (period === "this_month") {
    since = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  } else if (period === "last_month") {
    since = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    until = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  } else if (period === "last_7_days") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    since = d.toISOString();
  }

  let tQuery = supabase.from("threads").select("category");
  if (since) tQuery = tQuery.gte("created_at", since);
  if (until) tQuery = tQuery.lt("created_at", until);

  let pQuery = supabase.from("posts").select("threads(category)");
  if (since) pQuery = pQuery.gte("created_at", since);
  if (until) pQuery = pQuery.lt("created_at", until);

  const [tRes, pRes] = await Promise.all([tQuery, pQuery]);

  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    threadCount: (tRes.data ?? []).filter((t) => t.category === cat).length,
    postCount: (pRes.data ?? []).filter(
      (p) => (p.threads as { category?: string } | null)?.category === cat
    ).length,
  }));
}

// ── IP block ─────────────────────────────────────────────────────────────────

export type BlockedIp = {
  id: string;
  ip: string;
  reason?: string;
  createdAt: string;
};

export async function getBlockedIps(): Promise<BlockedIp[]> {
  const { data, error } = await supabase
    .from("blocked_ips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    ip: r.ip,
    reason: r.reason ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function blockIp(ip: string, reason?: string): Promise<string> {
  const { data, error } = await supabase
    .from("blocked_ips")
    .insert({ ip, reason: reason || null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function unblockIp(id: string): Promise<void> {
  const { error } = await supabase.from("blocked_ips").delete().eq("id", id);
  if (error) throw error;
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return false;
  const { data, error } = await supabase
    .from("blocked_ips")
    .select("id")
    .eq("ip", ip)
    .limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
}

// ── Likes / rankings ─────────────────────────────────────────────────────────

export async function getTotalLikes(): Promise<{ threadLikes: number; postLikes: number }> {
  const [tRes, pRes] = await Promise.all([
    supabase.from("threads").select("likes"),
    supabase.from("posts").select("likes"),
  ]);
  const threadLikes = (tRes.data ?? []).reduce((sum, t) => sum + (t.likes ?? 0), 0);
  const postLikes = (pRes.data ?? []).reduce((sum, p) => sum + (p.likes ?? 0), 0);
  return { threadLikes, postLikes };
}


// ── Feedbacks ─────────────────────────────────────────────────────────────────

export async function getFeedbacks(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((f) => ({
    id: f.id,
    name: f.name ?? "名無しさん",
    type: f.type ?? "general",
    content: f.content ?? "",
    targetUrl: f.target_url ?? undefined,
    postNumber: f.post_number ?? undefined,
    deleteReason: f.delete_reason ?? undefined,
    status: f.status ?? "pending",
    createdAt: f.created_at,
  }));
}

export async function updateFeedbackStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("feedbacks").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error, count } = await supabase
    .from("feedbacks")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  if (count === 0) throw new Error("RLS_BLOCKED");
}

export async function createFeedback(
  name: string,
  type: string,
  content: string,
  targetUrl?: string,
  postNumber?: string,
  deleteReason?: string,
): Promise<void> {
  const { error } = await supabase.from("feedbacks").insert({
    name,
    type,
    content: content || null,
    target_url: targetUrl || null,
    post_number: postNumber || null,
    delete_reason: deleteReason || null,
  });
  if (error) throw error;
}

// ── NG Words ──────────────────────────────────────────────────────────────────

export type NgWord = { id: string; word: string; createdAt: string };

export async function getNgWords(): Promise<NgWord[]> {
  const { data, error } = await supabase
    .from("ng_words")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((w) => ({ id: w.id, word: w.word, createdAt: w.created_at }));
}

export async function addNgWord(word: string): Promise<void> {
  const { error } = await supabase.from("ng_words").insert({ word });
  if (error) throw error;
}

export async function deleteNgWord(id: string): Promise<void> {
  const { error } = await supabase.from("ng_words").delete().eq("id", id);
  if (error) throw error;
}

// ── Admin: delete / restore ───────────────────────────────────────────────────

export async function deleteThread(id: string): Promise<void> {
  const { error: postsError } = await supabase.from("posts").delete().eq("thread_id", id);
  if (postsError) throw postsError;
  const { error } = await supabase.from("threads").delete().eq("id", id);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").update({ is_deleted: true }).eq("id", id);
  if (error) throw error;
}

export async function restorePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").update({ is_deleted: false }).eq("id", id);
  if (error) throw error;
}

// ── Admin: list ───────────────────────────────────────────────────────────────

export type AdminThread = { id: string; title: string; category: Category; createdAt: string; ip?: string };
export type AdminPost = {
  id: string;
  content: string;
  author: string;
  threadId: string;
  threadTitle: string;
  threadCategory: Category;
  createdAt: string;
  postNumber: number;
  isDeleted: boolean;
  ip?: string;
};

export async function getAdminThreads(): Promise<AdminThread[]> {
  const { data, error } = await supabase
    .from("threads")
    .select("id, title, category, created_at, ip")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category as Category,
    createdAt: t.created_at,
    ip: t.ip ?? undefined,
  }));
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, content, author, thread_id, created_at, is_deleted, ip, threads(title, category)");
  if (error) throw error;

  const posts = [...(data ?? [])];

  posts.sort((a, b) => {
    if (a.thread_id !== b.thread_id) return a.thread_id.localeCompare(b.thread_id);
    return a.created_at.localeCompare(b.created_at);
  });

  const threadCounters = new Map<string, number>();
  const withNumbers = posts.map((p) => {
    const prev = threadCounters.get(p.thread_id) ?? 1;
    const postNumber = prev + 1;
    threadCounters.set(p.thread_id, postNumber);
    return { ...p, postNumber };
  });

  withNumbers.sort((a, b) => b.created_at.localeCompare(a.created_at));

  type ThreadInfo = { title?: string; category?: string } | null;
  return withNumbers.map((p) => {
    const t = p.threads as ThreadInfo;
    return {
      id: p.id,
      content: p.content,
      author: p.author ?? "名無しさん",
      threadId: p.thread_id,
      threadTitle: t?.title ?? "",
      threadCategory: (t?.category ?? "chat") as Category,
      createdAt: p.created_at,
      postNumber: p.postNumber,
      isDeleted: p.is_deleted ?? false,
      ip: p.ip ?? undefined,
    };
  });
}
