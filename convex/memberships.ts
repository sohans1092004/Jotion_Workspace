import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function assertOwner(ctx: any, documentId: Id<"documents">, userId: string) {
  const doc = await ctx.db.get(documentId);
  if (!doc) throw new Error("Not found");
  if (doc.userId !== userId) throw new Error("Unauthorized");
  return doc;
}

export const listMembers = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    await assertOwner(ctx, args.documentId, userId);

    const members = await ctx.db
      .query("documentMembers")
      .withIndex("by_document", (q: any) => q.eq("documentId", args.documentId))
      .collect();

    return members;
  },
});

export const myRole = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return null;
    if (doc.userId === userId) return "owner" as const;
    const membership = await ctx.db
      .query("documentMembers")
      .withIndex("by_user_document", (q: any) =>
        q.eq("userId", userId).eq("documentId", args.documentId)
      )
      .unique();
    return membership?.role ?? null;
  },
});

export const addMember = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(), // Clerk userId of the invitee
    email: v.string(), // Email of the invitee
    role: v.union(v.literal("viewer"), v.literal("editor")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const requester = identity.subject;

    const doc = await assertOwner(ctx, args.documentId, requester);
    if (args.userId === doc.userId) throw new Error("Cannot invite owner");

    const existing = await ctx.db
      .query("documentMembers")
      .withIndex("by_user_document", (q: any) =>
        q.eq("userId", args.userId).eq("documentId", args.documentId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role, email: args.email });
      return existing._id;
    }

    const id = await ctx.db.insert("documentMembers", {
      documentId: args.documentId,
      userId: args.userId,
      email: args.email,
      role: args.role,
    });
    return id;
  },
});

export const updateMemberRole = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    role: v.union(v.literal("viewer"), v.literal("editor")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const requester = identity.subject;

    await assertOwner(ctx, args.documentId, requester);

    const existing = await ctx.db
      .query("documentMembers")
      .withIndex("by_user_document", (q: any) =>
        q.eq("userId", args.userId).eq("documentId", args.documentId)
      )
      .unique();

    if (!existing) throw new Error("Member not found");

    await ctx.db.patch(existing._id, { role: args.role });
    return existing._id;
  },
});

export const removeMember = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const requester = identity.subject;

    await assertOwner(ctx, args.documentId, requester);

    const existing = await ctx.db
      .query("documentMembers")
      .withIndex("by_user_document", (q: any) =>
        q.eq("userId", args.userId).eq("documentId", args.documentId)
      )
      .unique();

    if (!existing) return null;

    await ctx.db.delete(existing._id);
    return existing._id;
  },
});
