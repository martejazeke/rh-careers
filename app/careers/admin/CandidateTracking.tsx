"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Search, Download, MoreVertical, Eye, FileText, Trash2, CheckCircle, XCircle, Users, CheckCircle2, Clock, X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Modal } from "@/app/components/ui/Modal";
import { DropdownMenu, DropdownMenuItem } from "@/app/components/ui/DropdownMenu";
import { ResumeViewerModal } from "@/app/components/ui/ResumeViewerModal";

type Candidate = {
  id: string;
  name: string;
  jobPosition: string;
  dateApplied: string;
  status: "Pending" | "Shortlisted" | "Accepted" | "Rejected";
  email?: string;
  resumeUrl?: string;
  message?: string;
};

const columnHelper = createColumnHelper<Candidate>();

interface CandidateTrackingProps {
  jobIdFilter?: string | null;
  onClearFilter?: () => void;
}

export function CandidateTracking({ jobIdFilter, onClearFilter }: CandidateTrackingProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredJobTitle, setFilteredJobTitle] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; candidateId: string | null; candidateName: string }>({
    isOpen: false,
    candidateId: null,
    candidateName: "",
  });
  const [resumeViewerModal, setResumeViewerModal] = useState<{ isOpen: boolean; candidate: Candidate | null }>({
    isOpen: false,
    candidate: null,
  });

  useEffect(() => {
    fetchCandidates();
  }, [jobIdFilter]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const url = jobIdFilter 
        ? `/api/admin/applications?jobId=${jobIdFilter}`
        : "/api/admin/applications";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }
      const candidates = await res.json();
      setData(candidates);
      
      // Get job title if filtering by job
      if (jobIdFilter) {
        if (candidates.length > 0) {
          // Get job title from first candidate
          setFilteredJobTitle(candidates[0].jobPosition);
        } else {
          // No candidates, fetch job title from jobs API
          try {
            const jobRes = await fetch(`/api/admin/jobs`);
            if (jobRes.ok) {
              const jobs = await jobRes.json();
              const job = jobs.find((j: any) => j.id === jobIdFilter);
              if (job) {
                setFilteredJobTitle(job.title);
              } else {
                setFilteredJobTitle("Unknown Job");
              }
            }
          } catch (err) {
            console.error("Failed to fetch job title:", err);
            setFilteredJobTitle("Unknown Job");
          }
        }
      } else {
        setFilteredJobTitle(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load candidates");
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
        const wasModalOpen = resumeViewerModal.candidate && resumeViewerModal.candidate.id === id;
        
        if (wasModalOpen) {
          setResumeViewerModal({ isOpen: false, candidate: null });
        }

        setData((prev) =>
          prev.map((candidate) =>
            candidate.id === id ? { ...candidate, status: newStatus } : candidate
          )
        );
        
        const url = jobIdFilter 
          ? `/api/admin/applications?jobId=${jobIdFilter}&_t=${Date.now()}`
          : `/api/admin/applications?_t=${Date.now()}`;
        
        const refreshRes = await fetch(url);
        if (refreshRes.ok) {
          const candidates = await refreshRes.json();
          setData(candidates);
          
          if (jobIdFilter) {
            if (candidates.length > 0) {
              setFilteredJobTitle(candidates[0].jobPosition);
            } else {
              try {
                const jobRes = await fetch(`/api/admin/jobs`);
                if (jobRes.ok) {
                  const jobs = await jobRes.json();
                  const job = jobs.find((j: any) => j.id === jobIdFilter);
                  if (job) {
                    setFilteredJobTitle(job.title);
                  }
                }
              } catch (err) {
                console.error("Failed to fetch job title:", err);
              }
            }
          }
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: "Failed to update status" }));
        alert(errorData.error || "Failed to update candidate status");
      }
    } catch (err) {
      alert("Failed to update candidate status. Please try again.");
    }
  };

  const handleViewResume = (candidate: Candidate) => {
    if (candidate.resumeUrl) {
      setResumeViewerModal({
        isOpen: true,
        candidate,
      });
    }
  };

  const handleDownloadResume = async () => {
    if (resumeViewerModal.candidate?.resumeUrl) {
      try {
        const response = await fetch(resumeViewerModal.candidate.resumeUrl);
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${resumeViewerModal.candidate.name.replace(/\s+/g, "_")}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Failed to download resume:", error);
        const link = document.createElement("a");
        link.href = resumeViewerModal.candidate.resumeUrl;
        link.download = `${resumeViewerModal.candidate.name.replace(/\s+/g, "_")}_Resume.pdf`;
        link.setAttribute("download", link.download);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleDeleteClick = (candidate: Candidate) => {
    setDeleteModal({
      isOpen: true,
      candidateId: candidate.id,
      candidateName: candidate.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.candidateId) return;

    try {
      const res = await fetch(`/api/admin/applications?id=${deleteModal.candidateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to delete candidate");
      }

      setData((prev) => prev.filter((c) => c.id !== deleteModal.candidateId));
      setDeleteModal({ isOpen: false, candidateId: null, candidateName: "" });
    } catch (err: any) {
      alert(err.message || "Failed to delete candidate. Please try again.");
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Candidate Name",
        cell: (info) => (
          <span className="font-sans font-medium text-slate-900">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("jobPosition", {
        header: "Job Position",
        cell: (info) => (
          <span className="font-sans text-slate-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("dateApplied", {
        header: "Date Applied",
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <span className="font-sans text-slate-600">
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <Badge status={info.getValue()} />,
      }),
      
    
    
    ],
    []
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.jobPosition.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = data.length;
    const accepted = data.filter((c) => c.status === "Accepted").length;
    const shortlisted = data.filter((c) => c.status === "Shortlisted").length;
    const rejected = data.filter((c) => c.status === "Rejected").length;
    const pending = data.filter((c) => c.status === "Pending").length;

    return { total, accepted, shortlisted, rejected, pending };
  }, [data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleExportCSV = () => {
    const headers = ["Candidate Name", "Job Position", "Date Applied", "Status"];
    const rows = filteredData.map((candidate) => [
      candidate.name,
      candidate.jobPosition,
      candidate.dateApplied,
      candidate.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidates_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="font-sans text-slate-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-sans">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-header font-bold text-slate-900">
              Candidate Tracking
            </h2>
            {jobIdFilter && onClearFilter && (
              <button
                onClick={onClearFilter}
                className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Filtered: {filteredJobTitle || "Loading..."}</span>
                <X size={14} />
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-1">
            {filteredJobTitle 
              ? `Candidates for ${filteredJobTitle} (${filteredData.length} total)`
              : `Manage and track all job applicants (${filteredData.length} total)`
            }
          </p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2 w-full sm:w-auto" size="sm">
          <Download size={16} />
          Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs font-sans font-medium text-slate-600 uppercase tracking-wide truncate">
                Total Candidates
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-sans font-bold text-slate-900 mt-1">
                {kpis.total}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-slate-100 rounded-lg shrink-0 ml-2">
              <Users size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs font-sans font-medium text-slate-600 uppercase tracking-wide truncate">
                Accepted
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-sans font-bold text-green-700 mt-1">
                {kpis.accepted}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-green-100 rounded-lg shrink-0 ml-2">
              <CheckCircle2 size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs font-sans font-medium text-slate-600 uppercase tracking-wide truncate">
                Shortlisted
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-sans font-bold text-slate-900 mt-1">
                {kpis.shortlisted}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-slate-100 rounded-lg shrink-0 ml-2">
              <Eye size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs font-sans font-medium text-slate-600 uppercase tracking-wide truncate">
                Pending
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-sans font-bold text-amber-700 mt-1">
                {kpis.pending}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-amber-100 rounded-lg shrink-0 ml-2">
              <Clock size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs font-sans font-medium text-slate-600 uppercase tracking-wide truncate">
                Rejected
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-sans font-bold text-red-700 mt-1">
                {kpis.rejected}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 lg:p-3 bg-red-100 rounded-lg shrink-0 ml-2">
              <XCircle size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5"
        />
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans text-sm"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="hidden md:block overflow-x-auto -mx-3 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-left text-[10px] xs:text-xs font-sans font-semibold text-slate-700 uppercase tracking-wider"
                      >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {table.getRowModel().rows.map((row) => {
                const candidate = row.original;
                return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/careers/admin/candidates/${candidate.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 whitespace-nowrap relative"
                        onClick={(e) => {
                          // Stop propagation for actions column to allow dropdown to work
                          if (cell.column.id === "actions") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="md:hidden divide-y divide-slate-200">
          {table.getRowModel().rows.map((row) => {
            const candidate = row.original;
            return (
              <div
                key={row.id}
                onClick={() => router.push(`/careers/admin/candidates/${candidate.id}`)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base font-sans font-semibold text-slate-900 mb-1">
                      {candidate.name}
                    </h3>
                    <p className="text-sm font-sans text-slate-600 mb-2">
                      {candidate.jobPosition}
                    </p>
                  </div>
                  <div 
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge status={candidate.status} />
                    <DropdownMenu
                      trigger={
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreVertical size={16} className="text-slate-600" />
                        </button>
                      }
                    >
                      <DropdownMenuItem
                        onClick={() => handleViewResume(candidate)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} />
                          View Resume
                        </div>
                      </DropdownMenuItem>
                      {candidate.status !== "Accepted" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(candidate.id, "Accepted")}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            Accept Candidate
                          </div>
                        </DropdownMenuItem>
                      )}
                      {candidate.status !== "Shortlisted" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(candidate.id, "Shortlisted")}
                        >
                          <div className="flex items-center gap-2">
                            <Eye size={14} />
                            Shortlist Candidate
                          </div>
                        </DropdownMenuItem>
                      )}
                      {candidate.status !== "Rejected" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(candidate.id, "Rejected")}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <div className="flex items-center gap-2">
                            <XCircle size={14} />
                            Reject Candidate
                          </div>
                        </DropdownMenuItem>
                      )}
                      {candidate.status !== "Pending" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(candidate.id, "Pending")}
                        >
                          <div className="flex items-center gap-2">
                            <Eye size={14} />
                            Reset to Pending
                          </div>
                        </DropdownMenuItem>
                      )}
                      <div className="border-t border-slate-200 my-1" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(candidate)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <div className="flex items-center gap-2">
                          <Trash2 size={14} />
                          Delete Candidate
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium mr-2">Date Applied:</span>
                    <span>
                      {new Date(candidate.dateApplied).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-sans text-slate-600 text-center sm:text-left">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredData.length
            )}{" "}
            of {filteredData.length} candidates
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, candidateId: null, candidateName: "" })}
        title="Delete Candidate"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, candidateId: null, candidateName: "" })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="font-sans text-slate-700">
          Are you sure you want to delete the application for <strong>"{deleteModal.candidateName}"</strong>? This action cannot be undone.
        </p>
      </Modal>

      {resumeViewerModal.candidate && (
        <ResumeViewerModal
          isOpen={resumeViewerModal.isOpen}
          onClose={() => setResumeViewerModal({ isOpen: false, candidate: null })}
          candidateName={resumeViewerModal.candidate.name}
          resumeUrl={resumeViewerModal.candidate.resumeUrl || ""}
          currentStatus={resumeViewerModal.candidate.status}
          onStatusUpdate={(status) => handleStatusUpdate(resumeViewerModal.candidate!.id, status)}
          onDownload={handleDownloadResume}
        />
      )}
    </div>
  );
}

