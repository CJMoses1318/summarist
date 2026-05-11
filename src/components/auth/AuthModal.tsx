"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineClose,
} from "react-icons/ai";
import {
  FiHelpCircle,
  FiTrendingDown,
  FiTrendingUp,
  FiYoutube,
  FiBell,
  FiMail,
  FiPhone,
  FiBook,
  FiBookOpen,
} from "react-icons/fi";

import { useAuthContext } from "@/components/providers/AuthProvider";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AuthModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.authModalOpen);
  const mode = useAppSelector((state) => state.ui.authModalMode);
  const router = useRouter();

  const { register, login, guestLogin, googleLogin, resetPassword, user } =
    useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingType, setLoadingType] = useState<
    "none" | "register" | "login" | "guest" | "google"
  >("none");

  useEffect(() => {
    if (open && user) {
      dispatch(uiActions.closeAuthModal());
      router.replace("/for-you");
    }
  }, [open, user, router, dispatch]);

  if (!open) return null;

  const close = () => {
    dispatch(uiActions.closeAuthModal());
    setError(null);
    setLoadingType("none");
  };

  const setMode = () => dispatch(uiActions.toggleAuthModalMode());

  const busy =
    loadingType !== "none" &&
    loadingType !== "guest" &&
    loadingType !== "google";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const action = mode === "register" ? register : login;
    setLoadingType(mode === "register" ? "register" : "login");
    const res = await action(email.trim(), password);
    setLoadingType("none");

    if (res.ok) {
      router.push("/for-you");
      dispatch(uiActions.closeAuthModal());
    } else {
      setError(res.message ?? null);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoadingType("guest");
    const res = await guestLogin();
    setLoadingType("none");
    if (res.ok) {
      router.push("/for-you");
      dispatch(uiActions.closeAuthModal());
    } else {
      setError(
        res.message ??
          "Guest login failed. Create the guest user in Firebase Authentication.",
      );
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoadingType("google");
    const res = await googleLogin();
    setLoadingType("none");
    if (res.ok) {
      router.push("/for-you");
      dispatch(uiActions.closeAuthModal());
    } else {
      setError(res.message ?? "Google sign-in failed.");
    }
  };

  const handleForgotPassword = async () => {
    setLoadingType("none");
    setError(null);
    const res = await resetPassword(email.trim());

    if (res.ok) {
      alert("Check your email for a reset link.");
    } else {
      alert(res.message ?? "Could not send reset email.");
    }
  };

  return (
    <div className="authOverlay" aria-hidden={!open} role="dialog">
      <div className="authBackdrop" onClick={close} />
      <aside className="authSidebar">
        <div className="authSidebar__accent" />
        <div className="authSidebar__content">
          <div className="authSidebar__iconRow">
            <span className="authSidebar__icon">
              <FiHelpCircle aria-hidden />
            </span>
            <span className="authSidebar__icon">
              <FiTrendingUp aria-hidden />
            </span>
            <span className="authSidebar__icon">
              <FiTrendingDown aria-hidden />
            </span>
            <span className="authSidebar__icon">
              <FiYoutube aria-hidden />
            </span>
            <AiOutlineClose
              aria-hidden
              className="authSidebar__icon authSidebar__iconClose"
            />
            <button
              type="button"
              className="authSidebar__closeGhost"
              onClick={close}
              aria-label="Close sidebar"
            />
          </div>
          <div className="authSidebar__text">
            <div className="authSidebar__eyebrow">Get Started</div>
            <div className="authSidebar__lead">
              <span className="authSidebar__title">summarised</span>{" "}
              <span className="authSidebar__muted">books</span>
            </div>
            <p className="authSidebar__body">
              Read or listen every day—it only takes ~15 minutes. Build a streak
              to supercharge growth.
            </p>
          </div>
          <div className="authSidebar__illustrations">
            <span className="authSidebar__illIcon">
              <FiBell aria-hidden />
            </span>
            <span className="authSidebar__illIcon">
              <FiMail aria-hidden />
            </span>
            <span className="authSidebar__illIcon">
              <FiPhone aria-hidden />
            </span>
            <span className="authSidebar__book">
              <FiBook aria-hidden />
            </span>
          </div>
        </div>
      </aside>

      <div className="authPanelWrapper">
        <div className="authPanelControls">
          <span className="authPanelDots" aria-hidden>
            <FiBookOpen aria-hidden />
          </span>
          <button
            type="button"
            className="authPanelCloseBtn"
            onClick={close}
            aria-label="Close"
          >
            <AiOutlineClose />
          </button>
        </div>

        <div className="authPanel">

          <h2 className="authPanelHeading">
            {mode === "register" ? "Sign up for Summarist" : "Log in"}
          </h2>

          {error ? <div className="authError">{error}</div> : null}

          <button
            type="button"
            className="authGuestBtn"
            onClick={() => handleGuest()}
            disabled={loadingType !== "none"}
          >
            {loadingType === "guest" ? (
              <AiOutlineLoading3Quarters className="spin" />
            ) : null}
            <Image src="/google.png" alt="" width={16} height={16} />
            <span>Login as a guest</span>
          </button>

          <button
            type="button"
            className="authGoogleBtn"
            onClick={() => handleGoogle()}
            disabled={loadingType !== "none"}
          >
            {loadingType === "google" ? (
              <AiOutlineLoading3Quarters className="spin" />
            ) : null}
            <Image src="/google.png" alt="" width={16} height={16} />
            <span>Login with Google</span>
          </button>

          <div className="authDivider">
            <span className="authDividerLine" />
            <span className="authDividerText">or</span>
            <span className="authDividerLine" />
          </div>

          <form className="authForm" onSubmit={handleSubmit}>
            <label className="authLabel" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="authInput"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />

            <label className="authLabel" htmlFor="auth-password">
              Password
            </label>
            <div className="authPasswordRow">
              <input
                id="auth-password"
                className="authInput"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                minLength={mode === "register" ? 6 : undefined}
              />
              <button
                type="button"
                className="authPasswordToggle"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
            </div>

            {mode === "login" ? (
              <button
                type="button"
                className="authForgotLink"
                onClick={handleForgotPassword}
                disabled={loadingType !== "none"}
              >
                Forgot password?
              </button>
            ) : null}

            <button type="submit" className="authPrimaryBtn" disabled={busy}>
              {busy ? (
                <AiOutlineLoading3Quarters className="spin" />
              ) : mode === "register" ? (
                "Sign up"
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="authToggleRow">
            <span>
              {mode === "register"
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>
            <button type="button" className="authToggleBtn" onClick={setMode}>
              {mode === "register" ? "Login" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
