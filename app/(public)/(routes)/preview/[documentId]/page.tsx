import { Id } from "@/convex/_generated/dataModel";
import Client from "./client";

interface DocumentIdPageProps {
  params: { documentId: Id<"documents"> };
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  return <Client documentId={params.documentId} />;
}
