"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/app/room";
import { api as apiAll } from "@/convex/_generated/api";

interface ClientProps {
  documentId: Id<"documents">;
}

export default function Client({ documentId }: ClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const document = useQuery(api.documents.getById, { documentId });
  const role = useQuery(apiAll.memberships.myRole, { documentId });
  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    // Only editor or owner can update; during loading (role === undefined), do not update
    if (role !== "editor" && role !== "owner") return;
    update({ id: documentId, content });
  };

  if (!mounted || document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  return (
    <Room id={`document-${documentId}`}>
      <div className="pb-40">
        <Cover url={document.coverImage} />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
          <Toolbar initialData={document} canEdit={role === "editor" || role === "owner"} />
          <Editor
            onChange={onChange}
            initialContent={document.content}
            editable={role === "editor" || role === "owner"}
          />
        </div>
      </div>
    </Room>
  );
}


