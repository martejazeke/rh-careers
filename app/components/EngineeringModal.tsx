"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, HardHat, Drill, Droplets, Plane, Layout, Zap } from "lucide-react";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EngineeringModal({ isOpen, onClose }: ServiceModalProps) {
  // Close on Esc key press
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") onClose();
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header Image/Pattern */}
            <div className="h-32 bg-primary flex items-center px-8 relative">
              <HardHat className="text-white/20 absolute right-[-20px] bottom-[-20px] size-48 rotate-12" />
              <h2 className="text-white font-header text-2xl md:text-3xl relative z-10">
                Engineering & Construction Contracting
              </h2>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Section A: General Contracting */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-6 bg-primary rounded-full" />
                  <h3 className="font-header font-bold text-primary uppercase tracking-wider text-sm">
                    General Contracting
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Drill className="text-primary size-5 mt-1" />
                    <div>
                      <h4 className="font-sans font-medium text-primary">Civil Works</h4>
                      <p className="font-sans text-sm text-primary/70">
                        Structural foundations, earthworks, and infrastructure.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Zap className="text-primary size-5 mt-1" />
                    <div>
                      <h4 className="font-sans font-medium text-primary">MEP Systems</h4>
                      <p className="font-sans text-sm text-primary/70">
                        Mechanical, Electrical, and Plumbing integration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section B: Specialized Contracting */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-6 bg-primary rounded-full" />
                  <h3 className="font-header font-bold text-primary uppercase tracking-wider text-sm">
                    Specialized Systems
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      icon: Droplets,
                      title: "Stormwater",
                      desc: "Advanced drainage and water containment solutions.",
                    },
                    {
                      icon: Layout,
                      title: "Façade",
                      desc: "High-performance building envelopes and glass systems.",
                    },
                    {
                      icon: Plane,
                      title: "Airport Systems",
                      desc: "Specialized aviation infrastructure and terminal tech.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <span className="font-sans font-medium text-primary block">
                          {item.title}
                        </span>
                        <span className="font-sans text-xs text-primary/60">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-[#425B7D] transition-all shadow-lg shadow-primary/20"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
