"use client";

import Link from "next/link";
import { useCallback } from "react";

import { AudioPlayerControls } from "@/components/player/AudioPlayerControls";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useAppSelector } from "@/store/hooks";
import type { Book } from "@/types/book";

const READER_FONT_PX: Record<number, number> = {
  0: 15,
  1: 17,
  2: 19,
  3: 21,
};

type PlayerClientProps = {
  book: Book | null;
};

export function PlayerClient({ book }: PlayerClientProps) {
  const { markBookFinished } = useAuthContext();
  const readerFontScale = useAppSelector((s) => s.ui.readerFontScale);
  const readerFontPx = READER_FONT_PX[readerFontScale] ?? READER_FONT_PX[1];

  const handleEnded = useCallback(() => {
    if (!book) return;
    void markBookFinished(book.id);
  }, [book, markBookFinished]);

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
    <div className="playerPage">
      <main className="playerPage__reader pagePad">
        <h1 className="playerPage__title">{book.title}</h1>
        <div className="playerPage__rule" aria-hidden />
        <section
          className="playerPage__summary bookSummaryArticle"
          style={{ fontSize: readerFontPx }}
        >
          {book.summary}
        </section>
      </main>

      {src ? (
        <AudioPlayerControls
          src={src}
          title={book.title}
          author={book.author}
          coverSrc={book.imageLink}
          onEnded={handleEnded}
        />
      ) : (
        <div className="playerPage__noAudio pagePad">Audio link missing for this book.</div>
      )}
    </div>
  );
}
