import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Authorized user ID
const AUTHORIZED_USER_ID = "user_2yeq7o5pXddjNeLFDpoz5tTwkWS";

// Helper function to check if user is authorized
async function checkAuthorization(ctx: any): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== AUTHORIZED_USER_ID) {
    throw new Error("Unauthorized: Only the authorized user can manage projects");
  }
}

// Add a new project
export const addProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    technologies: v.array(v.string()),
    githubUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    featured: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    return await ctx.db.insert("projects", args);
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    technologies: v.optional(v.array(v.string())),
    githubUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete a project
export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    return await ctx.db.delete(args.id);
  },
});

// Add a contact message
export const addMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update site settings
export const updateSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, { value: args.value });
    } else {
      return await ctx.db.insert("settings", args);
    }
  },
});

// Add a new project quote
export const addProjectQuote = mutation({
  args: {
    name: v.string(),
    cost: v.string(),
    features: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    return await ctx.db.insert("project_quotes", args);
  },
});

// Update a project quote
export const updateProjectQuote = mutation({
  args: {
    id: v.id("project_quotes"),
    name: v.optional(v.string()),
    cost: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete a project quote
export const deleteProjectQuote = mutation({
  args: {
    id: v.id("project_quotes"),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    return await ctx.db.delete(args.id);
  },
});

// Update homepage label
export const updateHomepageLabel = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    const existing = await ctx.db
      .query("homepage_labels")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (existing) {
      return await ctx.db.patch(existing._id, { value: args.value });
    } else {
      return await ctx.db.insert("homepage_labels", { 
        key: args.key, 
        value: args.value,
        order: 0,
      });
    }
  },
});

// Add a quote submission (public - no auth required)
export const addQuoteSubmission = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    serviceDescription: v.string(),
    projectPackage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quote_submissions", {
      ...args,
      createdAt: Date.now(),
      read: false,
    });
  },
});

// Mark a quote submission as read (admin only)
export const markQuoteSubmissionRead = mutation({
  args: {
    id: v.id("quote_submissions"),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    return await ctx.db.patch(args.id, { read: true });
  },
});

// Delete a quote submission (admin only)
export const deleteQuoteSubmission = mutation({
  args: {
    id: v.id("quote_submissions"),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    return await ctx.db.delete(args.id);
  },
});

// Reorder project quotes
export const reorderProjectQuotes = mutation({
  args: {
    quoteIds: v.array(v.id("project_quotes")),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    
    // Update each quote's order based on its position in the array
    const updates = args.quoteIds.map((id, index) => 
      ctx.db.patch(id, { order: index })
    );
    
    await Promise.all(updates);
  },
});

// Update resume data (admin only)
export const updateResumeData = mutation({
  args: {
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    contact: v.optional(v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      portfolio: v.optional(v.string()),
    })),
    experience: v.optional(v.array(v.object({
      company: v.string(),
      title: v.string(),
      dates: v.string(),
      location: v.optional(v.string()),
      description: v.array(v.string()),
    }))),
    skills: v.optional(v.array(v.string())),
    education: v.optional(v.array(v.object({
      degree: v.optional(v.string()),
      institution: v.optional(v.string()),
      dates: v.optional(v.string()),
    }))),
    languages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await checkAuthorization(ctx);
    
    const existing = await ctx.db.query("resume_data").first();
    
    if (existing) {
      // Update existing resume
      return await ctx.db.patch(existing._id, args);
    } else {
      // Create new resume with defaults
      return await ctx.db.insert("resume_data", {
        name: args.name,
        title: args.title,
        contact: args.contact,
        experience: args.experience || [],
        skills: args.skills || [],
        education: args.education || [],
        languages: args.languages || [],
      });
    }
  },
});