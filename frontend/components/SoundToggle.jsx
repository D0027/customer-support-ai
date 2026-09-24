export default function SoundToggle({ muted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-[11px] text-muted hover:text-paper transition-colors flex items-center justify-center"
      title={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}