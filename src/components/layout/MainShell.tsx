"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { SearchBar } from "@/components/search/SearchBar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uiActions } from "@/store/uiSlice";

export default function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const drawerOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);

  return (
    <div className="shell">
      <aside className="shell__aside">
        <SidebarNav placement="aside" pathname={pathname} />
      </aside>

      <div className="shell__main">
        <header className="shell__header">
          <button
            type="button"
            className="shell__burger"
            aria-label="Open menu"
            onClick={() => dispatch(uiActions.setMobileSidebar(true))}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>≡</span>
          </button>

          <div className="searchRow">
            <SearchBar pathname={pathname} />
            <div className="shell__brand">
              <Link href="/for-you">
                <Image alt="Summarist" src="/logo.png" width={154} height={35} />
              </Link>
            </div>
          </div>
        </header>

        {drawerOpen ? (
          <>
            <button
              type="button"
              className="shell__backdrop"
              aria-label="Close menu"
              onClick={() => dispatch(uiActions.setMobileSidebar(false))}
            />
            <aside
              className="shell__aside shell__asideDrawer"
              style={{ display: "grid" }}
            >
              <SidebarNav
                placement="drawer"
                pathname={pathname}
                closeDrawer={() => dispatch(uiActions.setMobileSidebar(false))}
              />
            </aside>
          </>
        ) : null}

        <div className="shell__grow">{children}</div>
      </div>
    </div>
  );
}
