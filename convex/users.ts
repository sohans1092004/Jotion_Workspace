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

export const getUsersByIds = action({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY not configured");
    }

    // Fetch all users in parallel
    const userPromises = args.userIds.map(async (userId) => {
      const url = `https://api.clerk.com/v1/users/${userId}`;
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          return {
            id: userId,
            name: "Anonymous",
            email: "",
            avatar: "",
          };
        }

        const data = await response.json();
        
        // Debug log to see what Clerk returns
        console.log("Clerk user data:", {
          userId,
          firstName: data.first_name,
          lastName: data.last_name,
          username: data.username,
          emailAddresses: data.email_addresses,
          imageUrl: data.image_url
        });
        
        return {
          id: userId,
          name: data.first_name && data.last_name 
            ? `${data.first_name} ${data.last_name}`
            : data.first_name || data.last_name || data.username || "Anonymous",
          email: data.email_addresses?.[0]?.email_address || "",
          avatar: data.image_url || "",
        };
      } catch (error) {
        return {
          id: userId,
          name: "Anonymous",
          email: "",
          avatar: "",
        };
      }
    });

    return await Promise.all(userPromises);
  },
});
