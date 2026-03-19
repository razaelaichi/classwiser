import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./App.css";

function exportToPDF(blocks, transcript) {
  const esc = (t) => t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const md = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>");

  const renderBlockHTML = (block) => {
    switch (block.type) {
      case "heading1":   return `<h1>${md(block.content)}</h1>`;
      case "heading2":   return `<h2>${md(block.content)}</h2>`;
      case "bullet":     return `<ul><li>${md(block.content)}</li></ul>`;
      case "blockquote": return `<blockquote>${md(block.content)}</blockquote>`;
      case "code":       return `<pre><code>${esc(block.content)}</code></pre>`;
      case "divider":    return `<hr/>`;
      default:           return block.content ? `<p>${md(block.content)}</p>` : "";
    }
  };

  const notesHTML = blocks.map(renderBlockHTML).join("\n");
  const transcriptHTML = transcript.trim()
    ? `<div class="section-divider"></div><h2>Transcript</h2><p class="transcript-body">${esc(transcript.trim())}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Classwiser Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13pt; line-height: 1.75; max-width: 680px; margin: 48px auto; color: #1c1c18; padding: 0 20px; }
    h1 { font-family: 'Fraunces', serif; font-size: 28pt; margin: 28px 0 8px; letter-spacing: -0.02em; }
    h2 { font-family: 'Fraunces', serif; font-size: 18pt; margin: 22px 0 6px; letter-spacing: -0.01em; }
    p  { margin: 0 0 12px; }
    ul { margin: 0 0 12px 22px; }
    li { margin-bottom: 4px; }
    blockquote { border-left: 3px solid #d4a853; padding-left: 16px; color: #555; font-style: italic; margin: 14px 0; }
    pre { background: #f5f4f0; border-radius: 6px; padding: 14px 18px; font-family: 'DM Mono', monospace; font-size: 10.5pt; overflow-x: auto; margin: 12px 0; }
    code { font-family: 'DM Mono', monospace; background: #f5f4f0; padding: 1px 5px; border-radius: 3px; font-size: 10.5pt; }
    pre code { background: none; padding: 0; }
    mark { background: #d4a85340; padding: 0 2px; border-radius: 2px; }
    hr, .section-divider { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
    .transcript-body { white-space: pre-wrap; color: #444; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
${notesHTML}
${transcriptHTML}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Pop-up blocked. Allow pop-ups and try again."); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

const BLOCK_TYPES = {
  TEXT: "text",
  CODE: "code",
  HEADING1: "heading1",
  HEADING2: "heading2",
  BULLET: "bullet",
  QUOTE: "blockquote",
  DIVIDER: "divider",
};

const BLOCK_LABELS = {
  text: "Paragraph",
  code: "Code",
  heading1: "Heading 1",
  heading2: "Heading 2",
  bullet: "Bullet",
  blockquote: "Quote",
  divider: "Divider",
};


function applyFormat(textarea, format) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  let replacement = selected;
  switch (format) {
    case "bold":          replacement = `**${selected}**`; break;
    case "italic":        replacement = `*${selected}*`; break;
    case "underline":     replacement = `<u>${selected}</u>`; break;
    case "highlight":     replacement = `==${selected}==`; break;
    case "strikethrough": replacement = `~~${selected}~~`; break;
    case "inline-code":   replacement = `\`${selected}\``; break;
    default: break;
  }
  const newVal =
    textarea.value.substring(0, start) +
    replacement +
    textarea.value.substring(end);
  return { newVal, cursor: start + replacement.length };
}

function renderContent(text) {
  if (!text) return null;
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>");
}


