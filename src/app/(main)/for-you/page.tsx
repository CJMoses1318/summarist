"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BookCard } from "@/components/books/BookCard";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { fetchBooks } from "@/lib/books-api";
import type { Book } from "@/types/book";

export default function ForYouPage() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Book | null>(null);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [suggested, setSuggested] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, rec, sug] = await Promise.all([
          fetchBooks("selected"),
          fetchBooks("recommended"),
          fetchBooks("suggested"),
        ]);

        if (cancelled) return;

        setSelected(s.at(0) ?? null);
        setRecommended(rec);
        setSuggested(sug);
      } catch {
        setError("Could not load books.");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="pagePad">
        <SkeletonBlock height={260} />
        <SkeletonBlock height={420} />
        <SkeletonBlock height={420} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="pagePad">
        <div className="sectionTitle">{error}</div>
      </main>
    );
  }

  return (
    <main className="pagePad">
      <div style={{ marginBottom: 26 }}>
        <div className="sectionTitle" style={{ textAlign: "left" }}>
          Selected just for you
        </div>
        {selected ? (
          <div className="bookStack">
            <BookCard book={selected} />
          </div>
        ) : (
          <div>No selected book returned right now.</div>
        )}
      </div>

      <div style={{ marginBottom: 26 }}>
        <div className="sectionTitle" style={{ textAlign: "left" }}>
          Recommended for you
        </div>
        <div className="bookStack">
          {recommended.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </div>

      <div>
        <div className="sectionTitle" style={{ textAlign: "left" }}>
          Suggested Books
        </div>
        <div className="bookStack">
          {suggested.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </div>

      <p style={{ marginTop: 32, opacity: 0.8 }}>
        Need more? Explore with the search bar, or revisit the{" "}
        <Link href="/">marketing page</Link>.
      </p>
    </main>
  );
}
