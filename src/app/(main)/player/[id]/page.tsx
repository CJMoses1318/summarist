"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AudioPlayerControls } from "@/components/player/AudioPlayerControls";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { fetchBookById } from "@/lib/books-api";
import type { Book } from "@/types/book";

export default function PlayerPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { markBookFinished, authLoading } = useAuthContext();

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

  if (loading || authLoading) {
    return (
      <main className="pagePad">
        <SkeletonBlock height={96} />
        <SkeletonBlock height={460} />
      </main>
    );
  }

  if (!book) {
    return (
      <main className="pagePad">
        <div className="sectionTitle">Story not available.</div>
        <Link href="/for-you" className="btnGhost">
          Back
        </Link>
      </main>
    );
  }

  const src =
    typeof book.audioLink === "string" && book.audioLink.length ? book.audioLink : "";

  return (
    <main className="pagePad">
      <h1 style={{ marginTop: 0 }}>{book.title}</h1>

      {src ? (
        <AudioPlayerControls
          src={src}
          onEnded={() => {
            void markBookFinished(book.id);
          }}
        />
      ) : (
        <div style={{ marginBottom: 12 }}>Audio link missing for this book.</div>
      )}

      <section
        style={{
          whiteSpace: "pre-line",
          marginTop: 18,
          lineHeight: 1.65,
          fontWeight: 500,
        }}
      >
        {book.summary}
      </section>
    </main>
  );
}
