import { AuthGuard } from "../../AuthGuard";
import { CandidateDetailView } from "./CandidateDetailView";

export default function CandidateDetailPage() {
  return (
    <AuthGuard>
      <CandidateDetailView />
    </AuthGuard>
  );
}

