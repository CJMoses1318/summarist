"use client";

import Link from "next/link";

import { BookCard } from "@/components/books/BookCard";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { LibraryPageSkeleton } from "@/components/ui/PageSkeletons";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";

export default function LibraryPage() {
  const dispatch = useAppDispatch();
  const { profile, user, firebaseReady, authLoading } = useAuthContext();

  if (!firebaseReady || authLoading) {
    return <LibraryPageSkeleton />;
  }

  if (!user) {
    return (
      <main className="pagePad">
        <div className="sectionTitle">Log in to see your Library</div>
        <button
          type="button"
          className="btnPrimary"
          onClick={() => dispatch(uiActions.openAuthModal("login"))}
        >
          Login
        </button>
      </main>
    );
  }

  const saved = profile?.savedBooks ?? [];
  const finishedIds = new Set(profile?.finishedBookIds ?? []);

  const finishedSaved = saved.filter((b) => finishedIds.has(b.id));
  const unfinishedSaved = saved.filter((b) => !finishedIds.has(b.id));

  return (
    <main className="pagePad">
      <div className="sectionTitle">Library</div>

      <p style={{ opacity: 0.8 }}>
        Saved books sync to your Firebase profile as soon as you click “Add title to My
        Library”.
      </p>

      <div style={{ marginTop: 26 }}>
        <h2>Saved Books</h2>
        {!unfinishedSaved.length ? (
          <div style={{ opacity: 0.7 }}>No saved books yet.</div>
        ) : (
          <div className="bookStack">
            {unfinishedSaved.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <h2>Finished Books</h2>
        {!finishedSaved.length ? (
          <div style={{ opacity: 0.7 }}>
            When you listen until the audio ends we mark books as finished.
          </div>
        ) : (
          <div className="bookStack">
            {finishedSaved.map((b) => (
              <div key={b.id}>
                <BookCard book={b} />
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.65,
                    paddingLeft: "102px",
                    marginTop: 6,
                  }}
                >
                  Finished —{" "}
                  <Link href={`/player/${b.id}`} style={{ fontWeight: 800 }}>
                    replay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
