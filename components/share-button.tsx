"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface ShareButtonProps {
  documentId: Id<"documents">;
  ownerId: string;
  disabled?: boolean;
}

export function ShareButton({ documentId, ownerId, disabled }: ShareButtonProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const isOwner = userId === ownerId;
  // Non-owners cannot manage access; don't render the button
  if (!isOwner) return null;
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [error, setError] = useState<string | null>(null);

  const members = useQuery(api.memberships.listMembers, { documentId });
  const addMember = useMutation(api.memberships.addMember);
  const updateRole = useMutation(api.memberships.updateMemberRole);
  const removeMember = useMutation(api.memberships.removeMember);
  const getUserIdByEmail = useAction(api.users.getUserIdByEmail);

  const onInvite = async () => {
    if (!inviteEmail) return;
    setError(null);
    
    // Check if trying to invite self
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (userEmail && inviteEmail.toLowerCase() === userEmail.toLowerCase()) {
      setError("This is the email you're currently logged in with");
      return;
    }
    
    try {
      const userId = await getUserIdByEmail({ email: inviteEmail });
      await addMember({ documentId, userId, email: inviteEmail, role });
      setInviteEmail("");
    } catch (e) {
      console.error(e);
      setError(`The user with email: ${inviteEmail} doesn't exist`);
    }
  };

  const onChangeRole = async (uid: string, next: "viewer" | "editor") => {
    try {
      await updateRole({ documentId, userId: uid, role: next });
    } catch (e) {
      console.error(e);
      alert("Failed to update role: " + (e as Error).message);
    }
  };

  const onRemove = async (uid: string) => {
    try {
      await removeMember({ documentId, userId: uid });
    } catch (e) {
      console.error(e);
      alert("Failed to remove: " + (e as Error).message);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" disabled={disabled}>
          Share
          <Users className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end" alignOffset={8} forceMount>
        <div className="space-y-2">
          {error && (
            <div className="text-xs bg-rose-500 text-white rounded-md px-2 py-1.5">
              {error}
            </div>
          )}
          <div className="flex gap-1.5 items-center">
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="h-8 px-2 rounded-md border bg-background text-xs"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <Button onClick={onInvite} size="sm" className="h-8 text-xs px-3">
              Invite
            </Button>
          </div>

          <div className="pt-1.5">
            <div className="text-xs font-medium mb-1.5">People with access</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {members?.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between border rounded-md px-2 py-1.5"
                >
                  <div className="text-xs min-w-0 flex-1">
                    <div className="font-medium text-xs text-muted-foreground truncate">{m.email || m.userId}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <select
                      value={m.role}
                      onChange={(e) => onChangeRole(m.userId, e.target.value as any)}
                      className="h-7 px-1.5 rounded-md border bg-background text-xs"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove(m.userId)}
                      className="h-7 text-xs px-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {members === undefined && (
                <div className="text-sm text-muted-foreground">Loading members…</div>
              )}
              {members?.length === 0 && (
                <div className="text-sm text-muted-foreground">No members yet.</div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
