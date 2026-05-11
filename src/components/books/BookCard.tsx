"use client";

import Link from "next/link";

import { RemoteBookCover } from "@/components/books/RemoteBookCover";
import type { Book } from "@/types/book";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/book/${book.id}`}
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
