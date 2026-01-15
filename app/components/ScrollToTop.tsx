"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 
          bg-gradient-to-b from-primary to-[#425b7d]
          hover:from-[#425b7d] hover:to-primary 
          text-white rounded-full p-3 shadow-lg 
          transition-all duration-300 easein-out hover:shadow-xl"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </>
  );
}
