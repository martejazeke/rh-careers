"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/careers/admin");

  return (
    <>
      {!isAdminPage && <Header />}
      <main className="">{children}</main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <ScrollToTop />}
    </>
  );
}

