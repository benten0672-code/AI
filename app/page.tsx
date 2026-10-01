"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Provider = "openai" | "gemini";
type Message = { id: string; role: "user" | "assistant"; content: string; type?: "text" | "image" | "video" };

const quickActions = [
  { icon: "✦", title: "Create Image", description: "Generate artwork, characters & scenes", type: "image" },
  { icon: "▶", title: "Create Video", description: "Turn your ideas into cinematic video", type: "video" },
  { icon: "◈", title: "Write Anything", description: "Stories, manga, books & content", type: "chat" },
  { icon: "▣", title: "Analyze Files", description: "Upload documents and images", type: "file" },
];

function SidebarItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}><span className="sidebar-icon">{icon}</span><span>{label}</span></button>;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return <div className={`message-row ${isUser ? "message-row-user" : "message-row-ai"}`}>
    {!isUser && <div className="message-avatar">✦</div>}
    <div className={`message-bubble ${isUser ? "message-user" : "message-ai"}`}>
      {message.type === "image" && <div className="generated-media"><div className="media-placeholder"><span>✦</span><p>Generated Image</p></div></div>}
      {message.type === "video" && <div className="generated-media"><div className="media-placeholder video-placeholder"><span>▶</span><p>Video Generation</p></div></div>}
      <div className="message-text">{message.content}</div>
    </div>
  </div>;
}

