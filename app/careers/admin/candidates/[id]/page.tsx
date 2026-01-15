import { AuthGuard } from "../../AuthGuard";
import { CandidateDetailView } from "./CandidateDetailView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates | Rebus Holdings",
};

export default function CandidateDetailPage() {
  return (
    <AuthGuard>
      <CandidateDetailView />
    </AuthGuard>
  );
}

