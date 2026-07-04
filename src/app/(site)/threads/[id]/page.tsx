import { notFound } from "next/navigation";
import { getThread } from "@/lib/store";
import PostListWithReply from "@/components/PostListWithReply";
import Breadcrumb from "@/components/Breadcrumb";
import ShareButtons from "@/components/ShareButtons";
import SetActiveCategory from "@/components/SetActiveCategory";
import { CATEGORY_CONFIG } from "@/lib/categories";

const PAGE_SIZE = 20;

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; all?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam, all } = await searchParams;
  const thread = await getThread(id);
  if (!thread) notFound();

  const allPosts = thread.posts;
  const showAll = all === "1";
  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const currentPage = showAll ? 1 : Math.max(1, Math.min(parseInt(pageParam ?? "1", 10) || 1, totalPages));
  const postOffset = showAll ? 0 : (currentPage - 1) * PAGE_SIZE;
  const posts = showAll ? allPosts : allPosts.slice(postOffset, postOffset + PAGE_SIZE);

  const isFull = allPosts.length + (thread.body ? 1 : 0) >= 100;
  const categoryLabel = CATEGORY_CONFIG[thread.category].label;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poketore-bbs.com";
  const pageUrl = `${siteUrl}/threads/${id}`;
  const shareTitle = `${thread.title} | ポケトレ板`;

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8 sm:pt-5 space-y-4">
        <SetActiveCategory category={thread.category} />
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: categoryLabel, href: `/?category=${thread.category}` },
          ]}
          right={<ShareButtons url={pageUrl} title={shareTitle} />}
        />
        <PostListWithReply
          posts={posts}
          allPosts={allPosts}
          postOffset={postOffset}
          page={currentPage}
          totalPages={totalPages}
          showAll={showAll}
          threadId={thread.id}
          threadTitle={thread.title}
          threadCategory={thread.category}
          threadBody={thread.body}
          threadLikes={thread.likes}
          threadCreatedAt={thread.createdAt.toLocaleString("ja-JP")}
          isFull={isFull}
        />
      </main>
  );
}
