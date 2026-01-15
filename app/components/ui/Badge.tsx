"use client";

interface BadgeProps {
  status: "Pending" | "Shortlisted" | "Accepted" | "Rejected";
  className?: string;
}

export function Badge({ status, className = "" }: BadgeProps) {
  const styles = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Shortlisted: "bg-slate-100 text-slate-800 border-slate-200",
    Accepted: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium border ${styles[status]} ${className}`}
    >
      {status}
    </span>
  );
}

