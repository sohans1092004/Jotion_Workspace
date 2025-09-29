import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
  .index("by_user", ["userId"])
  .index("by_user_parent", ["userId", "parentDocument"]),
  documentMembers: defineTable({
    documentId: v.id("documents"),
    userId: v.string(),
    email: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
  })
  .index("by_document", ["documentId"]) // list members of a document
  .index("by_user_document", ["userId", "documentId"]) // check membership quickly
});
