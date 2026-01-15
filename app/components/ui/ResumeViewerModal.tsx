"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle, Eye, XCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  resumeUrl: string;
  currentStatus: "Pending" | "Shortlisted" | "Accepted" | "Rejected";
  onStatusUpdate: (status: "Pending" | "Shortlisted" | "Accepted" | "Rejected") => void;
  onDownload: () => void;
}

export function ResumeViewerModal({
  isOpen,
  onClose,
  candidateName,
  resumeUrl,
  currentStatus,
  onStatusUpdate,
  onDownload,
}: ResumeViewerModalProps) {
  const [pdfError, setPdfError] = useState(false);

  const handleDownload = () => {
    onDownload();
  };

  const handleStatusClick = (status: "Pending" | "Shortlisted" | "Accepted" | "Rejected") => {
    onStatusUpdate(status);
  };

  const handleOpenInNewTab = () => {
    window.open(resumeUrl, "_blank");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-header font-semibold text-slate-900">
                      {candidateName} - Resume
                    </h2>
                    <Badge status={currentStatus} />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Review and manage candidate application</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors ml-4"
                  aria-label="Close"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentStatus !== "Accepted" && (
                      <Button
                        onClick={() => handleStatusClick("Accepted")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Accept
                      </Button>
                    )}
                    {currentStatus !== "Shortlisted" && (
                      <Button
                        onClick={() => handleStatusClick("Shortlisted")}
                        variant="outline"
                        size="sm"
                      >
                        <Eye size={16} className="mr-2" />
                        Shortlist
                      </Button>
                    )}
                    {currentStatus !== "Rejected" && (
                      <Button
                        onClick={() => handleStatusClick("Rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </Button>
                    )}
                    {currentStatus !== "Pending" && (
                      <Button
                        onClick={() => handleStatusClick("Pending")}
                        variant="outline"
                        size="sm"
                      >
                        <Clock size={16} className="mr-2" />
                        Reset to Pending
                      </Button>
                    )}
                  </div>

                  {/* Download and Open Buttons */}
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      onClick={handleOpenInNewTab}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                    >
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 overflow-hidden p-4">
                <div className="w-full h-full border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                  {resumeUrl ? (
                    <>
                      {!pdfError ? (
                        <iframe
                          src={`${resumeUrl}#toolbar=1`}
                          className="w-full h-full"
                          title={`Resume - ${candidateName}`}
                          onError={() => setPdfError(true)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                          <p className="text-slate-600 mb-4 text-center">
                            Unable to display PDF in viewer. Please use the buttons above to download or open in a new tab.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleOpenInNewTab}
                              variant="outline"
                              size="sm"
                            >
                              <ExternalLink size={16} className="mr-2" />
                              Open in New Tab
                            </Button>
                            <Button
                              onClick={handleDownload}
                              variant="outline"
                              size="sm"
                            >
                              <Download size={16} className="mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500">Resume not available</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

