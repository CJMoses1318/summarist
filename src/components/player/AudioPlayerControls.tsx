"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AiOutlineBackward,
  AiOutlineForward,
  AiOutlinePause,
  AiOutlineLoading3Quarters,
  AiOutlineCaretRight,
} from "react-icons/ai";

type Props = {
  src: string;
  onEnded?: () => void;
};

function formatSeconds(total: number): string {
  if (!Number.isFinite(total)) return "00:00";
  const secs = Math.max(0, Math.floor(total % 60));
  const mins = Math.floor(total / 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayerControls({ src, onEnded }: Props) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(true);

  const audio = useMemo(() => new Audio(src), [src]);

  useEffect(() => {
    audio.preload = "metadata";

    const onLoadedMeta = () => {
      setDuration(audio.duration || 0);
      setBusy(false);
    };

    const onTime = () => setCurrent(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", () => {
      setPlaying(false);
      onEnded?.();
    });

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audio, onEnded]);

  const togglePlay = async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    await audio.play();
  };

  const skipForward = async () => {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    if (!playing) await audio.play();
  };

  const skipBack = async () => {
    audio.currentTime = Math.max(0, audio.currentTime - 30);
    if (!playing) await audio.play();
  };

  const progress = duration ? Math.min(1, Math.max(0, current / duration)) : 0;

  const setFromClick = async (pct: number) => {
    if (!duration) return;
    audio.currentTime = pct * duration;
    if (!playing) await audio.play();
  };

  return (
    <div className="playerBar">
      <div className="playerBar__buttons">
        <button type="button" className="playerIconBtn" onClick={skipBack}>
          <AiOutlineBackward aria-hidden />
        </button>

        <button type="button" className="playerPlayBtn" onClick={togglePlay}>
          {busy ? (
            <AiOutlineLoading3Quarters className="spin" />
          ) : playing ? (
            <AiOutlinePause />
          ) : (
            <AiOutlineCaretRight />
          )}
        </button>

        <button type="button" className="playerIconBtn" onClick={skipForward}>
          <AiOutlineForward aria-hidden />
        </button>
      </div>

      <div className="playerBar__timeline">
        <input
          className="playerRange"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => setFromClick(Number(e.target.value))}
        />
        <div className="playerTimeRow">
          <span>{formatSeconds(current)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>
    </div>
  );
}
