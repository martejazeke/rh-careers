"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const DropdownMenuContext = createContext<{ close: () => void } | null>(null);

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0, maxHeight: 300 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const menuEstimatedHeight = 200; // Estimated menu height (more accurate)
        
        let top: number;
        let maxHeight: number;
        let shouldPositionAbove = false;
        
        // Position above only if there's significantly less space below than above
        // and not enough space below for the menu
        if (spaceBelow < menuEstimatedHeight && spaceAbove > spaceBelow + 50) {
          shouldPositionAbove = true;
        }
        
        if (shouldPositionAbove) {
          // Position above the trigger
          maxHeight = Math.min(spaceAbove - 10, 350);
          const menuHeight = Math.min(maxHeight, 300);
          top = rect.top + scrollY - menuHeight - 4;
          // Ensure menu doesn't go above viewport
          if (top < scrollY + 10) {
            top = scrollY + 10;
            maxHeight = Math.min(spaceAbove - 20, 350);
          }
        } else {
          // Position below the trigger (default) - always prefer this
          top = rect.bottom + scrollY + 4;
          maxHeight = Math.min(spaceBelow - 10, 350);
          // If there's not enough space below, allow it to extend but limit height
          if (maxHeight < 150) {
            maxHeight = Math.min(spaceBelow - 5, 350);
          }
        }
        
        const right = viewportWidth - rect.right + scrollX;
        
        setPosition({
          top: Math.max(10, top),
          right,
          maxHeight: Math.max(maxHeight, 150),
        });
      };
      
      updatePosition();
      
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[101] overflow-y-auto"
          style={{
            top: position.top > 0 ? `${position.top}px` : '10px',
            right: `${position.right}px`,
            maxHeight: `${position.maxHeight}px`,
            transform: position.top <= 0 ? 'translateY(0)' : undefined,
          }}
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuContext.Provider value={{ close: () => setIsOpen(false) }}>
            {children}
          </DropdownMenuContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={handleToggle}>{trigger}</div>
      {typeof window !== "undefined" && createPortal(menuContent, document.body)}
    </div>
  );
}

interface DropdownMenuItemProps {
  onClick: (e?: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuItem({
  onClick,
  children,
  className = "",
}: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
        // Close the dropdown menu after clicking an item
        context?.close();
      }}
      className={`w-full text-left px-4 py-2 text-sm font-sans text-slate-700 hover:bg-slate-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

