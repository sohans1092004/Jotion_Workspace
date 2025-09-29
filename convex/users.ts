import { v } from "convex/values";
import { action } from "./_generated/server";

export const getUserIdByEmail = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY not configured");
    }

    const url = `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(args.email)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("No user found with that email");
    }

    return data[0].id as string;
  },
});
