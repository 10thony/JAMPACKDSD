import type { GenericDatabaseReader } from "convex/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAuthorization, isAdminUser } from "./auth";
import type { DataModel, Id } from "./_generated/dataModel";

const MAX_COMMENT_LENGTH = 5000;

type DbReader = GenericDatabaseReader<DataModel>;

async function getPostBySlug(ctx: { db: DbReader }, slug: string) {
  return await ctx.db
    .query("blog_posts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

async function assertSlugAvailable(
  ctx: { db: DbReader },
  slug: string,
  excludeId?: Id<"blog_posts">
) {
  const existing = await getPostBySlug(ctx, slug);
  if (existing && existing._id !== excludeId) {
    throw new Error("A post with this slug already exists");
  }
}

export const listPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blog_posts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
    return posts.map(({ bodyMarkdown: _b, ...rest }) => rest);
  },
});

export const getPublishedPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await getPostBySlug(ctx, slug);
    if (!post || post.status !== "published") {
      return null;
    }
    return post;
  },
});

export const listAllPostsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await checkAuthorization(ctx);
    const posts = await ctx.db.query("blog_posts").collect();
    return posts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getPostForAdmin = query({
  args: { id: v.id("blog_posts") },
  handler: async (ctx, { id }) => {
    await checkAuthorization(ctx);
    return await ctx.db.get(id);
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    bodyMarkdown: v.string(),
    excerpt: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    const slug = args.slug.trim().toLowerCase();
    if (!slug) {
      throw new Error("Slug is required");
    }
    await assertSlugAvailable(ctx, slug);
    const now = Date.now();
    const status = args.status ?? "draft";
    return await ctx.db.insert("blog_posts", {
      title: args.title.trim(),
      slug,
      bodyMarkdown: args.bodyMarkdown,
      excerpt: args.excerpt?.trim() || undefined,
      status,
      publishedAt: status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const importPostFromMarkdown = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    bodyMarkdown: v.string(),
    excerpt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    const slug = args.slug.trim().toLowerCase();
    if (!slug) {
      throw new Error("Slug is required");
    }
    await assertSlugAvailable(ctx, slug);
    const now = Date.now();
    return await ctx.db.insert("blog_posts", {
      title: args.title.trim(),
      slug,
      bodyMarkdown: args.bodyMarkdown,
      excerpt: args.excerpt?.trim() || undefined,
      status: "draft",
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("blog_posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    bodyMarkdown: v.optional(v.string()),
    excerpt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Post not found");
    }
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title.trim();
    if (args.bodyMarkdown !== undefined) updates.bodyMarkdown = args.bodyMarkdown;
    if (args.excerpt !== undefined) {
      updates.excerpt = args.excerpt.trim() || undefined;
    }
    if (args.slug !== undefined) {
      const slug = args.slug.trim().toLowerCase();
      if (!slug) {
        throw new Error("Slug is required");
      }
      await assertSlugAvailable(ctx, slug, args.id);
      updates.slug = slug;
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const deletePost = mutation({
  args: { id: v.id("blog_posts") },
  handler: async (ctx, { id }) => {
    await checkAuthorization(ctx);
    const comments = await ctx.db
      .query("blog_comments")
      .withIndex("by_post", (q) => q.eq("postId", id))
      .collect();
    for (const c of comments) {
      await ctx.db.delete(c._id);
    }
    await ctx.db.delete(id);
  },
});

export const publishPost = mutation({
  args: { id: v.id("blog_posts") },
  handler: async (ctx, { id }) => {
    await checkAuthorization(ctx);
    const now = Date.now();
    await ctx.db.patch(id, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    });
  },
});

export const unpublishPost = mutation({
  args: { id: v.id("blog_posts") },
  handler: async (ctx, { id }) => {
    await checkAuthorization(ctx);
    await ctx.db.patch(id, {
      status: "draft",
      publishedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const listCommentsByPost = query({
  args: { postId: v.id("blog_posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post || post.status !== "published") {
      return [];
    }
    const comments = await ctx.db
      .query("blog_comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    return comments.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("blog_posts"),
    body: v.string(),
  },
  handler: async (ctx, { postId, body }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to comment");
    }
    const post = await ctx.db.get(postId);
    if (!post || post.status !== "published") {
      throw new Error("Post not found or not published");
    }
    const trimmed = body.trim();
    if (!trimmed) {
      throw new Error("Comment cannot be empty");
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment must be at most ${MAX_COMMENT_LENGTH} characters`);
    }
    const authorName =
      identity.name?.trim() ||
      identity.email?.split("@")[0] ||
      "Reader";
    return await ctx.db.insert("blog_comments", {
      postId,
      authorUserId: identity.subject,
      authorName,
      body: trimmed,
      createdAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("blog_comments") },
  handler: async (ctx, { id }) => {
    const comment = await ctx.db.get(id);
    if (!comment) {
      return;
    }
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const admin = await isAdminUser(ctx);
    if (comment.authorUserId !== identity.subject && !admin) {
      throw new Error("You can only delete your own comments");
    }
    await ctx.db.delete(id);
  },
});
