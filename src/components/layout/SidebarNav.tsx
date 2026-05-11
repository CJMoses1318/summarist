"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiBook,
  FiHeadphones,
  FiHelpCircle,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiLogIn,
} from "react-icons/fi";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";

type SidebarNavProps = {
  pathname: string | null;
  placement: "aside" | "drawer";
  closeDrawer?: () => void;
};

export function SidebarNav({ pathname, placement, closeDrawer }: SidebarNavProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, logout, firebaseReady } = useAuthContext();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const navigate = (href: string) => {
    closeDrawer?.();
    router.push(href);
  };

  return (
    <>
      <div className={`shell__asideInner placement-${placement}`}>
        <nav className="shell__asideNav" aria-label="Primary">
          <button
            type="button"
            className={`shell__asideNavItem ${isActive("/for-you") ? "isAccent" : ""}`}
            onClick={() => navigate("/for-you")}
          >
            <TbLayoutSidebarLeftExpand />
            For you
          </button>

          <button
            type="button"
            className={`shell__asideNavItem ${isActive("/library") ? "isAccent" : ""}`}
            onClick={() => navigate("/library")}
          >
            <FiBook /> Library
          </button>

          <button type="button" className="shell__asideNavItem isDisabled">
            <FiHeadphones /> Highlights
          </button>

          <button type="button" className="shell__asideNavItem isDisabled">
            <FiSearch /> Search
          </button>

          <button
            type="button"
            className={`shell__asideNavItem ${isActive("/settings") ? "isAccent" : ""}`}
            onClick={() => navigate("/settings")}
          >
            <FiSettings /> Settings
          </button>

          <button type="button" className="shell__asideNavItem isDisabled">
            <FiHelpCircle /> Help &amp; Support
          </button>
        </nav>

        <div style={{ marginTop: "auto" }}>
          {user ? (
            <button
              type="button"
              className="shell__asideNavItem"
              onClick={async () => {
                await logout();
                navigate("/for-you");
                closeDrawer?.();
              }}
              disabled={!firebaseReady}
            >
              <FiLogOut /> Logout
            </button>
          ) : (
            <button
              type="button"
              className="shell__asideNavItem"
              disabled={!firebaseReady}
              onClick={() => {
                dispatch(uiActions.openAuthModal("login"));
                closeDrawer?.();
              }}
            >
              <FiLogIn /> Login
            </button>
          )}
        </div>
      </div>

      {/* Visual logo under nav on desktop-ish layouts */}
      {placement === "aside" ? (
        <Link href="/for-you">
          <Image
            alt=""
            src="/login.png"
            width={200}
            height={138}
            style={{ marginTop: 16, borderRadius: 12 }}
          />
        </Link>
      ) : null}
    </>
  );
}
