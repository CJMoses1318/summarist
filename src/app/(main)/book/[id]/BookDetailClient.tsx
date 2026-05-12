"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineBulb } from "react-icons/ai";
import { FiBook, FiBookmark, FiClock, FiMic, FiStar } from "react-icons/fi";

import { RemoteBookCover } from "@/components/books/RemoteBookCover";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { formatDuration } from "@/lib/format-duration";
import { isSubscribed } from "@/lib/subscription";
import { uiActions } from "@/store/uiSlice";
import { useAppDispatch } from "@/store/hooks";
import type { Book } from "@/types/book";

type BookDetailClientProps = {
  book: Book | null;
};

export function BookDetailClient({ book }: BookDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, authLoading, saveBookToLibrary, profile } = useAuthContext();

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

  const actionsBusy = authLoading;
  const aboutCopy = book.bookDescription?.trim() || book.summary;
  const ratingLabel =
    book.averageRating != null
      ? `${book.averageRating.toFixed(1)}${
          book.totalRating != null ? ` (${book.totalRating} ratings)` : ""
        }`
      : null;
  const durationLabel =
    book.durationSeconds != null ? formatDuration(book.durationSeconds) : null;
  const typeLabel = book.type?.trim() || "Audio & Text";
  const keyIdeasLabel =
    book.keyIdeas != null ? `${book.keyIdeas} Key ideas` : null;

  return (
    <main className="bookDetailPage pagePad">
      <div className="bookDetailHero">
        <div className="bookDetailHeroText">
          <div className="bookDetailTitleRow">
            <h1 className="bookDetailTitle">{book.title}</h1>
            {book.subscriptionRequired ? (
              <span className="bookDetailPremiumPill">Premium</span>
            ) : null}
          </div>
          <p className="bookDetailAuthor">{book.author}</p>
          {book.subTitle ? (
            <p className="bookDetailSubtitle">{book.subTitle}</p>
          ) : null}

          <ul className="bookDetailMeta" aria-label="Book details">
            {ratingLabel ? (
              <li className="bookDetailMetaItem">
                <FiStar className="bookDetailMetaIcon" aria-hidden />
                <span>{ratingLabel}</span>
              </li>
            ) : null}
            {durationLabel ? (
              <li className="bookDetailMetaItem">
                <FiClock className="bookDetailMetaIcon" aria-hidden />
                <span>{durationLabel}</span>
              </li>
            ) : null}
            <li className="bookDetailMetaItem">
              <FiMic className="bookDetailMetaIcon" aria-hidden />
              <span>{typeLabel}</span>
            </li>
            {keyIdeasLabel ? (
              <li className="bookDetailMetaItem">
                <AiOutlineBulb className="bookDetailMetaIcon" aria-hidden />
                <span>{keyIdeasLabel}</span>
              </li>
            ) : null}
          </ul>

          <div className="bookDetailActions">
            <button
              type="button"
              className="btnBookAction"
              disabled={actionsBusy}
              onClick={goReadListen}
            >
              <FiBook className="btnBookActionIcon" aria-hidden />
              Read
            </button>
            <button
              type="button"
              className="btnBookAction"
              disabled={actionsBusy}
              onClick={goReadListen}
            >
              <FiMic className="btnBookActionIcon" aria-hidden />
              Listen
            </button>
          </div>

          <button
            type="button"
            className="bookDetailLibraryLink"
            disabled={actionsBusy}
            onClick={() => void addToLibrary()}
          >
            <FiBookmark aria-hidden />
            Add title to My Library
          </button>
        </div>

        <div className="bookDetailCoverCol" aria-hidden>
          <div className="bookDetailCoverBackdrop" />
          <RemoteBookCover
            alt=""
            src={book.imageLink}
            width={200}
            height={300}
            loading="eager"
            decoding="async"
            className="bookDetailCoverImg"
          />
        </div>
      </div>

      <section className="bookDetailSection" aria-labelledby="book-about-heading">
        <h2 id="book-about-heading" className="bookDetailSectionTitle">
          What&apos;s it about?
        </h2>
        {book.tags && book.tags.length > 0 ? (
          <div className="bookDetailTags">
            {book.tags.map((tag) => (
              <span key={tag} className="bookDetailTag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="bookDetailBody bookSummaryArticle">{aboutCopy}</div>
      </section>

      {book.authorDescription?.trim() ? (
        <section className="bookDetailSection" aria-labelledby="book-author-heading">
          <h2 id="book-author-heading" className="bookDetailSectionTitle">
            About the author
          </h2>
          <div className="bookDetailBody">{book.authorDescription.trim()}</div>
        </section>
      ) : null}
    </main>
  );
}
