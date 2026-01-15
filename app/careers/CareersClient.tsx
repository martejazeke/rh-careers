"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Briefcase, Search, FilterX } from "lucide-react";

export default function CareersClient() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedLoc, setSelectedLoc] = useState("All Locations");

  useEffect(() => {
    async function getJobs() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    getJobs();
  }, []);

  // Generate unique filter options dynamically based on the data
  const departments = useMemo(
    () => ["All Departments", ...new Set(jobs.map((j: any) => j.department))],
    [jobs]
  );

  const locations = useMemo(
    () => ["All Locations", ...new Set(jobs.map((j: any) => j.location))],
    [jobs]
  );

  // Filter Logic
  const filteredJobs = jobs.filter((job: any) => {
    const matchDept =
      selectedDept === "All Departments" || job.department === selectedDept;
    const matchLoc =
      selectedLoc === "All Locations" || job.location === selectedLoc;
    return matchDept && matchLoc;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FAFAFA] to-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-sans text-slate-500 animate-pulse">
            Loading opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F8FAFC] py-24 md:py-32 px-6" data-theme='light'>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-header text-2xl md:text-4xl text-primary mb-4">
              Open Positions
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-sans">
              <Briefcase size={18} className="text-[#425B7D]" />
              <span>{filteredJobs.length} openings showing</span>
            </div>
          </motion.div>
        </header>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-12 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mx-12">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-primary/80 uppercase mb-2 ml-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-sm text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-primary/80 uppercase mb-2 ml-1">
              Location
            </label>
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-sm text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {(selectedDept !== "All Departments" ||
            selectedLoc !== "All Locations") && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDept("All Departments");
                  setSelectedLoc("All Locations");
                }}
                className="p-3 text-sm font-semibold text-primary hover:text-red-500 transition-colors flex items-center gap-2"
              >
                <FilterX size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-12">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job: any, index: number) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-header text-primary text-lg mb-3 leading-tight group-hover:text-primary/80 transition-colors">
                    {job.title}
                  </h3>
                  <p className="font-sans text-[#425B7D] text-xs font-semibold uppercase tracking-wide mb-4">
                    {job.department}
                  </p>
                  <p className="font-sans text-[#425B7D] text-xs tracking-wide mb-4">
                    Vacanc{job.vacancies > 1 ? "ies" : "y"}: {job.vacancies}
                  </p>
                  <div className="flex items-center gap-2 text-primary/70 text-sm font-sans mb-8">
                    <MapPin size={14} />
                    <span>
                      {job.location} • {job.work_mode}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/careers/${job.id}`}
                  className="w-full bg-primary text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
                  aria-label={`Apply for ${job.title}`}
                >
                  View Details & Apply
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"
            >
              <Search className="mx-auto text-slate-300" size={48} />
              <h3 className="font-header text-2xl text-primary">
                No positions match your filters
              </h3>
              <p className="text-slate-500 font-sans mt-2">
                Try adjusting your filters or clear them to see all openings.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
