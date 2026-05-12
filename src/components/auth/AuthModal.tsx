"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  AiOutlineLoading3Quarters,
  AiOutlineClose,
  AiOutlineUser,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

import { AuthOverlayPortal } from "@/components/auth/AuthOverlayPortal";
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
    <AuthOverlayPortal>
      <div className="authOverlay" aria-hidden={!open} role="dialog" aria-modal="true">
        <div className="authBackdrop" onClick={close} />

        <div className="authModalCard">
          <button
            type="button"
            className="authModalClose"
            onClick={close}
            aria-label="Close"
          >
            <AiOutlineClose />
          </button>

          <h2 className="authModalTitle" id="auth-modal-title">
            {mode === "register" ? "Sign up for Summarist" : "Log in to Summarist"}
          </h2>

        {error ? <div className="authError">{error}</div> : null}

        <button
          type="button"
          className="authGuestBtn"
          onClick={() => handleGuest()}
          disabled={loadingType !== "none"}
        >
          <span className="authGuestBtnIcon" aria-hidden>
            {loadingType === "guest" ? (
              <AiOutlineLoading3Quarters className="spin" />
            ) : (
              <AiOutlineUser />
            )}
          </span>
          <span className="authGuestBtnLabel">Login as a Guest</span>
        </button>

        <div className="authDivider" role="separator">
          <span className="authDividerLine" />
          <span className="authDividerText">or</span>
          <span className="authDividerLine" />
        </div>

        <button
          type="button"
          className="authGoogleBtn"
          onClick={() => handleGoogle()}
          disabled={loadingType !== "none"}
        >
          <span className="authGoogleMark" aria-hidden>
            {loadingType === "google" ? (
              <AiOutlineLoading3Quarters className="spin authGoogleSpin" />
            ) : (
              <FcGoogle size={22} aria-hidden />
            )}
          </span>
          <span className="authGoogleBtnLabel">Login with Google</span>
        </button>

        <div className="authDivider" role="separator">
          <span className="authDividerLine" />
          <span className="authDividerText">or</span>
          <span className="authDividerLine" />
        </div>

        <form className="authForm" onSubmit={handleSubmit} aria-labelledby="auth-modal-title">
          <input
            id="auth-email"
            className="authInput"
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            aria-label="Email Address"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            id="auth-password"
            className="authInput"
            type="password"
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
            minLength={mode === "register" ? 6 : undefined}
          />

          <button type="submit" className="authPrimaryBtn" disabled={busy}>
            {busy ? (
              <AiOutlineLoading3Quarters className="spin" />
            ) : mode === "register" ? (
              "Sign up"
            ) : (
              "Login"
            )}
          </button>

          {mode === "login" ? (
            <button
              type="button"
              className="authForgotLink"
              onClick={handleForgotPassword}
              disabled={loadingType !== "none"}
            >
              Forgot your password?
            </button>
          ) : null}
        </form>

        <div className="authModalFooter">
          {mode === "register" ? (
            <p className="authFooterPrompt">
              Already have an account?{" "}
              <button type="button" className="authFooterLink" onClick={setMode}>
                Login
              </button>
            </p>
          ) : (
            <p className="authFooterPrompt">
              Don&apos;t have an account?{" "}
              <button type="button" className="authFooterLink" onClick={setMode}>
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
    </AuthOverlayPortal>
  );
}