function Block({ block, index, total, onChange, onDelete, onAdd, onMove, onTypeChange }) {
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const textareaRef = useRef(null);

  const handleFormat = (format) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { newVal, cursor } = applyFormat(ta, format);
    onChange(block.id, newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(cursor, cursor); }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && block.type !== BLOCK_TYPES.CODE) {
      e.preventDefault();
      onAdd(index + 1);
    }
    if (e.key === "Backspace" && block.content === "" && total > 1) {
      e.preventDefault();
      onDelete(block.id);
    }
    if (e.key === "/" && block.content === "") {
      setShowTypePicker(true);
    }
  };

  const isTextLike = [BLOCK_TYPES.TEXT, BLOCK_TYPES.HEADING1, BLOCK_TYPES.HEADING2, BLOCK_TYPES.BULLET, BLOCK_TYPES.QUOTE].includes(block.type);

  return (
    <div className={`block block-${block.type}`} data-index={index}>
      <div className="block-gutter">
        <button className="gutter-btn drag-handle" title="Drag">::</button>
        <button className="gutter-btn add-btn" onClick={() => onAdd(index + 1)} title="Add block below">+</button>
      </div>

      <div className="block-body">
        <button
          className="type-badge"
          onClick={() => setShowTypePicker((s) => !s)}
          title="Change block type"
        >
          {block.type === BLOCK_TYPES.CODE ? "Code" :
           block.type === BLOCK_TYPES.HEADING1 ? "H1" :
           block.type === BLOCK_TYPES.HEADING2 ? "H2" :
           block.type === BLOCK_TYPES.BULLET ? "Bullet" :
           block.type === BLOCK_TYPES.QUOTE ? "Quote" :
           block.type === BLOCK_TYPES.DIVIDER ? "Divider" : "P"}
        </button>

        {showTypePicker && (
          <div className="type-picker">
            {Object.entries(BLOCK_LABELS).map(([type, label]) => (
              <button
                key={type}
                className={`type-option ${block.type === type ? "active" : ""}`}
                onClick={() => { onTypeChange(block.id, type); setShowTypePicker(false); }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {block.type === BLOCK_TYPES.DIVIDER ? (
          <div className="divider-block" />
        ) : (
          <>
            {isTextLike && (
              <div className={`format-bar ${showFormatBar ? "visible" : ""}`}>
                {[
                  { f: "bold", label: "B", title: "Bold (**text**)" },
                  { f: "italic", label: "I", title: "Italic (*text*)" },
                  { f: "underline", label: "U", title: "Underline" },
                  { f: "strikethrough", label: "S", title: "Strikethrough (~~text~~)" },
                  { f: "highlight", label: "H", title: "Highlight (==text==)" },
                  { f: "inline-code", label: "`", title: "Inline code" },
                ].map(({ f, label, title }) => (
                  <button key={f} className={`fmt-btn fmt-${f}`} title={title} onMouseDown={(e) => { e.preventDefault(); handleFormat(f); }}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              className={`block-input ${block.type}`}
              value={block.content}
              placeholder={
                block.type === BLOCK_TYPES.CODE ? "// paste or type code here..." :
                block.type === BLOCK_TYPES.HEADING1 ? "Heading 1" :
                block.type === BLOCK_TYPES.HEADING2 ? "Heading 2" :
                block.type === BLOCK_TYPES.BULLET ? "List item..." :
                block.type === BLOCK_TYPES.QUOTE ? "Quote or excerpt..." :
                "Type '/' for commands, or start writing..."
              }
              onFocus={() => setShowFormatBar(true)}
              onBlur={() => setTimeout(() => setShowFormatBar(false), 200)}
              onChange={(e) => onChange(block.id, e.target.value)}
              onKeyDown={handleKeyDown}
              rows={block.type === BLOCK_TYPES.CODE ? 6 : 2}
              spellCheck={block.type !== BLOCK_TYPES.CODE}
            />

            {isTextLike && block.content && (
              <div
                className={`block-preview ${block.type}`}
                dangerouslySetInnerHTML={{ __html: renderContent(block.content) }}
              />
            )}
          </>
        )}
      </div>

      <div className="block-actions">
        <button className="action-btn" onClick={() => onMove(index, -1)} disabled={index === 0} title="Move up">Up</button>
        <button className="action-btn" onClick={() => onMove(index, 1)} disabled={index === total - 1} title="Move down">Down</button>
        <button className="action-btn delete-btn" onClick={() => onDelete(block.id)} title="Delete block">Delete</button>
      </div>
    </div>
  );
}

let _id = 0;
const uid = () => `b${++_id}`;
const newBlock = (type = BLOCK_TYPES.TEXT) => ({ id: uid(), type, content: "" });

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [blocks, setBlocks] = useState([newBlock()]);
  const [recording, setRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [ttsLoading, setTtsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported in this browser."); return; }

    finalTranscriptRef.current = transcript;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += " " + result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setTranscript(
        (finalTranscriptRef.current + (interimText ? " " + interimText : "")).trimStart()
      );
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      if (e.error !== "no-speech") setRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    finalTranscriptRef.current = transcript;
    setRecording(false);
  };

  const playTTS = async () => {
    if (!transcript.trim()) { alert("Transcript is empty."); return; }
    setTtsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/tts", { text: transcript });
      new Audio(res.data.audioUrl).play();
    } catch (err) {
      alert("TTS Error: " + (err.response?.data?.error || err.message));
    } finally {
      setTtsLoading(false);
    }
  };

  const updateBlock = useCallback((id, content) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, content } : b)));
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks((bs) => bs.length > 1 ? bs.filter((b) => b.id !== id) : bs);
  }, []);

  const addBlock = useCallback((atIndex, type = BLOCK_TYPES.TEXT) => {
    setBlocks((bs) => {
      const copy = [...bs];
      copy.splice(atIndex, 0, newBlock(type));
      return copy;
    });
  }, []);

  const moveBlock = useCallback((index, dir) => {
    setBlocks((bs) => {
      const copy = [...bs];
      const target = index + dir;
      if (target < 0 || target >= copy.length) return bs;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }, []);

  const changeType = useCallback((id, type) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, type } : b)));
  }, []);

  const importTranscriptAsBlock = () => {
    if (!transcript.trim()) return;
    setBlocks((bs) => [...bs, { id: uid(), type: BLOCK_TYPES.QUOTE, content: transcript.trim() }]);
    setActiveTab("notes");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-text">Classwiser</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
            <span className="nav-icon"></span> Notes
          </button>
          <button className={`nav-item ${activeTab === "transcript" ? "active" : ""}`} onClick={() => setActiveTab("transcript")}>
            <span className="nav-icon"></span> Transcript
            {recording && <span className="rec-dot" />}
          </button>
        </nav>

        <div className="sidebar-section-label">Recording</div>
        <button
          className={`rec-btn ${recording ? "stop" : "start"}`}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? "Stop" : "Record"}
        </button>

        <div className="sidebar-section-label">Playback</div>
        <button className="tts-btn" onClick={playTTS} disabled={ttsLoading}>
          {ttsLoading ? "Generating..." : "Play Audio"}
        </button>

        <div className="sidebar-section-label">Export</div>
        <button className="pdf-btn" onClick={() => exportToPDF(blocks, transcript)}>
          Save as PDF
        </button>

        <div className="sidebar-section-label">Blocks</div>
        <div className="quick-add">
          {Object.entries(BLOCK_LABELS).map(([type, label]) => (
            <button key={type} className="quick-add-btn" onClick={() => addBlock(blocks.length, type)}>
              {label}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <span>{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            {activeTab === "notes" ? "Notes" : "Transcript"}
          </div>
          <div className="topbar-actions">
            {activeTab === "transcript" && (
              <button className="import-btn" onClick={importTranscriptAsBlock} title="Import transcript as a quote block in Notes">
                Import to Notes
              </button>
            )}
            <button className="topbar-pdf-btn" onClick={() => exportToPDF(blocks, transcript)} title="Export to PDF">
              PDF
            </button>
          </div>
        </header>

        <div className="content">
          {activeTab === "notes" && (
            <div className="editor">
              {blocks.map((block, i) => (
                <Block
                  key={block.id}
                  block={block}
                  index={i}
                  total={blocks.length}
                  onChange={updateBlock}
                  onDelete={deleteBlock}
                  onAdd={addBlock}
                  onMove={moveBlock}
                  onTypeChange={changeType}
                />
              ))}
              <button className="add-block-cta" onClick={() => addBlock(blocks.length)}>
                + Add block
              </button>
            </div>
          )}

          {activeTab === "transcript" && (
            <div className="transcript-panel">
              <div className="transcript-status">
                {recording
                  ? <><span className="rec-dot pulse" /> Listening...</>
                  : "Not recording"}
              </div>
              <textarea
                className="transcript-area"
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  if (!recording) finalTranscriptRef.current = e.target.value;
                }}
                placeholder="Transcript will appear here as you speak. You can also type or paste text manually."
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}