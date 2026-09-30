import React, { useState, useEffect, useRef } from "react";
import { Send, LogOut, MessageSquare, Hash } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
}

export default function App() {
  const [roomId, setRoomId] = useState<string>("");
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const text = event.data;
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          text,
          sender: "other",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        type: "join",
        payload: {
          roomId: roomId.trim(),
        },
      })
    );

    setJoinedRoom(roomId.trim());
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socketRef.current) return;

    const messageText = messageInput.trim();

    socketRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: messageText,
        },
      })
    );

    setMessageInput("");
  };

  const handleLeaveRoom = () => {
    setJoinedRoom(null);
    setMessages([]);
    setRoomId("");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* State 1: Join Room Form */}
      {!joinedRoom ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#111111",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
              border: "1px solid #222222",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <MessageSquare style={{ width: "28px", height: "28px", color: "#ffffff" }} />
              <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" }}>
                Join Room
              </h1>
            </div>

            <form onSubmit={handleJoinRoom} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#888888",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Room Identifier
                </label>
                <div style={{ position: "relative" }}>
                  <Hash
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "18px",
                      height: "18px",
                      color: "#666666",
                    }}
                  />
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="e.g. general, dev-team"
                    style={{
                      width: "100%",
                      backgroundColor: "#000000",
                      border: "1px solid #333333",
                      borderRadius: "10px",
                      padding: "12px 16px 12px 40px",
                      color: "#ffffff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isConnected}
                style={{
                  width: "100%",
                  backgroundColor: isConnected ? "#ffffff" : "#222222",
                  color: isConnected ? "#000000" : "#666666",
                  fontWeight: "600",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: isConnected ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                }}
              >
                {isConnected ? "Connect & Join" : "Connecting to Server..."}
              </button>
            </form>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isConnected ? "#ffffff" : "#444444",
                }}
              />
              <span style={{ fontSize: "12px", color: "#888888" }}>
                {isConnected ? "Server Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* State 2: Active Chat Interface */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "896px",
            margin: "0 auto",
            height: "100%",
            borderLeft: "1px solid #1a1a1a",
            borderRight: "1px solid #1a1a1a",
            backgroundColor: "#000000",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #1a1a1a",
              backgroundColor: "#000000",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  borderRadius: "8px",
                  color: "#ffffff",
                  display: "flex",
                }}
              >
                <Hash style={{ width: "18px", height: "18px" }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", letterSpacing: "-0.01em" }}>
                  {joinedRoom}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#888888" }}>Connected</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "13px",
                color: "#888888",
                backgroundColor: "#111111",
                border: "1px solid #222222",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <LogOut style={{ width: "14px", height: "14px" }} />
              <span>Leave</span>
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#555555",
                }}
              >
                <MessageSquare style={{ width: "40px", height: "40px", marginBottom: "12px", strokeWidth: 1.5 }} />
                <p style={{ margin: 0, fontSize: "14px" }}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "me" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 16px",
                      borderRadius: "14px",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      backgroundColor: msg.sender === "me" ? "#ffffff" : "#111111",
                      color: msg.sender === "me" ? "#000000" : "#ffffff",
                      borderBottomRightRadius: msg.sender === "me" ? "2px" : "14px",
                      borderBottomLeftRadius: msg.sender === "me" ? "14px" : "2px",
                      border: msg.sender === "me" ? "none" : "1px solid #222222",
                      fontWeight: msg.sender === "me" ? "500" : "400",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#555555",
                      marginTop: "4px",
                      padding: "0 2px",
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #1a1a1a",
              backgroundColor: "#000000",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${joinedRoom}...`}
                style={{
                  flex: 1,
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#ffffff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                style={{
                  padding: "12px 16px",
                  backgroundColor: messageInput.trim() ? "#ffffff" : "#111111",
                  color: messageInput.trim() ? "#000000" : "#444444",
                  border: messageInput.trim() ? "none" : "1px solid #222222",
                  borderRadius: "10px",
                  cursor: messageInput.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <Send style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}