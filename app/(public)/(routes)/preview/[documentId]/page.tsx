import { Id } from "@/convex/_generated/dataModel";
import Client from "./client";

interface DocumentIdPageProps {
  params: Promise<{ documentId: Id<"documents"> }>;
}

export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params;
  return <Client documentId={documentId} />;
}
