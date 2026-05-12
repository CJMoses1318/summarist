"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiBook,
  FiBookmark,
  FiEdit2,
  FiHelpCircle,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiSearch,
  FiSettings,
} from "react-icons/fi";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uiActions } from "@/store/uiSlice";

type SidebarNavProps = {
  pathname: string | null;
  placement: "aside" | "drawer";
  closeDrawer?: () => void;
};

export function SidebarNav({ pathname, placement, closeDrawer }: SidebarNavProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, logout, firebaseReady } = useAuthContext();
  const readerFontScale = useAppSelector((s) => s.ui.readerFontScale);

  const isPlayerRoute = Boolean(pathname?.startsWith("/player/"));

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const navigate = (href: string) => {
    closeDrawer?.();
    router.push(href);
  };

  return (
    <div className={`shell__asideInner placement-${placement}`}>
      <Link href="/for-you" className="shell__asideBrand" onClick={() => closeDrawer?.()}>
        <FiBook className="shell__asideBrandIcon" aria-hidden />
        <span className="shell__asideBrandText">Summarist</span>
      </Link>

      <nav className="shell__asideNav" aria-label="Primary">
        <button
          type="button"
          className={`shell__asideNavItem ${isActive("/for-you") ? "isAccent" : ""}`}
          onClick={() => navigate("/for-you")}
        >
          <FiHome aria-hidden />
          For you
        </button>

        <button
          type="button"
          className={`shell__asideNavItem ${isActive("/library") ? "isAccent" : ""}`}
          onClick={() => navigate("/library")}
        >
          <FiBookmark aria-hidden />
          My Library
        </button>

        <button type="button" className="shell__asideNavItem isDisabled">
          <FiEdit2 aria-hidden />
          Highlights
        </button>

        <button type="button" className="shell__asideNavItem isDisabled">
          <FiSearch aria-hidden />
          Search
        </button>
      </nav>

      {isPlayerRoute ? (
        <div className="shell__fontScale">
          <div className="shell__fontScaleLabel">Text size</div>
          <div className="shell__fontScaleRow">
            {[0, 1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                className={`shell__fontScaleBtn ${readerFontScale === step ? "isOn" : ""}`}
                aria-pressed={readerFontScale === step}
                aria-label={`Reader text size ${step + 1} of 4`}
                onClick={() => dispatch(uiActions.setReaderFontScale(step))}
              >
                <span
                  className="shell__fontScaleAa"
                  style={{ fontSize: 12 + step * 2 }}
                >
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="shell__asideFoot">
        <nav className="shell__asideNav" aria-label="Account">
          <button
            type="button"
            className={`shell__asideNavItem ${isActive("/settings") ? "isAccent" : ""}`}
            onClick={() => navigate("/settings")}
          >
            <FiSettings aria-hidden />
            Settings
          </button>

          <button type="button" className="shell__asideNavItem isDisabled">
            <FiHelpCircle aria-hidden />
            Help &amp; Support
          </button>
        </nav>

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
            <FiLogOut aria-hidden />
            Logout
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
            <FiLogIn aria-hidden />
            Login
          </button>
        )}
      </div>
    </div>
  );
}
