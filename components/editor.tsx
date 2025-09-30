"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useCreateBlockNote } from "@blocknote/react";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
// Full UI styles for the Mantine-based BlockNote components (command menu, toolbars, etc.)
import "@blocknote/mantine/style.css";

import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
};

const Editor = ({
  onChange,
  initialContent,
  editable = true,
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    // In development, avoid slow external uploads to speed up page load
    if (process.env.NODE_ENV !== "production") {
      return URL.createObjectURL(file);
    }
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  const parsedInitial = (() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent) as any;
    } catch {
      return undefined;
    }
  })();

  // Child components with their own hooks to preserve hook order in parent
  const EditableEditor = ({
    DynamicBlockNoteView,
  }: {
    DynamicBlockNoteView: any;
  }) => {
    const liveEditor = useCreateBlockNoteWithLiveblocks({
      initialContent: parsedInitial,
      uploadFile: handleUpload,
    });

    useEffect(() => {
      if (!liveEditor) return;
      return liveEditor.onChange(() => {
        onChange(JSON.stringify((liveEditor as any).topLevelBlocks, null, 2));
      });
    }, [liveEditor, onChange]);

    return (
      <DynamicBlockNoteView
        editor={liveEditor as any}
        editable
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    );
  };

  const ReadonlyEditor = ({
    DynamicBlockNoteView,
  }: {
    DynamicBlockNoteView: any;
  }) => {
    const roEditor = useCreateBlockNote({
      initialContent: parsedInitial,
      uploadFile: handleUpload,
    });

    return (
      <DynamicBlockNoteView
        editor={roEditor as any}
        editable={false}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    );
  };

  // Guard against SSR/mount timing by waiting for client mount before rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Defer render to the next macrotask after mount to avoid early Tiptap init
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setShow(true), 0);
    return () => clearTimeout(t);
  }, [mounted]);

  // Remount on theme change to keep styles consistent without touching internals
  const [mountKey, setMountKey] = useState(0);
  useEffect(() => setMountKey((k) => k + 1), [resolvedTheme]);

  // Dynamically import BlockNoteView to avoid early Tiptap access during SSR/initialization
  const DynamicBlockNoteView = useMemo(
    () =>
      dynamic(async () => (await import("@blocknote/mantine")).BlockNoteView, {
        ssr: false,
      }),
    []
  );

  if (!mounted || !show) return null as any;

  return (
    <div>
      {editable ? (
        <EditableEditor DynamicBlockNoteView={DynamicBlockNoteView} key={`bn-${resolvedTheme}-${mountKey}-e`} />
      ) : (
        <ReadonlyEditor DynamicBlockNoteView={DynamicBlockNoteView} key={`bn-${resolvedTheme}-${mountKey}-r`} />
      )}
    </div>
  );
}

export default Editor;
