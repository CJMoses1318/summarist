"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RemoteBookCover } from "@/components/books/RemoteBookCover";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { fetchBookById } from "@/lib/books-api";
import { isSubscribed } from "@/lib/subscription";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";
import type { Book } from "@/types/book";

export default function BookDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, authLoading, saveBookToLibrary, profile } = useAuthContext();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      const fetched = await fetchBookById(id);
      if (cancelled) return;
      setBook(fetched);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const requireUser = (): boolean => {
    if (!user) {
      dispatch(uiActions.openAuthModal("login"));
      return false;
    }
    return true;
  };

  const goReadListen = () => {
    if (!requireUser()) return;
    if (!book) return;
    if (book.subscriptionRequired && !isSubscribed(profile)) {
      router.push("/choose-plan");
    } else {
      router.push(`/player/${book.id}`);
    }
  };

  const addToLibrary = async () => {
    if (!requireUser()) return;
    if (!book) return;
    await saveBookToLibrary(book);
  };

  if (loading || authLoading) {
    return (
      <main className="pagePad">
        <SkeletonBlock height={520} />
      </main>
    );
  }

  if (!book) {
    return (
      <main className="pagePad">
        <div className="sectionTitle">Book not found.</div>
        <Link href="/for-you">
          <button type="button" className="btnGhost">
            Back to For you
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="pagePad">
      <div
        style={{
          display: "flex",
          gap: 18,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <RemoteBookCover
          alt=""
          src={book.imageLink}
          width={172}
          style={{ borderRadius: 10, alignSelf: "flex-start" }}
        />
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", gap: 14 }}
          >
            <div>
              <h1 style={{ margin: 0 }}>{book.title}</h1>
              <div style={{ color: "var(--summarist-muted)", fontWeight: 600 }}>
                {book.author}
              </div>
            </div>

            <div style={{ alignSelf: "flex-start", minHeight: 32 }}>
              {book.subscriptionRequired ? (
                <span
                  style={{
                    background: "var(--summarist-green)",
                    color: "#032b41",
                    fontWeight: 900,
                    padding: "6px 14px",
                    borderRadius: 999,
                  }}
                >
                  Premium
                </span>
              ) : null}
            </div>
          </div>

          <div className="bookDetailActions">
            <button type="button" className="btnPrimary" onClick={goReadListen}>
              Read / Listen
            </button>

            <button type="button" className="btnGhost" onClick={addToLibrary}>
              Add title to My Library
            </button>
          </div>

          <article style={{ marginTop: 16, lineHeight: 1.5 }}>{book.summary}</article>
        </div>
      </div>
    </main>
  );
}
