import { useRef, useEffect } from "react";
import { BUTTON_COLORS } from "../config.js";

interface ReviewControlsProps {
  onBack: () => void;
  onToggleFlag: () => void;
  onForward: () => void;
  isFlagged: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  noteOpen: boolean;
  noteValue: string;
  noteSubmitted: boolean;
  onNoteChange: (value: string) => void;
  onNoteSubmit: () => void;
}

export function ReviewControls({
  onBack,
  onToggleFlag,
  onForward,
  isFlagged,
  canGoBack,
  canGoForward,
  noteOpen,
  noteValue,
  noteSubmitted,
  onNoteChange,
  onNoteSubmit,
}: ReviewControlsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (noteOpen && !noteSubmitted && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [noteOpen, noteSubmitted]);

  return (
    <div
      data-testid="review-controls"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={onBack}
          disabled={!canGoBack}
          style={buttonStyle}
          data-testid="btn-back"
          aria-label="btn-back"
        >
          Back [&#8592;]
        </button>
        <button
          onClick={onToggleFlag}
          data-testid="btn-flag"
          aria-label={isFlagged ? "btn-unflag" : "btn-flag"}
          style={{
            ...buttonStyle,
            backgroundColor: isFlagged
              ? BUTTON_COLORS.flag
              : BUTTON_COLORS.unflag,
            fontSize: "1.5rem",
          }}
        >
          {isFlagged ? "🔴 Unflag [↓]" : "🟢 Flag [↑]"}
        </button>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          style={buttonStyle}
          data-testid="btn-forward"
          aria-label="btn-forward"
        >
          Forward [&#8594;]
        </button>
      </div>
      {noteOpen && (
        <div style={{ width: "100%", maxWidth: 500 }}>
          <textarea
            ref={textareaRef}
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            disabled={noteSubmitted}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                onNoteSubmit();
              }
            }}
            placeholder="Type a note... (Shift+Enter to submit)"
            data-testid="note-input"
            aria-label="note-input"
            style={{
              width: "100%",
              minHeight: 60,
              padding: "0.5rem",
              fontSize: "0.875rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "vertical",
              opacity: noteSubmitted ? 0.6 : 1,
              boxSizing: "border-box",
            }}
          />
          {noteSubmitted && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#666",
                marginTop: "0.25rem",
              }}
            >
              Note saved
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  fontSize: "1rem",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#007cbf",
  color: "white",
  cursor: "pointer",
};