function TypingIndicator() {
  return <div className="message-row message-row-ai"><div className="message-avatar">✦</div><div className="message-bubble message-ai typing-bubble"><span/><span/><span/></div></div>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("Chat");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [mediaLoading, setMediaLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function newChat() {
    setMessages([]);
    setInput("");
    setActiveSection("Chat");
    setMobileMenu(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function selectSection(section: string) {
    setActiveSection(section);
    setMobileMenu(false);
    if (section === "Chat") setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendMessage() {
    const message = input.trim();
    if (!message || loading) return;

    setMessages(current => [...current, { id: crypto.randomUUID(), role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          message,
          history: messages.map(item => ({ role: item.role, content: item.content }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate response.");
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || "The AI did not return a response."
      }]);
    } catch (error) {
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ ${error instanceof Error ? error.message : "Something went wrong."}`
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function createMedia(kind: "image" | "video") {
    const prompt = (kind === "image" ? imagePrompt : videoPrompt).trim();
    if (!prompt || mediaLoading) return;
    setMediaLoading(true);

    try {
      const response = await fetch(kind === "image" ? "/api/images" : "/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${kind} generation failed.`);

      setMessages(current => [...current,
        { id: crypto.randomUUID(), role: "user", content: prompt },
        { id: crypto.randomUUID(), role: "assistant", content: data.message || data.url || `${kind} generation request created.`, type: kind }
      ]);

      if (kind === "image") setImagePrompt("");
      else setVideoPrompt("");
      setActiveSection("Chat");
    } catch (error) {
      setMessages(current => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ ${error instanceof Error ? error.message : `${kind} generation failed.`}`
      }]);
    } finally {
      setMediaLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="nexora-shell">
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/><div className="ambient ambient-three"/>
      {mobileMenu && <div className="mobile-overlay" onClick={() => setMobileMenu(false)}/>}
      <aside className={`sidebar ${mobileMenu ? "sidebar-mobile-open" : ""}`}>
        <div className="brand"><div className="brand-mark">✦</div><div><div className="brand-name">NEXORA</div><div className="brand-subtitle">AI CREATIVE STUDIO</div></div></div>
        <button className="new-chat-button" onClick={newChat}><span>＋</span><span>New Chat</span></button>

        <div className="sidebar-section">
          <div className="sidebar-heading">WORKSPACE</div>
          <SidebarItem icon="⌂" label="Chat" active={activeSection === "Chat"} onClick={() => selectSection("Chat")}/>
          <SidebarItem icon="✦" label="Images" active={activeSection === "Images"} onClick={() => selectSection("Images")}/>
          <SidebarItem icon="▶" label="Videos" active={activeSection === "Videos"} onClick={() => selectSection("Videos")}/>
          <SidebarItem icon="◈" label="Projects" active={activeSection === "Projects"} onClick={() => selectSection("Projects")}/>
          <SidebarItem icon="▣" label="Files" active={activeSection === "Files"} onClick={() => selectSection("Files")}/>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">LIBRARY</div>
          <SidebarItem icon="◷" label="History" active={activeSection === "History"} onClick={() => selectSection("History")}/>
          <SidebarItem icon="♫" label="Voice" active={activeSection === "Voice"} onClick={() => selectSection("Voice")}/>
        </div>

        <div className="sidebar-bottom">
          <SidebarItem icon="⚙" label="Settings" active={activeSection === "Settings"} onClick={() => selectSection("Settings")}/>
          <div className="user-card"><div className="user-avatar">N</div><div className="user-info"><strong>Nexora User</strong><span>Personal Workspace</span></div><button className="more-button">•••</button></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(v => !v)}>☰</button>
          <div className="topbar-title"><span className="status-dot"/>Nexora AI</div>
          <div className="topbar-actions"><button className="top-icon-button" onClick={() => selectSection("Voice")}>♫</button><button className="top-icon-button" onClick={() => selectSection("Settings")}>⚙</button></div>
        </header>

        {activeSection === "Chat" && <>
          <div className="chat-scroll">
            {messages.length === 0 ? (
              <div className="welcome-container">
                <div className="welcome-orb"><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-core">✦</div></div>
                <div className="welcome-label">YOUR CREATIVE AI</div>
                <h1>What will you<br/><span>create today?</span></h1>
                <p>Chat, create, explore and build<br/>with your intelligent creative workspace.</p>
                <div className="quick-grid">{quickActions.map(action =>
                  <button key={action.title} className="quick-card" onClick={() => action.type === "image" ? selectSection("Images") : action.type === "video" ? selectSection("Videos") : action.type === "file" ? selectSection("Files") : inputRef.current?.focus()}>
                    <div className="quick-icon">{action.icon}</div><div className="quick-content"><strong>{action.title}</strong><span>{action.description}</span></div><span className="quick-arrow">→</span>
                  </button>
                )}</div>
              </div>
            ) : (
              <div className="messages-container">{messages.map(message => <MessageBubble key={message.id} message={message}/>)}{loading && <TypingIndicator/>}</div>
            )}
          </div>

          <div className="composer-area">
            <div className="composer">
              <button className="composer-action" onClick={() => selectSection("Files")}>＋</button>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message Nexora..." rows={1} disabled={loading}/>
              <div className="composer-right">
                <button className="provider-button" onClick={() => setShowProviderMenu(v => !v)}><span className="provider-dot"/>{provider === "openai" ? "OpenAI" : "Gemini"}⌄</button>
                {showProviderMenu && <div className="provider-menu">
                  <button onClick={() => { setProvider("openai"); setShowProviderMenu(false); }}>OpenAI {provider === "openai" && "✓"}</button>
                  <button onClick={() => { setProvider("gemini"); setShowProviderMenu(false); }}>Gemini {provider === "gemini" && "✓"}</button>
                </div>}
                <button className={`send-button ${input.trim() ? "send-button-active" : ""}`} onClick={sendMessage} disabled={!input.trim() || loading}>↑</button>
              </div>
            </div>
            <div className="composer-footer"><span>Nexora can make mistakes. Check important information.</span><span>ENTER ↵</span></div>
          </div>
        </>}

        {activeSection === "Images" && <div className="tool-page">
          <div className="tool-header"><div><div className="tool-eyebrow">CREATIVE STUDIO</div><h2>Create Images</h2><p>Turn your imagination into artwork, characters and scenes.</p></div><div className="tool-large-icon">✦</div></div>
          <div className="creation-panel"><textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="Describe the image you want to create..."/><div className="creation-footer"><span>Anime • Cinematic • Illustration • Artwork</span><button className="primary-create-button" onClick={() => createMedia("image")} disabled={!imagePrompt.trim() || mediaLoading}>{mediaLoading ? "Creating..." : "✦ Create Image"}</button></div></div>
        </div>}

        {activeSection === "Videos" && <div className="tool-page">
          <div className="tool-header"><div><div className="tool-eyebrow">CREATIVE STUDIO</div><h2>Create Videos</h2><p>Describe a scene and turn your idea into moving content.</p></div><div className="tool-large-icon">▶</div></div>
          <div className="creation-panel"><textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="Describe the video you want to create..."/><div className="creation-footer"><span>Cinematic • Anime • Storytelling • Animation</span><button className="primary-create-button" onClick={() => createMedia("video")} disabled={!videoPrompt.trim() || mediaLoading}>{mediaLoading ? "Creating..." : "▶ Create Video"}</button></div></div>
        </div>}

        {["Projects", "History", "Voice"].includes(activeSection) && <div className="empty-tool-page"><div className="empty-icon">{activeSection === "Projects" ? "◈" : activeSection === "History" ? "◷" : "♫"}</div><h2>{activeSection}</h2><p>Your {activeSection.toLowerCase()} workspace is ready for the next backend module.</p><button className="primary-create-button" onClick={newChat}>Return to Chat</button></div>}

        {activeSection === "Files" && <div className="empty-tool-page"><div className="empty-icon">▣</div><h2>Files</h2><p>Upload documents, images and other files to work with Nexora.</p><label className="upload-button">↑ Upload Files<input type="file" multiple hidden/></label></div>}

        {activeSection === "Settings" && <div className="settings-page"><div className="tool-eyebrow">NEXORA</div><h2>Settings</h2><div className="settings-card"><div><strong>AI Provider</strong><span>Select the provider used by Chat.</span></div><select value={provider} onChange={e => setProvider(e.target.value as Provider)}><option value="openai">OpenAI</option><option value="gemini">Gemini</option></select></div><div className="settings-card"><div><strong>Interface</strong><span>Futuristic Nexora workspace interface.</span></div><span className="settings-status">ACTIVE</span></div></div>}
      </section>
    </main>
  );
}
