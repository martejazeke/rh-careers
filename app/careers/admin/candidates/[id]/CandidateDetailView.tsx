"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, CheckCircle, Eye, XCircle, Clock, Calendar, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { DropdownMenu, DropdownMenuItem } from "@/app/components/ui/DropdownMenu";

type Candidate = {
  id: string;
  name: string;
  jobPosition: string;
  dateApplied: string;
  status: "Pending" | "Shortlisted" | "Accepted" | "Rejected";
  email?: string;
  resumeUrl?: string;
  message?: string;
  note?: string;
};

export function CandidateDetailView() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (candidates.length > 0 && candidateId) {
      const candidate = candidates.find((c) => c.id === candidateId);
      if (candidate) {
        setSelectedCandidate(candidate);
        setNote(candidate.note || "");
      } else if (candidates.length > 0) {
        // If candidate not found, select first one
        setSelectedCandidate(candidates[0]);
        setNote(candidates[0].note || "");
        router.replace(`/careers/admin/candidates/${candidates[0].id}`);
      }
    }
  }, [candidates, candidateId, router]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/applications");
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await res.json();
      setCandidates(data);
    } catch (err: any) {
      console.error("Failed to load candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "Pending" | "Shortlisted" | "Accepted" | "Rejected") => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        // Update local state
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        if (selectedCandidate?.id === id) {
          setSelectedCandidate((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to update status" }));
        alert(errorData.error || "Failed to update candidate status");
      }
    } catch (err) {
      alert("Failed to update candidate status. Please try again.");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedCandidate) return;
    
    setSavingNote(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedCandidate.id, 
          note: note,
          status: selectedCandidate.status // Keep existing status
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to save note" }));
        throw new Error(errorData.error || "Failed to save note");
      }

      // Update local state
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedCandidate.id ? { ...c, note } : c))
      );
      setSelectedCandidate((prev) => prev ? { ...prev, note } : null);
      
      setSavingNote(false);
      // Show success feedback (you could replace alert with a toast notification)
      alert("Note saved successfully!");
    } catch (err: any) {
      setSavingNote(false);
      alert(err.message || "Failed to save note. Please try again.");
    }
  };

  const handleDownloadResume = async () => {
    if (!selectedCandidate?.resumeUrl) return;
    
    try {
      const response = await fetch(selectedCandidate.resumeUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${selectedCandidate.name.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download resume:", error);
      const link = document.createElement("a");
      link.href = selectedCandidate.resumeUrl;
      link.download = `${selectedCandidate.name.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNote(candidate.note || "");
    router.push(`/careers/admin/candidates/${candidate.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="font-sans text-slate-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="font-sans text-slate-600 mb-4">Candidate not found</p>
          <Button onClick={() => router.push("/careers/admin")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentIndex = candidates.findIndex((c) => c.id === selectedCandidate.id);
  const nextCandidate = candidates[currentIndex + 1];
  const prevCandidate = candidates[currentIndex - 1];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Candidate List */}
      <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center shrink-0 h-[73px]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/careers/admin")}
            className="w-full flex items-center justify-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Candidates
          </Button>
        </div>
        <div className="p-2">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => handleCandidateClick(candidate)}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                selectedCandidate.id === candidate.id
                  ? "bg-slate-100 border-2 border-slate-900"
                  : "hover:bg-slate-50 border-2 border-transparent"
              }`}
            >
              <div className="font-sans font-medium text-slate-900 mb-1">
                {candidate.name}
              </div>
              <div className="text-sm text-slate-600 mb-1">
                {candidate.jobPosition}
              </div>
              <div className="text-xs text-slate-500">
                Applied {new Date(candidate.dateApplied).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="mt-2">
                <Badge status={candidate.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Resume Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 h-[73px]">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => prevCandidate && handleCandidateClick(prevCandidate)}
              disabled={!prevCandidate}
            >
              ←
            </Button>
            <span className="text-sm text-slate-600 font-sans">
              {currentIndex + 1} of {candidates.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => nextCandidate && handleCandidateClick(nextCandidate)}
              disabled={!nextCandidate}
            >
              →
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadResume}
              className="flex items-center"
            >
              <Download size={16} className="mr-2" />
              Download Resume
            </Button>
          </div>
        </div>

        {/* Resume Viewer */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="w-full h-full border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
            {selectedCandidate.resumeUrl ? (
              <iframe
                src={`${selectedCandidate.resumeUrl}#toolbar=1`}
                className="w-full h-full"
                title={`Resume - ${selectedCandidate.name}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Resume not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Status & Activity */}
      <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Status Section */}
          <div>
            <label className="block text-sm font-sans font-medium text-slate-900 mb-2">
              Status
            </label>
            <DropdownMenu
              trigger={
                <button className="w-full px-3 py-2 text-left border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-between">
                  <Badge status={selectedCandidate.status} />
                  <span className="text-slate-400">▼</span>
                </button>
              }
            >
              {selectedCandidate.status !== "Accepted" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(selectedCandidate.id, "Accepted")}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} />
                    Accept
                  </div>
                </DropdownMenuItem>
              )}
              {selectedCandidate.status !== "Shortlisted" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(selectedCandidate.id, "Shortlisted")}>
                  <div className="flex items-center gap-2">
                    <Eye size={14} />
                    Shortlist
                  </div>
                </DropdownMenuItem>
              )}
              {selectedCandidate.status !== "Rejected" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(selectedCandidate.id, "Rejected")}>
                  <div className="flex items-center gap-2">
                    <XCircle size={14} />
                    Reject
                  </div>
                </DropdownMenuItem>
              )}
              {selectedCandidate.status !== "Pending" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(selectedCandidate.id, "Pending")}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    Reset to Pending
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenu>
          </div>

          {/* Activity Feed */}
          <div>
            <h3 className="text-sm font-sans font-semibold text-slate-900 mb-3">Activity Feed</h3>
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                <div className="font-medium mb-1">
                  {new Date(selectedCandidate.dateApplied).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-slate-500">
                  {selectedCandidate.name} applied to {selectedCandidate.jobPosition}
                </div>
              </div>
            </div>
          </div>

          {/* Private Notes */}
          <div>
            <h3 className="text-sm font-sans font-semibold text-slate-900 mb-3">Private Notes</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write private note here..."
              rows={6}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans resize-none"
            />
            <Button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="w-full mt-2"
              size="sm"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </Button>
          </div>

          {/* Candidate Info */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-sans font-semibold text-slate-900 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              {selectedCandidate.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-medium">Email:</span>
                  <a href={`mailto:${selectedCandidate.email}`} className="text-blue-600 hover:underline">
                    {selectedCandidate.email}
                  </a>
                </div>
              )}
              <div className="text-slate-600">
                <span className="font-medium">Applied:</span>{" "}
                {new Date(selectedCandidate.dateApplied).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {selectedCandidate.message && (
                <div className="text-slate-600 mt-3">
                  <span className="font-medium">Message:</span>
                  <p className="mt-1 text-slate-500">{selectedCandidate.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

