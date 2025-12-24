import { BUTTON_COLORS } from '../config.js';

interface ReviewControlsProps {
  onBack: () => void;
  onToggleFlag: () => void;
  onForward: () => void;
  isFlagged: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export function ReviewControls({
  onBack,
  onToggleFlag,
  onForward,
  isFlagged,
  canGoBack,
  canGoForward,
}: ReviewControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <button onClick={onBack} disabled={!canGoBack} style={buttonStyle}>
        ← Back
      </button>
      <button
        onClick={onToggleFlag}
        style={{
          ...buttonStyle,
          backgroundColor: isFlagged ? BUTTON_COLORS.flag : BUTTON_COLORS.unflag,
          fontSize: '1.5rem',
        }}
      >
        {isFlagged ? '🔴 Unflag' : '🟢 Flag'}
      </button>
      <button onClick={onForward} disabled={!canGoForward} style={buttonStyle}>
        Forward →
      </button>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#007cbf',
  color: 'white',
  cursor: 'pointer',
};
