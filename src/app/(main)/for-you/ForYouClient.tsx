"use client";

import Link from "next/link";
import { FiPlay } from "react-icons/fi";

import { BookCard } from "@/components/books/BookCard";
import { RemoteBookCover } from "@/components/books/RemoteBookCover";
import { formatDurationSpoken } from "@/lib/format-duration";
import type { Book } from "@/types/book";

import styles from "./ForYouClient.module.css";

export type ForYouClientProps = {
  selected: Book | null;
  recommended: Book[];
  suggested: Book[];
  error: string | null;
};

function selectedHookText(book: Book): string {
  const sub = book.subTitle?.trim();
  if (sub) return sub;
  const sum = book.summary?.trim();
  if (sum) return sum.length > 220 ? `${sum.slice(0, 217)}…` : sum;
  return "—";
}

export function ForYouClient({
  selected,
  recommended,
  suggested,
  error,
}: ForYouClientProps) {
  if (error) {
    return (
      <main className="pagePad">
        <div className="sectionTitle">{error}</div>
      </main>
    );
  }

  return (
    <main className="pagePad">
      <div className={styles.selectedSection}>
        <div className="sectionTitle" style={{ textAlign: "left" }}>
          Selected just for you
        </div>
        {selected ? (
          <Link
            href={`/book/${selected.id}`}
            className={styles.selectedBanner}
            aria-label={`${selected.title} by ${selected.author}`}
          >
            {selected.subscriptionRequired ? (
              <span className={styles.selectedPremium}>Premium</span>
            ) : null}
            <div className={styles.selectedBannerInner}>
              <div className={styles.selectedLeft}>{selectedHookText(selected)}</div>
              <div className={styles.selectedCoverWrap}>
                <div className={styles.selectedBackdrop} aria-hidden />
                <RemoteBookCover
                  src={selected.imageLink}
                  alt=""
                  className={styles.selectedCoverImg}
                />
              </div>
              <div className={styles.selectedRight}>
                <div className={styles.selectedTitle}>{selected.title}</div>
                <div className={styles.selectedAuthor}>{selected.author}</div>
                <div className={styles.selectedPlayRow}>
                  <FiPlay className={styles.selectedPlayIcon} aria-hidden />
                  <span>{formatDurationSpoken(selected.durationSeconds)}</span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className={styles.empty}>No selected book returned right now.</div>
        )}
      </div>

      <div className={styles.wrapper} style={{ marginBottom: 26 }}>
        <div className={`sectionTitle ${styles.title}`} style={{ textAlign: "left" }}>
          Recommended for you
        </div>
        <div className={styles.subTitle}>We think you&apos;ll like these</div>
        {recommended.length ? (
          <div
            className={styles.booksTrack}
            role="region"
            aria-label="Recommended for you"
          >
            {recommended.map((b) => (
              <div key={b.id} className={styles.booksSlide}>
                <BookCard
                  book={b}
                  variant="tile"
                  linkClassName={styles.booksLink}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Nothing here yet.</div>
        )}
      </div>

      <div className={styles.wrapper}>
        <div className={`sectionTitle ${styles.title}`} style={{ textAlign: "left" }}>
          Suggested Books
        </div>
        <div className={styles.subTitle}>Browse those books</div>
        {suggested.length ? (
          <div
            className={styles.booksTrack}
            role="region"
            aria-label="Suggested books"
          >
            {suggested.map((b) => (
              <div key={b.id} className={styles.booksSlide}>
                <BookCard
                  book={b}
                  variant="tile"
                  linkClassName={styles.booksLink}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Nothing here yet.</div>
        )}
      </div>

      <p style={{ marginTop: 32, opacity: 0.8 }}>
        Need more? Explore with the search bar, or revisit the{" "}
        <Link href="/">marketing page</Link>.
      </p>
    </main>
  );
}
