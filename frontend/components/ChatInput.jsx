import { useState, useRef, useEffect } from "react";
import { uploadFile } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function ChatInput({ onSend, disabled, droppedFile, onDroppedFileHandled }) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setVoiceSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);



  useEffect(() => {
  if (droppedFile) {
    handleFileSelect({ target: { files: [droppedFile], value: "" } });
    onDroppedFileHandled?.();
  }
}, [droppedFile]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setAttachment({ filename: result.filename, description: result.description });
    } catch (err) {
      setAttachment({ filename: file.name, description: null, failed: true });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = () => setAttachment(null);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    onSend(text || "What do you see in this image?", attachment);
    setText("");
    setAttachment(null);
  };

  return (
    <div className="bg-panel border-t border-line">
      {attachment && (
        <div className="px-3 pt-3 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-graphite border border-line rounded-lg px-3 py-1.5 text-xs">
            <span>{attachment.failed ? "⚠️" : "🖼️"}</span>
            <span className="text-paper truncate max-w-[180px]">{attachment.filename}</span>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-muted hover:text-danger transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 p-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.txt,.docx"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-11 h-11 shrink-0 rounded-chat border border-line hover:border-signalBright btn-press flex items-center justify-center text-lg transition-all disabled:opacity-30"
          title="Attach a file"
        >
          {uploading ? "…" : "📎"}
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={listening ? t("listening") : attachment ? t("askAboutImage") : t("askPlaceholder")}
          className="flex-1 px-4 py-3 rounded-chat bg-graphite border border-line text-paper text-[14.5px] outline-none focus:border-signalBright focus:shadow-glow transition-all placeholder:text-muted"
          disabled={disabled}
        />

        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={disabled}
            className={`w-11 h-11 shrink-0 rounded-chat border btn-press flex items-center justify-center text-lg transition-all disabled:opacity-30 ${
              listening ? "border-danger bg-danger/10 status-pulse" : "border-line hover:border-signalBright"
            }`}
            title={listening ? "Stop listening" : "Speak your message"}
          >
            🎤
          </button>
        )}

        <button
          type="submit"
          disabled={disabled || (!text.trim() && !attachment)}
          className="px-5 py-3 rounded-chat bg-signal text-paper text-sm font-medium disabled:opacity-30 hover:bg-signalBright btn-press hover-lift transition-all"
        >
          {t("send")}
        </button>
      </form>
    </div>
  );
}