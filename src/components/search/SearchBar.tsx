"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

import { RemoteBookCover } from "@/components/books/RemoteBookCover";
import { searchBooks } from "@/lib/books-api";
import type { Book } from "@/types/book";

const DEBOUNCE_MS = 300;

export function SearchBar({ pathname }: { pathname: string | null }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Book[]>([]);

  const shouldShow = pathname !== "/" && pathname !== "/choose-plan";

  useEffect(() => {
    if (!shouldShow) return;

    const trimmed = text.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const hits = await searchBooks(trimmed);
        setResults(hits);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [text, shouldShow]);

  if (!shouldShow) return <div />;

  return (
    <div className="searchInputWrap searchInputWrap--trailIcon">
      <input
        aria-label="Search books"
        placeholder="Search for books"
        value={text}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(e) => setText(e.target.value)}
        className="searchInput searchInput--trailIcon"
      />
      <FiSearch className="searchIcon searchIcon--trail" aria-hidden />

      {open && (loading || text.trim()) ? (
        <div className="searchResultsPanel">
          <div className="searchInner">
            {loading ? (
              <div style={{ padding: "12px" }}>Searching…</div>
            ) : (
              <>
                {!results.length ? (
                  <div style={{ padding: "12px" }}>No results</div>
                ) : (
                  results.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className="searchResultBtn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        router.push(`/book/${b.id}`);
                      }}
                    >
                      <RemoteBookCover
                        className="searchResultThumb"
                        src={b.imageLink}
                        alt=""
                      />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700 }}>{b.title}</div>
                        <div style={{ color: "var(--summarist-muted)", fontWeight: 500 }}>
                          {b.author}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
