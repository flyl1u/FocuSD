import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowRight, Check, Clipboard, Copy, Grip, Languages, Settings2, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./TranslationWindow.css";

type Direction = "auto" | "zh-en" | "en-zh";
type TranslationSettings = { shortcut: string; direction: Direction };
const STORAGE_KEY = "focusd-island-translation-settings";
const DEFAULT_SETTINGS: TranslationSettings = { shortcut: "Alt+C", direction: "auto" };

function loadSettings(): TranslationSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<TranslationSettings> | null;
    const shortcut = typeof stored?.shortcut === "string" ? stored.shortcut : DEFAULT_SETTINGS.shortcut;
    return {
      shortcut: shortcut === "Alt+Space" ? DEFAULT_SETTINGS.shortcut : shortcut,
      direction: stored?.direction === "zh-en" || stored?.direction === "en-zh" ? stored.direction : "auto",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function normalizeShortcut(event: KeyboardEvent<HTMLInputElement>) {
  if (["Control", "Alt", "Shift", "Meta"].includes(event.key)) return null;
  const modifiers = [event.ctrlKey && "Ctrl", event.altKey && "Alt", event.shiftKey && "Shift", event.metaKey && "Win"].filter(Boolean);
  if (!modifiers.length) return null;
  const key = event.key === " " || event.key === "Spacebar" ? "Space" : event.key.length === 1 ? event.key.toUpperCase() : event.key;
  return [...modifiers, key].join("+");
}

export default function TranslationWindow() {
  const [settings, setSettings] = useState<TranslationSettings>(loadSettings);
  const [input, setInput] = useState("");
  const [clipboardPreview, setClipboardPreview] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [shortcutError, setShortcutError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [secretDraft, setSecretDraft] = useState("");
  const [hasSecret, setHasSecret] = useState(false);
  const [savingSecret, setSavingSecret] = useState(false);
  const [didCopy, setDidCopy] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestId = useRef(0);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => {
    void invoke<boolean>("has_translation_secret").then(setHasSecret).catch((failure) => setError(String(failure)));
  }, []);
  useEffect(() => {
    void invoke<string>("set_translation_shortcut", { shortcut: settings.shortcut })
      .then(() => setShortcutError(""))
      .catch((failure) => setShortcutError(String(failure)));
    // Shortcut edits register immediately in the recording handler.
  }, []);

  const refreshClipboard = useCallback(() => {
    void invoke<string | null>("read_translation_clipboard")
      .then((text) => setClipboardPreview(text ?? ""))
      .catch(() => setClipboardPreview(""));
  }, []);

  const handleOpened = useCallback(() => {
    requestId.current += 1;
    setInput("");
    setOutput("");
    setError("");
    setDidCopy(false);
    setIsLoading(false);
    setShowConfig(false);
    refreshClipboard();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [refreshClipboard]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let didCancel = false;
    void listen("translation-window-opened", handleOpened).then((nextUnlisten) => {
      if (didCancel) nextUnlisten();
      else unlisten = nextUnlisten;
    });
    void getCurrentWindow().isVisible().then((visible) => {
      if (!didCancel && visible) handleOpened();
    });
    return () => { didCancel = true; unlisten?.(); };
  }, [handleOpened]);

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text) { setError("请输入原文，或按 Tab 填入剪贴板内容。"); return; }
    if (Array.from(text).length > 5000) { setError("单次最多翻译 5000 个字符。"); return; }
    const currentId = ++requestId.current;
    setError("");
    setOutput("");
    setIsLoading(true);
    try {
      const translated = await invoke<string>("translate_text", { text, direction: settings.direction });
      if (currentId === requestId.current) setOutput(translated);
    } catch (failure) {
      if (currentId === requestId.current) setError(String(failure));
    } finally {
      if (currentId === requestId.current) setIsLoading(false);
    }
  }, [input, settings.direction]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab" && !event.shiftKey && !input && clipboardPreview) {
      event.preventDefault();
      setInput(clipboardPreview);
      setError("");
    } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  const saveSecret = async () => {
    if (!secretDraft.trim()) return;
    setSavingSecret(true);
    try {
      await invoke("save_translation_secret", { secret: secretDraft });
      setSecretDraft("");
      setHasSecret(true);
      setError("");
    } catch (failure) { setError(String(failure)); }
    finally { setSavingSecret(false); }
  };

  const removeSecret = async () => {
    try {
      await invoke("delete_translation_secret");
      setHasSecret(false);
      setSecretDraft("");
    } catch (failure) { setError(String(failure)); }
  };

  const copyResult = async () => {
    if (!output) return;
    try {
      await invoke("copy_translation_result", { text: output });
      setDidCopy(true);
    } catch (failure) { setError(String(failure)); }
  };

  const close = () => { requestId.current += 1; void invoke("hide_translation_window"); };
  const startWindowDrag = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    void getCurrentWindow().startDragging().catch((failure) => console.error("Cannot drag translation window", failure));
  };
  const startResize = (event: PointerEvent<HTMLDivElement>, direction: "East" | "South" | "SouthEast") => {
    if (event.button !== 0) return;
    event.stopPropagation();
    void getCurrentWindow().startResizeDragging(direction)
      .catch((failure) => console.error("Cannot resize translation window", failure));
  };

  return (
    <main className="translation-stage">
      <section className="translation-window" aria-label="DeepSeek 快捷翻译">
        <header className="translation-window__header" onPointerDown={startWindowDrag}>
          <span className="translation-window__mark" aria-hidden="true"><Languages size={20} /></span>
          <div className="translation-window__heading"><h1>快捷翻译</h1><span>由 DeepSeek 提供 · 中英互译</span></div>
          <span className="translation-window__shortcut">{settings.shortcut}</span>
          <div className="translation-window__actions">
            <button type="button" title="翻译设置" aria-label="翻译设置" aria-pressed={showConfig} onClick={() => setShowConfig((value) => !value)}><Settings2 size={18} /></button>
            <button type="button" title="关闭" aria-label="关闭翻译窗口" onClick={close}><X size={18} /></button>
          </div>
        </header>

        {showConfig ? (
          <section className="translation-window__config">
            <div className="translation-window__section-heading"><h2>翻译设置</h2><p>密钥只保存在本机 Windows 凭据管理器</p></div>
            <label className="translation-window__field"><span>DeepSeek API 密钥 {hasSecret && <em>已保存</em>}</span>
              <input type="password" autoComplete="off" value={secretDraft} onChange={(event) => setSecretDraft(event.target.value)} placeholder={hasSecret ? "输入新密钥以替换" : "输入 DeepSeek API 密钥"} />
            </label>
            <div className="translation-window__config-actions">
              <button type="button" className="translation-window__primary" onClick={() => void saveSecret()} disabled={!secretDraft.trim() || savingSecret}>保存密钥</button>
              {hasSecret && <button type="button" className="translation-window__secondary" onClick={() => void removeSecret()}>删除已保存密钥</button>}
            </div>
            <label className="translation-window__field"><span>全局快捷键</span>
              <input readOnly value={recordingShortcut ? "请按下组合键…" : settings.shortcut} onFocus={() => setRecordingShortcut(true)} onBlur={() => setRecordingShortcut(false)} onKeyDown={(event) => {
                event.preventDefault();
                if (event.key === "Escape") { setRecordingShortcut(false); event.currentTarget.blur(); return; }
                const shortcut = normalizeShortcut(event);
                if (!shortcut) return;
                const field = event.currentTarget;
                void invoke<string>("set_translation_shortcut", { shortcut })
                  .then((registered) => { setSettings((current) => ({ ...current, shortcut: registered })); setShortcutError(""); setRecordingShortcut(false); field.blur(); })
                  .catch((failure) => setShortcutError(String(failure)));
              }} />
              <small>点击输入框，再按新的组合键</small>
            </label>
            {(shortcutError || error) && <p className="translation-window__error" role="alert">{shortcutError || error}</p>}
          </section>
        ) : (
          <>
            <div className="translation-window__toolbar">
              <span className="translation-window__provider"><span className="translation-window__provider-dot" />DeepSeek AI</span>
              <label htmlFor="translation-direction">翻译方向</label>
              <select id="translation-direction" value={settings.direction} onChange={(event) => setSettings({ ...settings, direction: event.target.value as Direction })}>
                <option value="auto">自动识别</option><option value="zh-en">中文 → 英文</option><option value="en-zh">英文 → 中文</option>
              </select>
            </div>
            <div className="translation-window__content">
              <section className="translation-window__panel translation-window__source">
                <div className="translation-window__panel-heading"><h2>原文</h2><span>最多 5,000 字</span></div>
                <textarea id="translation-input" ref={inputRef} value={input} onChange={(event) => { setInput(event.target.value); setError(""); setDidCopy(false); }} onKeyDown={handleInputKeyDown} placeholder="输入文本，或按 Tab 填入最新复制内容" />
                {!input && clipboardPreview && <button type="button" className="translation-window__clipboard" onClick={() => { setInput(clipboardPreview); inputRef.current?.focus(); }} title="填入剪贴板内容"><Clipboard size={14} /><span>剪贴板：{clipboardPreview.slice(0, 120)}</span><kbd>Tab</kbd></button>}
              </section>
              <section className="translation-window__panel translation-window__target">
                <div className="translation-window__panel-heading"><h2>译文</h2><button type="button" className="translation-window__copy" onClick={() => void copyResult()} disabled={!output} title="复制译文" aria-label="复制译文">{didCopy ? <Check size={16} /> : <Copy size={16} />}</button></div>
                <div className={`translation-window__result ${output ? "translation-window__result--filled" : ""}`} aria-live="polite">{output || (isLoading ? "正在翻译…" : "译文会显示在这里")}</div>
              </section>
            </div>
            <footer className="translation-window__footer">
              <div className="translation-window__footer-info">{error ? <span className="translation-window__error" role="alert">{error}</span> : !hasSecret ? <button type="button" className="translation-window__setup" onClick={() => setShowConfig(true)}>配置 DeepSeek 密钥</button> : <span>Enter 翻译 · Shift+Enter 换行</span>}</div>
              <button type="button" className="translation-window__primary translation-window__translate" onClick={() => void submit()} disabled={isLoading}>翻译 <ArrowRight size={16} /></button>
            </footer>
          </>
        )}
        <div className="translation-window__resize translation-window__resize--east" onPointerDown={(event) => startResize(event, "East")} aria-hidden="true" />
        <div className="translation-window__resize translation-window__resize--south" onPointerDown={(event) => startResize(event, "South")} aria-hidden="true" />
        <div className="translation-window__resize translation-window__resize--corner" onPointerDown={(event) => startResize(event, "SouthEast")} aria-hidden="true"><Grip size={12} /></div>
      </section>
    </main>
  );
}
