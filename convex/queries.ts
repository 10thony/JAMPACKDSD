import { query } from "./_generated/server";

// Authorized user ID
const AUTHORIZED_USER_ID = "user_2yeq7o5pXddjNeLFDpoz5tTwkWS";

// Get all projects ordered by featured status and order
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.sort((a, b) => {
      // Featured projects first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then by order
      return a.order - b.order;
    });
  },
});

// Check if the current user is authorized to manage projects
export const isAuthorizedUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject === AUTHORIZED_USER_ID;
  },
});

// Get featured projects only
export const getFeaturedProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
  },
});

// Get site settings
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").collect();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  },
});

// Get contact messages (for admin)
export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
  },
});

// Get all project quotes ordered by order
export const getProjectQuotes = query({
  args: {},
  handler: async (ctx) => {
    const quotes = await ctx.db
      .query("project_quotes")
      .withIndex("by_order")
      .collect();
    return quotes.sort((a, b) => a.order - b.order);
  },
});

// Get all homepage labels
export const getHomepageLabels = query({
  args: {},
  handler: async (ctx) => {
    const labels = await ctx.db.query("homepage_labels").collect();
    return labels.reduce((acc, label) => {
      acc[label.key] = label.value;
      return acc;
    }, {} as Record<string, string>);
  },
});