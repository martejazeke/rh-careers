"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", id: "home", type: "scroll" },
  {
    name: "Companies",
    type: "dropdown",
    items: [
      { name: "CloseoutSoft", href: "https://closeoutsoft.ae" },
      { name: "Rebus Engineering & Contracting", href: "/companies/rebus-engineering" },
      { name: "Rebus Projects Management", href: "/companies/rebus-projects-management" },
      { name: "Rebus Technology Solutions", href: "/companies/rebus-technology-solutions"},
      { name: "Rebus Safety & Security", href: "/companies/rebus-safety-security"}
    ],
  },
  {
    name: "About",
    type: "dropdown",
    items: [
      { name: "The Visionary Leader", href: "/about/ceo" },
      { name: "Our Mission, Vision, and Values", href: "/about/mission-vision-values" },
      { name: "Our Journey", href: "/about/values" },
      { name: "Who We Are", href: "/about/whoweare" },
      { name: "Certificates", href: "/about/certificates" }
    ],
  },
  {
    name: "Projects",
    type: "dropdown",
    items: [
      { name: "Completed", href: "/projects/completed" },
      { name: "Ongoing", href: "/projects/ongoing" }
    ],
  },
  {
    name: "Resources",
    type: "dropdown",
    items: [
      { name: "News", href: "/resources/news" },
      { name: "Blogs", href: "/resources/blogs" },
      { name: "Photo Gallery", href: "/resources/photo-gallery" }
    ],
  },
  { name: "Careers", href: "/careers", type: "link" },
];

function DesktopDropdown({ item, textColor, textColorMuted, headerTheme }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`${textColorMuted} hover:${textColor} font-medium transition-colors flex items-center gap-1 group`}
      >
        {item.name}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <span
          className={`absolute -bottom-1 left-0 w-0 h-0.5 ${
            headerTheme === "dark" ? "bg-white" : "bg-primary"
          } transition-all group-hover:w-full`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {item.items.map((subItem: any, index: number) => (
              <a
                key={subItem.name}
                href={subItem.href}
                className="block px-6 py-3 text-primary hover:bg-primary hover:text-white transition-colors border-b border-gray-50 last:border-b-0"
              >
                {subItem.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileDropdown({ item, onNavigate }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-2xl hover:text-white/70 transition-colors flex items-center justify-center gap-2"
      >
        {item.name}
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 mt-4 mb-2">
              {item.items.map((subItem: any) => (
                <a
                  key={subItem.name}
                  href={subItem.href}
                  onClick={onNavigate}
                  className="text-lg text-white/80 hover:text-white transition-colors"
                >
                  {subItem.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [headerTheme, setHeaderTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -90% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute("data-theme") as
            | "light"
            | "dark";
          if (theme) setHeaderTheme(theme);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    const sections = document.querySelectorAll("section[data-theme]");
    sections.forEach((section) => observer.observe(section));

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [pathname]);

  const textColor = headerTheme === "dark" ? "text-white" : "text-primary";
  const textColorMuted =
    headerTheme === "dark" ? "text-white/80" : "text-primary/70";

  const handleNavClick = (item: any) => {
    setIsMobileMenuOpen(false);
    if (item.type === "scroll") {
      if (pathname === "/") {
        const element = document.getElementById(item.id);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/?section=${item.id}`);
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-gray-400/10 backdrop-blur-md shadow-md border-b border-gray-100/30 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="relative z-[70]"
          >
            <img
              alt="Logo"
              className={`h-12 md:h-16 w-auto object-contain transition-all duration-300 ${
                headerTheme === "dark" ? "brightness-0 invert" : ""
              }`}
              src="/images/logo.png"
            />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => {
              if (item.type === "dropdown") {
                return (
                  <DesktopDropdown
                    key={item.name}
                    item={item}
                    textColor={textColor}
                    textColorMuted={textColorMuted}
                    headerTheme={headerTheme}
                  />
                );
              }

              const baseClass = `${textColorMuted} hover:${textColor} font-medium transition-colors relative group`;

              return item.type === "scroll" ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className={baseClass}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 ${
                      headerTheme === "dark" ? "bg-white" : "bg-primary"
                    } transition-all group-hover:w-full`}
                  />
                </button>
              ) : (
                <a key={item.name} href={item.href!} className={baseClass}>
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 ${
                      headerTheme === "dark" ? "bg-white" : "bg-primary"
                    } transition-all group-hover:w-full`}
                  />
                </a>
              );
            })}

            <a
              href="/contact"
              className="bg-gradient-to-r from-primary to-[#425B7D] px-6 py-3 rounded-full text-white hover:shadow-lg transition-all active:scale-95"
            >
              Get in Touch
            </a>
          </nav>

          <button
            className="lg:hidden p-2 relative z-[60]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X size={32} className="text-white relative z-[80]" />
            ) : (
              <Menu size={32} className={textColor} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-primary z-[60] transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="absolute top-6 left-6">
          <img
            src="/images/white.png"
            alt="Logo"
            className="h-6 w-auto brightness-200"
          />
        </div>

        <div className="flex flex-col items-center justify-center h-full gap-8 text-white font-header px-6">
          {navLinks.map((item, index) => (
            <motion.div
              key={item.name}
              initial={false}
              animate={
                isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ delay: index * 0.1 }}
              className="w-full flex flex-col items-center"
            >
              {item.type === "dropdown" ? (
                <MobileDropdown
                  item={item}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              ) : item.type === "scroll" ? (
                <button
                  className="text-2xl hover:text-white/70 transition-colors"
                  onClick={() => handleNavClick(item)}
                >
                  {item.name}
                </button>
              ) : (
                <a
                  href={item.href!}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl hover:text-white/70 transition-colors"
                >
                  {item.name}
                </a>
              )}
            </motion.div>
          ))}

          <a
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-6 px-10 py-4 bg-white text-primary rounded-full text-lg font-medium shadow-2xl active:scale-95 transition-transform"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </>
  );
}