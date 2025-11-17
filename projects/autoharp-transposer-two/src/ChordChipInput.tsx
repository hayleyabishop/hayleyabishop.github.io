
import React, { useEffect, useRef, useState } from "react";
import { normalizeChordInput } from "chord-utils";
import { useChordSuggestions } from "./useChordSuggestions";

/**
 * ChordChipInput
 * - Token/Chip input with voice-friendly “drive-thru” confirmations
 * - Parses simple typed/dictated commands: "undo", "delete", "no"
 * - Accessible: ARIA live announcements, keyboard navigation, focus management
 */
export default function ChordChipInput() {
  const [chips, setChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lastKeydownTs, setLastKeydownTs] = useState(0);
  const [lastValueLen, setLastValueLen] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const BIG_DELTA = 15;
  const NO_KEYDOWN_WINDOW = 1200;
  const DICTATION_PAUSE = 700;
  let pauseTimer: number | undefined;

  const announce = (msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = msg;
    }
  };

  const currentToken = (() => {
    const parts = inputValue.split(/(?:\s|,)+/).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  })();

  const suggestions = useChordSuggestions(currentToken, 5);

  const normalizeChord = (raw: string) => {
    if (!raw) return "";
    // Keep dictation/filler cleanup, then delegate to shared utils
    let t = raw.toLowerCase().trim();
    t = t.replace(/\b(u+h+|um+m+|erm+|ah+|uhh+)\b/gi, " ").trim();
    t = t.replace(/\s{2,}/g, " ").trim();
    const normalized = normalizeChordInput(t);
    return normalized || "";
  };

  const isUndoCommand = (s: string) => {
    const t = s.trim().toLowerCase();
    return (
      t === "undo" ||
      t === "undo that" ||
      t === "delete" ||
      t === "delete last" ||
      t === "delete previous" ||
      t === "remove" ||
      t === "remove last" ||
      t === "remove previous" ||
      t === "no"
    );
  };

  const removeLastChip = () => {
    setChips((prev) => {
      if (prev.length === 0) return prev;
      const removed = prev[prev.length - 1];
      const next = prev.slice(0, -1);
      announce(`Removed last chord: ${removed}. Total ${next.length}.`);
      return next;
    });
    inputRef.current?.focus();
  };

  const addChip = (raw: string) => {
    const cleaned = normalizeChord(raw);
    if (!cleaned) return;
    setChips((prev) => {
      const next = [...prev, cleaned];
      announce(`Added chord: ${cleaned}. Total ${next.length}.`);
      return next;
    });
  };

  const tryCommitTokens = (forceAll = false) => {
    let val = inputValue;
    if (isUndoCommand(val)) {
      removeLastChip();
      setInputValue("");
      return;
    }
    const parts = val.split(/(?:\s|,)+/).filter(Boolean);
    if (parts.length === 0) return;
    const endsWithDelimiter = /(?:\s|,)+$/.test(val);
    const toCommit = forceAll || endsWithDelimiter ? parts : parts.slice(0, -1);
    const remainder = forceAll || endsWithDelimiter ? "" : parts[parts.length - 1];
    if (toCommit.length) {
      toCommit.forEach(addChip);
      setInputValue(remainder);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const now = Date.now();
    const delta = newVal.length - lastValueLen;
    const noRecentTyping = now - lastKeydownTs > NO_KEYDOWN_WINDOW;
    const likelyDictation = delta >= BIG_DELTA && noRecentTyping;
    setInputValue(newVal);
    setLastValueLen(newVal.length);
    if (/[,\s]$/.test(newVal)) {
      tryCommitTokens(false);
    }
    window.clearTimeout(pauseTimer);
    if (likelyDictation) {
      pauseTimer = window.setTimeout(() => tryCommitTokens(true), DICTATION_PAUSE);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setLastKeydownTs(Date.now());
    if (e.key === "Enter") {
      e.preventDefault();
      tryCommitTokens(true);
      return;
    }
    if (e.key === "Backspace" && inputValue.trim().length === 0 && chips.length) {
      // When the input is empty, Backspace behaves like "undo last chord"
      e.preventDefault();
      removeLastChip();
      return;
    }
    if (e.key === "ArrowLeft" && inputRef.current?.selectionStart === 0 && chips.length) {
      e.preventDefault();
      chipRefs.current[chips.length - 1]?.focus();
    }
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "z") {
      e.preventDefault();
      removeLastChip();
    }
  };

  const onChipKeyDown = (idx: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const lastIndex = chips.length - 1;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : lastIndex;
      chipRefs.current[prev]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (idx < lastIndex) {
        chipRefs.current[idx + 1]?.focus();
      } else {
        inputRef.current?.focus();
      }
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const removed = chips[idx];
      setChips((prev) => prev.filter((_, i) => i !== idx));
      announce(`Removed chord: ${removed}. Total ${chips.length - 1}.`);
      const nextBtn = chipRefs.current[idx] || chipRefs.current[idx - 1] || null;
      (nextBtn || inputRef.current)?.focus();
    }
  };

  return (
    <div className="max-w-xl">
      <label htmlFor="chordInput" className="block text-sm font-medium mb-1">
        Chord progression
      </label>
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-indigo-500"
        role="group"
        aria-labelledby="chordHelp"
      >
        {chips.map((c, i) => (
          <button
            key={`${c}-${i}`}
            ref={(el) => (chipRefs.current[i] = el)}
            className="chip inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={`Chord chip ${c}. Press Delete to remove.`}
            onKeyDown={onChipKeyDown(i)}
            onClick={() => {
              setChips((prev) => prev.filter((_, idx) => idx !== i));
              announce(`Removed chord: ${c}. Total ${chips.length - 1}.`);
              inputRef.current?.focus();
            }}
          >
            <span aria-hidden="true">{c}</span>
            <span aria-hidden="true">×</span>
          </button>
        ))}
        <input
          id="chordInput"
          ref={inputRef}
          type="text"
          className="min-w-[10ch] flex-1 border-0 focus:outline-none text-sm py-1"
          placeholder="Type or dictate a chord…"
          aria-describedby="chordHelp"
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600" aria-live="polite">
          <span>Suggestions:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              className="rounded-full border border-gray-300 px-2 py-0.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => {
                addChip(sug);
                setInputValue("");
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}
      <div id="chordHelp" className="sr-only">
        Type or dictate a chord and press Space, Comma, or Enter to add it.
        Say “undo”, “delete”, or “no” to remove the last chord. Use left and
        right arrows to move between chips. Press Delete to remove a focused chip.
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Undo last chord"
          onClick={removeLastChip}
        >
          Undo last chord
        </button>
        <span className="text-xs text-gray-500">
          Tip: Voice users can say “Undo”, “Undo that”, or “Delete last”.
        </span>
      </div>
      <div ref={liveRef} aria-live="polite" className="sr-only" />
    </div>
  );
}
