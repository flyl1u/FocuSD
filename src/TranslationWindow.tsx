import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, Clipboard, Copy, Languages, Settings2, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./TranslationWindow.css";

type Provider = "baidu" | "deepseek";
type Direction = "auto" | "zh-en" | "en-zh";
type TranslationSettings = {
  provider: Provider;
  appId: string;
  shortcut: string;
  direction: Direction;
};

const STORAGE_KEY = "focusd-island-translation-settings";
const DEFAULT_SETTINGS: TranslationSettings = {
  provider: "baidu",
  appId: "",
  shortcut: "Alt+Space",
  direction: "auto",
};

function loadSettings(): TranslationSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<TranslationSettings> | null;
    return {
      provider: stored?.provider === "deepseek" ? "deepseek" : "baidu",
      appId: typeof stored?.appId === "string" ? stored.appId : "",
      shortcut: typeof stored?.shortcut === "string" ? stored.shortcut : "Alt+Space",
      direction: stored?.direction === "zh-en" || stored?.direction === "en-zh" ? stored.direction : "auto",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function normalizeShortcut(event: KeyboardEvent<HTMLInputElement>) {
  if (["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
    return null;
  }
  const modifiers = [
    event.ctrlKey && "Ctrl",
    event.altKey && "Alt",
    event.shiftKey && "Shift",
    event.metaKey && "Win",
  ].filter(Boolean);
  if (!modifiers.length) {
    return null;
  }
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    void invoke<boolean>("has_translation_secret", { provider: settings.provider })
      .then(setHasSecret)
      .catch((failure) => setError(String(failure)));
  }, [settings.provider]);

  useEffect(() => {
    void invoke<string>("set_translation_shortcut", { shortcut: settings.shortcut })
      .then(() => setShortcutError(""))
      .catch((failure) => setShortcutError(String(failure)));
    // The binding is also updated immediately in the shortcut recording handler.
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
    return () => {
      didCancel = true;
      unlisten?.();
    };
  }, [handleOpened]);

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text) {
      setError("请输入要翻译的内容，或按 Tab 填入剪贴板文本。");
      return;
    }
    if (Array.from(text).length > 5000) {
      setError("单次最多翻译 5000 个字符。");
      return;
    }
    const currentId = ++requestId.current;
    setError("");
    setOutput("");
    setIsLoading(true);
    try {
      const translated = await invoke<string>("translate_text", {
        provider: settings.provider,
        appId: settings.provider === "baidu" ? settings.appId : null,
        text,
        direction: settings.direction,
      });
      if (currentId === requestId.current) setOutput(translated);
    } catch (failure) {
      if (currentId === requestId.current) setError(String(failure));
    } finally {
      if (currentId === requestId.current) setIsLoading(false);
    }
  }, [input, settings]);

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
      await invoke("save_translation_secret", { provider: settings.provider, secret: secretDraft });
      setSecretDraft("");
      setHasSecret(true);
      setError("");
    } catch (failure) {
      setError(String(failure));
    } finally {
      setSavingSecret(false);
    }
  };

  const removeSecret = async () => {
    try {
      await invoke("delete_translation_secret", { provider: settings.provider });
      setHasSecret(false);
      setSecretDraft("");
    } catch (failure) {
      setError(String(failure));
    }
  };

  const copyResult = async () => {
    if (!output) return;
    try {
      await invoke("copy_translation_result", { text: output });
      setDidCopy(true);
    } catch (failure) {
      setError(String(failure));
    }
  };

  const close = () => {
    requestId.current += 1;
    void invoke("hide_translation_window");
  };

  return (
    <main className="translation-window">
      <header className="translation-window__header">
        <span className="translation-window__title"><Languages size={20} /> 快捷翻译</span>
        <div className="translation-window__actions">
          <button type="button" title="翻译设置" aria-label="翻译设置" onClick={() => setShowConfig(!showConfig)}><Settings2 size={18} /></button>
          <button type="button" title="关闭" aria-label="关闭翻译窗口" onClick={close}><X size={18} /></button>
        </div>
      </header>
      <div className="translation-window__toolbar">
        <label>翻译服务
          <select value={settings.provider} onChange={(event) => { setSettings({ ...settings, provider: event.target.value as Provider }); setSecretDraft(""); setOutput(""); }}>
            <option value="baidu">百度翻译</option>
            <option value="deepseek">DeepSeek AI</option>
          </select>
        </label>
        <label>方向
          <select value={settings.direction} onChange={(event) => setSettings({ ...settings, direction: event.target.value as Direction })}>
            <option value="auto">自动识别</option>
            <option value="zh-en">中 → 英</option>
            <option value="en-zh">英 → 中</option>
          </select>
        </label>
      </div>
      {showConfig ? (
        <section className="translation-window__config">
          <p>{settings.provider === "baidu" ? "填写百度翻译开放平台的 APP ID 和密钥。" : "填写 DeepSeek API 密钥，使用 deepseek-flash 模型。"}</p>
          {settings.provider === "baidu" && (
            <label>APP ID
              <input value={settings.appId} onChange={(event) => setSettings({ ...settings, appId: event.target.value.trim() })} placeholder="百度翻译 APP ID" />
            </label>
          )}
          <label>API 密钥 {hasSecret && <span className="translation-window__saved">已保存</span>}
            <input type="password" autoComplete="off" value={secretDraft} onChange={(event) => setSecretDraft(event.target.value)} placeholder="密钥保存在 Windows 凭据管理器" />
          </label>
          <div className="translation-window__config-actions">
            <button type="button" onClick={() => void saveSecret()} disabled={!secretDraft.trim() || savingSecret}>保存密钥</button>
            {hasSecret && <button type="button" onClick={() => void removeSecret()}>删除密钥</button>}
          </div>
          <label>全局快捷键
            <input
              readOnly
              value={recordingShortcut ? "请按下组合键…" : settings.shortcut}
              onFocus={() => setRecordingShortcut(true)}
              onBlur={() => setRecordingShortcut(false)}
              onKeyDown={(event) => {
                event.preventDefault();
                if (event.key === "Escape") { setRecordingShortcut(false); event.currentTarget.blur(); return; }
                const shortcut = normalizeShortcut(event);
                if (!shortcut) return;
                const field = event.currentTarget;
                void invoke<string>("set_translation_shortcut", { shortcut })
                  .then((registered) => { setSettings((current) => ({ ...current, shortcut: registered })); setShortcutError(""); setRecordingShortcut(false); field.blur(); })
                  .catch((failure) => setShortcutError(String(failure)));
              }}
            />
          </label>
          {shortcutError && <p className="translation-window__error">{shortcutError}</p>}
        </section>
      ) : (
        <>
          <div className="translation-window__body">
            <label htmlFor="translation-input">原文</label>
            <textarea id="translation-input" ref={inputRef} value={input} onChange={(event) => { setInput(event.target.value); setError(""); }} onKeyDown={handleInputKeyDown} placeholder="输入文本，或按 Tab 填入最新复制内容" />
            {!input && clipboardPreview && <div className="translation-window__clipboard"><Clipboard size={14} /><span>剪贴板：{clipboardPreview.slice(0, 120)}</span><kbd>Tab</kbd></div>}
            <div className="translation-window__submit"><span>Enter 翻译 · Shift+Enter 换行</span><button type="button" onClick={() => void submit()} disabled={isLoading}>{isLoading ? "翻译中…" : "翻译"}</button></div>
            <div className="translation-window__result-heading"><span>译文</span><button type="button" onClick={() => void copyResult()} disabled={!output} title="复制译文">{didCopy ? <Check size={15} /> : <Copy size={15} />}</button></div>
            <div className="translation-window__result" aria-live="polite">{output || (error ? <span className="translation-window__error">{error}</span> : "译文会显示在这里")}</div>
          </div>
          {!hasSecret && <button className="translation-window__setup" type="button" onClick={() => setShowConfig(true)}>配置 {settings.provider === "baidu" ? "百度翻译" : "DeepSeek"} 密钥</button>}
        </>
      )}
    </main>
  );
}
