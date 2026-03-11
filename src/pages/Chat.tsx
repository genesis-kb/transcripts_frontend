import { useState } from "react";
import { Send, Zap, FileText, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; link: string }[];
}

const sampleQuestions = [
  "What is Taproot and how does it improve Bitcoin?",
  "Explain the Erlay protocol for P2P relay",
  "How does AssumeUTXO speed up node sync?",
  "What are the privacy benefits of Mimblewimble?",
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on the transcript archive, here's what I found about "${question}":\n\nThis topic has been discussed across multiple conferences and podcasts. The key insights from speakers include technical details about implementation, security considerations, and the broader impact on the Bitcoin ecosystem.\n\nThe most relevant discussions come from Scaling Bitcoin and Bitcoin Edge Dev++ conferences, where developers presented detailed technical proposals and implementation progress.`,
        sources: [
          { title: "Simple Taproot Channels - Chaincode Podcast", link: "/transcript/taproot-channels" },
          { title: "Fraud Proofs - MIT Bitcoin Expo 2016", link: "/transcript/fraud-proofs" },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold mb-1">Chat with the Archive</h1>
        <p className="text-sm text-muted-foreground">Ask questions about Bitcoin transcripts. Answers are grounded in real transcript content.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-bitcoin">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold mb-2">What would you like to know?</h2>
            <p className="text-sm text-muted-foreground mb-6">Ask anything about Bitcoin technology from 1,251 transcripts</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="p-3 rounded-lg border border-border bg-card text-left text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <span className="font-mono text-xs text-primary font-bold">₿</span>
                    </div>
                    <div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{msg.content}</p>
                      {msg.sources && (
                        <div className="mt-3 space-y-1.5">
                          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Sources</span>
                          {msg.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.link}
                              className="flex items-center gap-2 text-xs text-signal hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              {src.title}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === "user" && <span className="text-sm">{msg.content}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-mono text-xs text-primary font-bold">₿</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/40"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-4">
        <div className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card shadow-lg">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about Bitcoin transcripts..."
            className="flex-1 bg-transparent text-sm px-3 py-2 outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
