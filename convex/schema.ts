import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Projects table for portfolio items
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    technologies: v.array(v.string()),
    githubUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    featured: v.boolean(),
    order: v.number(),
  }).index("by_featured", ["featured"]),
  
  // Contact messages table
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  
  // Site settings table
  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
  
  // Project quotes table
  project_quotes: defineTable({
    name: v.string(),
    cost: v.string(),
    features: v.array(v.string()),
    order: v.number(),
  }).index("by_order", ["order"]),
  
  // Homepage labels table
  homepage_labels: defineTable({
    key: v.string(),
    value: v.string(),
    order: v.number(),
  }).index("by_key", ["key"]),
  
  // Stripe data table
  stripe_data: defineTable({
    userId: v.string(),
    stripeCustomerId: v.string(),
    subscriptionId: v.optional(v.string()),
    status: v.string(),
    priceId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    paymentMethod: v.optional(v.object({
      brand: v.string(),
      last4: v.string(),
    })),
  }).index("by_user", ["userId"]).index("by_stripe_customer", ["stripeCustomerId"]),
  
  // Quote intake submissions
  quote_submissions: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    serviceDescription: v.string(),
    projectPackage: v.optional(v.string()),
    createdAt: v.number(),
    read: v.boolean(),
  }).index("by_created_at", ["createdAt"]).index("by_read", ["read"]),
});
