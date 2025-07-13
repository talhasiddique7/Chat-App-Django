import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  Container,
  Form,
  Button,
  ListGroup,
  Row,
  Col,
  Badge,
  Alert,
} from "react-bootstrap";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const location = useLocation();
  const { username } = location.state || { username: "Anonymous" };
  const { roomName } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // Fetch messages and users when component mounts or room changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch messages for the current room
        const messagesRes = await axios.get(`/api/rooms/${roomName}/messages/`);

        // Fetch all users
        const usersRes = await axios.get("/api/users/");

        setMessages(messagesRes.data);
        setUsers(usersRes.data);
        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load chat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    // Connect to backend port 8000 for WebSocket (not through proxy)
    const wsUrl = `${protocol}//${host}:8000/ws/chat/${roomName}/`;

    console.log("Connecting to WebSocket:", wsUrl);
    console.log("Current location:", window.location.href);
    console.log("Protocol:", protocol);
    console.log("Host:", host);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
      setError("");
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setWsConnected(false);
      if (event.code !== 1000) {
        // Not a normal closure
        setError("WebSocket connection lost. Trying to reconnect...");
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (ws.current && ws.current.readyState === WebSocket.CLOSED) {
            console.log("Attempting to reconnect...");
            const newWs = new WebSocket(wsUrl);
            
            // Set up event handlers for the new connection
            newWs.onopen = () => {
              console.log("WebSocket reconnected");
              setWsConnected(true);
              setError("");
            };
            
            newWs.onmessage = (e) => {
              try {
                const data = JSON.parse(e.data);
                setMessages((prev) => [...prev, data]);
              } catch (err) {
                console.error("Error parsing WebSocket message:", err);
              }
            };
            
            newWs.onclose = (event) => {
              console.log("WebSocket disconnected again:", event.code, event.reason);
              setWsConnected(false);
              if (event.code !== 1000) {
                setError("WebSocket connection lost. Trying to reconnect...");
              }
            };
            
            newWs.onerror = (error) => {
              console.error("WebSocket error:", error);
              setError("WebSocket connection error");
              setWsConnected(false);
            };
            
            ws.current = newWs;
          }
        }, 3000);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
      setWsConnected(false);
    };

    // Clean up WebSocket connection on unmount
    return () => {
      if (ws.current) {
        ws.current.close(1000, "Component unmounting");
      }
    };
  }, [roomName]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        message: newMessage,
        username: username,
      };

      try {
        // Send message via WebSocket
        ws.current.send(JSON.stringify(message));
        setNewMessage("");
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    } else {
      setError("WebSocket not connected. Please refresh the page.");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading chat...</div>;
  }

  return (
    <Container
      fluid
      className="h-100 p-0 d-flex flex-column"
      style={{ height: "100vh" }}
    >
      {/* Header */}
      <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <header className="chat-header-pro d-flex align-items-center justify-content-between px-2 px-md-4 py-2 py-md-3 mb-2">
        <div className="d-flex align-items-center gap-2 gap-md-3 w-100">
          <Button
            variant="ghost"
            className="header-back-btn-pro d-flex align-items-center justify-content-center me-2"
            onClick={() => navigate("/")}
            style={{border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.3rem', minWidth: 0}}
            aria-label="Back to rooms"
          >
            <FiArrowLeft size={28} className="back-arrow-icon" />
          </Button>
          <div className="app-logo-area d-flex align-items-center gap-2">
            <span className="brand-circle">💬</span>
            <span className="brand-title d-none d-md-inline">ChatWave</span>
          </div>
          <h4 className="mb-0 fw-bold chat-room-title-pro flex-grow-1 text-truncate ms-2 ms-md-4">#{roomName}</h4>
          <div className="ms-2 d-none d-md-block">
            <div
              className={`rounded-circle ${wsConnected ? "bg-success" : "bg-danger"}`}
              style={{ width: "12px", height: "12px", border: '2px solid #fff', boxShadow: '0 0 0 2px #60a5fa' }}
              title={wsConnected ? "Connected" : "Disconnected"}
            ></div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 ms-2 flex-shrink-0">
          <span className="me-2 fw-semibold d-none d-md-inline">Hello, {username}</span>
          <Button
            variant="outline-light"
            size="sm"
            className="header-logout-btn px-3"
            onClick={() => navigate("/")}
            style={{borderRadius: '2rem', fontWeight: 500}}
          >
            Logout
          </Button>
        </div>
      </header>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Row className="flex-grow-1 m-0">
        {/* Sidebar */}
        <Col md={3} className="sidebar-modern d-flex flex-column align-items-stretch p-0" style={{background: 'rgba(255,255,255,0.85)', borderRight: 'none', boxShadow: '2px 0 16px 0 rgba(96,165,250,0.06)', minHeight: '100%'}}>
          <div className="sidebar-header-modern px-4 py-3 mb-2" style={{borderBottom: '1px solid #e3e7ed', background: 'rgba(96,165,250,0.09)', borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem'}}>
            <h5 className="mb-0 fw-bold text-primary">Online Users</h5>
          </div>
          <ListGroup variant="flush" className="sidebar-users-list px-3 py-2" style={{flex: 1, overflowY: 'auto', background: 'transparent'}}>
            {users.map((user) => (
              <ListGroup.Item
                key={user.id}
                className="d-flex align-items-center sidebar-user-item bg-transparent border-0 px-0 py-2"
                style={{borderRadius: '0.75rem'}}
              >
                <div className={`avatar avatar-sm me-2 ${user.username === username ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center`}>
                  {user.username ? user.username[0].toUpperCase() : '?'}
                </div>
                <span className="fw-semibold small">{user.username}</span>
                {user.username === username && (
                  <Badge bg="primary" className="ms-2" style={{borderRadius: '1rem', fontSize: '0.75rem'}}>You</Badge>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Chat Area */}
        <Col
          md={9}
          className="d-flex flex-column chat-area-modern p-0"
          style={{ height: "calc(100vh - 120px)" }}
        >
          {/* Messages */}
          <div className="flex-grow-1 p-3 overflow-auto messages-modern">
            {messages.map((msg, index) => {
              const isOwn = msg.user?.username === username;
              return (
                <div
                  key={index}
                  className={`mb-2 d-flex align-items-end ${isOwn ? "justify-content-end" : "justify-content-start"}`}
                >
                  {!isOwn && (
                    <div className="avatar avatar-sm me-2 bg-secondary text-white d-flex align-items-center justify-content-center">
                      {msg.user?.username ? msg.user.username[0].toUpperCase() : "?"}
                    </div>
                  )}
                  <div
                    className={`message-bubble-modern ${isOwn ? "sent" : "received"}`}
                  >
                    <div className="fw-bold small mb-1">
                      {msg.user?.username || "Unknown"}
                    </div>
                    <div>{msg.content}</div>
                    <div className="text-muted small mt-1" style={{ fontSize: "0.7rem" }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {isOwn && (
                    <div className="avatar avatar-sm ms-2 bg-primary text-white d-flex align-items-center justify-content-center">
                      {username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-top p-3 message-input-modern bg-light">
  <Form onSubmit={handleSendMessage} className="d-flex align-items-center gap-3 flex-nowrap" style={{maxWidth: 950, margin: '0 auto', width: '100%'}}>
  <Form.Control
    type="text"
    placeholder={wsConnected ? "Type a message..." : "Connecting..."}
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    className="flex-grow-1 rounded-pill px-4 py-3 shadow-sm border border-primary"
    style={{fontSize: '1.08rem', minHeight: 48, background: '#f4f7fa', borderWidth: 1.5, boxShadow: '0 1px 6px rgba(30,64,175,0.06)'}}
    disabled={!wsConnected}
    autoFocus
  />
  <Button
    variant="primary"
    type="submit"
    className="rounded-pill px-5 py-2 d-flex align-items-center justify-content-center shadow-sm"
    style={{fontSize: '1.08rem', minHeight: 48, fontWeight: 600, boxShadow: '0 2px 8px rgba(30,64,175,0.12)'}}
    disabled={!wsConnected || !newMessage.trim()}
  >
    Send
  </Button>
</Form>
</div>
        </Col>
      </Row>
    </Container>
  );
}

export default ChatRoom;
