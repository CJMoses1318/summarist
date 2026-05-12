"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AiOutlineLoading3Quarters,
  AiOutlinePause,
  AiOutlineCaretRight,
} from "react-icons/ai";
import { IoPlaySkipBack, IoPlaySkipForward } from "react-icons/io5";

import { RemoteBookCover } from "@/components/books/RemoteBookCover";

const SKIP_SEC = 10;

type Props = {
  src: string;
  title: string;
  author: string;
  coverSrc: string;
  onEnded?: () => void;
};

function formatSeconds(total: number): string {
  if (!Number.isFinite(total)) return "00:00";
  const secs = Math.max(0, Math.floor(total % 60));
  const mins = Math.floor(total / 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayerControls({
  src,
  title,
  author,
  coverSrc,
  onEnded,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(true);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const audio = useMemo(() => new Audio(src), [src]);

  useEffect(() => {
    audio.preload = "metadata";

    const onLoadedMeta = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setBusy(false);
    };

    const onTime = () => setCurrent(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    const onEndedHandler = () => {
      setPlaying(false);
      onEndedRef.current?.();
    };

    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEndedHandler);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEndedHandler);
    };
  }, [audio]);

  const togglePlay = async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    await audio.play();
  };

  const skipForward = async () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + SKIP_SEC);
    if (!playing) await audio.play();
  };

  const skipBack = async () => {
    audio.currentTime = Math.max(0, audio.currentTime - SKIP_SEC);
    if (!playing) await audio.play();
  };

  const progress = duration ? Math.min(1, Math.max(0, current / duration)) : 0;

  const setFromInput = async (pct: number) => {
    if (!duration) return;
    audio.currentTime = pct * duration;
    if (!playing) await audio.play();
  };

  return (
    <footer className="audioDock" role="region" aria-label="Audio player">
      <div className="audioDock__inner">
        <div className="audioDock__media">
          <RemoteBookCover
            alt=""
            src={coverSrc}
            width={56}
            height={84}
            className="audioDock__thumb"
          />
          <div className="audioDock__meta">
            <div className="audioDock__title">{title}</div>
            <div className="audioDock__author">{author}</div>
          </div>
        </div>

        <div className="audioDock__controls">
          <button
            type="button"
            className="audioDock__skipBtn"
            aria-label={`Rewind ${SKIP_SEC} seconds`}
            onClick={skipBack}
          >
            <IoPlaySkipBack aria-hidden className="audioDock__skipIcon" />
            <span className="audioDock__skipLabel">{SKIP_SEC}</span>
          </button>

          <button
            type="button"
            className="audioDock__playBtn"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => void togglePlay()}
          >
            {busy ? (
              <AiOutlineLoading3Quarters className="spin" aria-hidden />
            ) : playing ? (
              <AiOutlinePause aria-hidden />
            ) : (
              <AiOutlineCaretRight aria-hidden />
            )}
          </button>

          <button
            type="button"
            className="audioDock__skipBtn"
            aria-label={`Fast forward ${SKIP_SEC} seconds`}
            onClick={() => void skipForward()}
          >
            <IoPlaySkipForward aria-hidden className="audioDock__skipIcon" />
            <span className="audioDock__skipLabel">{SKIP_SEC}</span>
          </button>
        </div>

        <div className="audioDock__timeline">
          <span className="audioDock__time">{formatSeconds(current)}</span>
          <input
            className="audioDock__range"
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={current}
            aria-label="Playback position"
            onChange={(e) => void setFromInput(Number(e.target.value))}
          />
          <span className="audioDock__time">{formatSeconds(duration)}</span>
        </div>
      </div>
    </footer>
  );
}
