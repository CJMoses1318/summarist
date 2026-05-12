"use client";

import Link from "next/link";
import { FiClock, FiStar } from "react-icons/fi";

import { RemoteBookCover } from "@/components/books/RemoteBookCover";
import { formatDuration } from "@/lib/format-duration";
import type { Book } from "@/types/book";

import styles from "./BookCard.module.css";

export type BookCardProps = {
  book: Book;
  linkClassName?: string;
  variant?: "default" | "tile";
};

export function BookCard({
  book,
  linkClassName,
  variant = "default",
}: BookCardProps) {
  const linkClass = linkClassName?.trim();

  if (variant === "tile") {
    const durationText =
      book.durationSeconds != null
        ? formatDuration(book.durationSeconds)
        : "—";
    const ratingText =
      book.averageRating != null
        ? book.averageRating.toFixed(1)
        : "—";
    const rootClass = [styles.tile, linkClass].filter(Boolean).join(" ");

    return (
      <Link href={`/book/${book.id}`} className={rootClass || undefined}>
        {book.subscriptionRequired ? (
          <span className={styles.tilePremium}>Premium</span>
        ) : null}
        <div className={styles.tileCover}>
          <RemoteBookCover
            src={book.imageLink}
            alt=""
            className={styles.tileCoverImg}
          />
        </div>
        <div className={styles.tileTitle}>{book.title}</div>
        <div className={styles.tileAuthor}>{book.author}</div>
        {book.subTitle ? (
          <div className={styles.tileSubtitle}>{book.subTitle}</div>
        ) : null}
        <div className={styles.tileMeta}>
          <span className={styles.tileMetaItem}>
            <FiClock className={styles.tileMetaIcon} aria-hidden />
            <span>{durationText}</span>
          </span>
          <span className={styles.tileMetaItem}>
            <FiStar className={styles.tileMetaIcon} aria-hidden />
            <span>{ratingText}</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/book/${book.id}`}
      className={linkClass || undefined}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        gap: 14,
      }}
    >
      <RemoteBookCover
        src={book.imageLink}
        alt=""
        style={{
          width: 88,
          height: 132,
          objectFit: "cover",
          borderRadius: 6,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>{book.title}</div>
        <div style={{ color: "var(--summarist-muted)", fontWeight: 500 }}>
          {book.author}
        </div>

        <div style={{ marginTop: 10, fontWeight: 600, opacity: 0.75 }}>
          {book.subTitle ? book.subTitle : null}
        </div>
      </div>

      <div style={{ position: "relative", width: 100 }}>
        {book.subscriptionRequired ? (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background:
                "linear-gradient(90deg, rgba(43,217,124,1) 0%, rgba(43,217,124,1) 100%)",
              color: "#032b41",
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 12,
              letterSpacing: 0.2,
              textTransform: "uppercase",
            }}
          >
            Premium
          </span>
        ) : null}
      </div>
    </Link>
  );
}
