import React, { useState, useRef } from "react";

// ==== CONFIG ====
const OPENAI_API_KEY = "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";

// ==== COMPONENT ====
export default function App() {
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [log, setLog] = useState([]);
  const recognitionRef = useRef(null);

  // === Speech Recognition Setup ===
  const getRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported in this browser.");
      return null;
    }
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;
    }
    return recognitionRef.current;
  };

  // === Handling Voice Input ===
  const startListening = () => {
    setUserText("");
    setAiReply("");
    const recognition = getRecognition();
    if (!recognition) return;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setUserText(text);
      getAIResponse(text);
      setListening(false);
    };

    recognition.onerror = (event) => {
      alert("Voice error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  // === Get AI Response ===
  const getAIResponse = async (userText) => {
    setAiReply("...");
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userText }],
          max_tokens: 100,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "No reply.";
      setAiReply(reply);
      speak(reply);
      setLog((prev) => [...prev, { user: userText, ai: reply }]);
    } catch {
      setAiReply("Error contacting AI.");
    }
  };

  // === Speak the AI Response ===
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      alert("SpeechSynthesis not supported!");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    synth.speak(utter);
  };

  // === UI ===
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: 380,
        background: "#fff",
        borderRadius: 20,
        padding: "32px 28px 18px 28px",
        boxShadow: "0 8px 36px 0 rgba(30,60,114,0.15)"
      }}>
        <h2 style={{ textAlign: "center", color: "#214082", fontWeight: 700, marginBottom: 8 }}>
          Crystal Voice AI Demo
        </h2>
        <div style={{ textAlign: "center", margin: "32px 0 16px 0" }}>
          <button
            onClick={startListening}
            disabled={listening}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "none",
              background: listening
                ? "radial-gradient(circle at 60% 40%, #4facfe, #00f2fe)"
                : "radial-gradient(circle at 60% 40%, #4facfe 75%, #00f2fe 100%)",
              boxShadow: listening
                ? "0 0 0 10px #00f2fe44, 0 0 0 20px #4facfe22"
                : "0 2px 10px 0 #21408222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              color: "#fff",
              outline: "none",
              transition: "box-shadow 0.3s"
            }}
          >
            <span style={{
              animation: listening ? "pulse 1s infinite" : "none",
              display: "inline-block"
            }}>
              <span role="img" aria-label="mic">🎤</span>
            </span>
          </button>
          <div style={{ marginTop: 10, color: "#214082", fontSize: 15 }}>
            {listening ? <b>Listening...</b> : "Click and speak"}
          </div>
        </div>

        <div style={{
          minHeight: 70,
          margin: "22px 0 11px 0",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {userText && (
            <div style={{
              alignSelf: "flex-end",
              background: "#e3edfa",
              color: "#214082",
              padding: "8px 14px",
              borderRadius: "16px 16px 2px 16px",
              maxWidth: "85%",
              fontSize: 15
            }}>
              <b>You:</b> {userText}
            </div>
          )}
          {aiReply && (
            <div style={{
              alignSelf: "flex-start",
              background: "#ffe9d2",
              color: "#7b4f13",
              padding: "8px 14px",
              borderRadius: "16px 16px 16px 2px",
              maxWidth: "85%",
              fontSize: 15
            }}>
              <b>AI:</b> {aiReply}
            </div>
          )}
        </div>

        <div style={{
          background: "#f6f8fa",
          borderRadius: 12,
          padding: "8px 12px",
          marginTop: 18,
          maxHeight: 110,
          overflowY: "auto",
          fontSize: 13
        }}>
          <b style={{ color: "#214082" }}>Conversation log:</b>
          <ul style={{ paddingLeft: 16, margin: "7px 0 0 0" }}>
            {log.slice(-5).map((entry, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <span style={{ color: "#214082" }}><b>You:</b></span> {entry.user}
                <br />
                <span style={{ color: "#7b4f13" }}><b>AI:</b></span> {entry.ai}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 18 }}>
          <span>Built for Crystal AI Generalist Challenge</span>
        </div>
      </div>
      {/* KEYFRAMES for button pulse */}
      <style>
        {`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 #00f2fe44; }
          70% { box-shadow: 0 0 0 20px #00f2fe00; }
          100% { box-shadow: 0 0 0 0 #00f2fe44; }
        }
        `}
      </style>
    </div>
  );
}