export type Category =
  | "pack_opening"
  | "market"
  | "new_cards"
  | "chat"
  | "deck";

export type Post = {
  id: string;
  threadId: string;
  body: string;
  author: string;
  likes: number;
  createdAt: Date;
  isDeleted?: boolean;
};

export type Thread = {
  id: string;
  title: string;
  body?: string;
  author: string;
  likes: number;
  category: Category;
  isArchived: boolean;
  createdAt: Date;
  posts: Post[];
};

export type Feedback = {
  id: string;
  name: string;
  type: string;
  content: string;
  targetUrl?: string;
  postNumber?: string;
  deleteReason?: string;
  status?: string;
  createdAt: string;
};
