import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { useLocation } from "react-router-dom";
import "./ChatBox3D.css";

// API base URLs
const CHAT_API_URL = "http://192.168.150.10:8000/api/ai/chat/";
const ASSET_API_URL_BASE = "http://192.168.150.10:8000/api/assets/assets/";
const CHAT_HISTORY_URL = "http://192.168.150.10:8000/api/ai/history/";

// -------------------- TEXT FORMATTING COMPONENTS --------------------
const FormattedMessage = ({ text }) => {
  const formatText = (text) => {
    if (!text) return '';

    let cleanedText = text.replace(/undefined/g, '').trim();

    return cleanedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
      .replace(/\- (.*?)(?=\n|$)/g, '• $1<br />')
      .replace(/\d+\.\s(.*?)(?=\n|$)/g, '<br />$1<br />');
  };

  return (
    <div
      className="formatted-message"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};

const TypingMessage = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const cleanText = text.replace(/undefined/g, '').trim();
    let i = 0;
    const interval = setInterval(() => {
      if (i < cleanText.length) {
        setDisplayed((prev) => prev + cleanText[i]);
        i++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <FormattedMessage text={displayed} />;
};

// -------------------- 3D MODEL COMPONENTS --------------------
function AssetModel({ modelUrl, onLoad, onError, ...props }) {
  const { scene, error } = useGLTF(modelUrl);
  const modelRef = useRef();

  useEffect(() => {
    if (error) {
      console.error('Error loading model:', error);
      onError?.(error);
    } else if (scene) {
      console.log('Model loaded successfully:', modelUrl);
      onLoad?.();
    }
  }, [scene, error, modelUrl, onLoad, onError]);

  const optimizedScene = useMemo(() => {
    if (!scene) return null;

    try {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.needsUpdate = true;
          child.material.toneMapped = false;
          child.material.metalness = 0.7;
          child.material.roughness = 0.2;
          child.material.envMapIntensity = 1.5;
          if (child.material.emissive) child.material.emissiveIntensity = 0.1;
        }
      });
      return scene;
    } catch (err) {
      console.error('Error optimizing scene:', err);
      return scene;
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (modelRef.current) modelRef.current.rotation.y += delta * 0.3;
  });

  if (error) {
    return null;
  }

  return <primitive ref={modelRef} object={optimizedScene} {...props} />;
}

function ModelPlaceholder() {
  const boxRef = useRef();
  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.8;
      boxRef.current.rotation.x += delta * 0.4;
    }
  });
  return (
    <mesh ref={boxRef}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="#4f46e5" wireframe emissive="#4f46e5" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

function ModelError() {
  return (
    <mesh>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} />
    </mesh>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('3D Model error:', error, info);
    this.props.onError?.();
  }

  render() {
    return this.state.hasError ? (this.props.fallback || <ModelError />) : this.props.children;
  }
}

function ModelWithErrorBoundary({ modelUrl, onModelLoad, ...props }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [modelUrl]);

  if (!modelUrl) {
    console.log('No model URL provided, showing placeholder');
    return <ModelPlaceholder />;
  }

  console.log('Loading model from URL:', modelUrl);

  return (
    <Suspense fallback={<ModelPlaceholder />}>
      <ErrorBoundary onError={() => { setHasError(true); setIsLoading(false); }}>
        {hasError ? (
          <ModelError />
        ) : (
          <AssetModel
            modelUrl={modelUrl}
            onLoad={() => {
              setIsLoading(false);
              onModelLoad?.();
              console.log('AssetModel reported successful load');
            }}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            {...props}
          />
        )}
      </ErrorBoundary>
    </Suspense>
  );
}

// -------------------- CHAT COMPONENTS --------------------
const HistoryMessage = ({ message, isUser }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);
      return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  return (
    <div
      className={`d-flex mb-3 ${isUser ? "justify-content-end" : "justify-content-start"}`}
    >
      <div
        className={`message-bubble p-3 rounded-3 ${isUser ? "user-message bg-primary text-white" : "bot-message bg-light border text-dark"}`}
        style={{ maxWidth: "70%" }}
      >
        <div className="message-text">
          <FormattedMessage text={message.text} />
        </div>
        <div className="message-time">
          {message.timestamp ? formatTimestamp(message.timestamp) : ''}
        </div>
      </div>
    </div>
  );
};

const AnimatedMessage = ({ message, isUser, isNew = false }) => {
  const [isVisible, setIsVisible] = useState(!isNew);
  const [typingComplete, setTypingComplete] = useState(isUser);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const formatTime = (timestamp) => {
    if (timestamp) {
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error('Error formatting time:', error);
      }
    }
    return new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`d-flex mb-3 ${isUser ? "justify-content-end" : "justify-content-start"}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : `translateY(${isUser ? '20px' : '-20px'}) scale(0.9)`,
        transition: isNew ? 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        transitionDelay: isNew ? '0.1s' : '0s'
      }}
    >
      <div
        className={`message-bubble p-3 rounded-3 ${isUser ? "user-message bg-primary text-white" : "bot-message bg-light border text-dark"}`}
        style={{ maxWidth: "70%" }}
      >
        <div className="message-text">
          {isUser ? (
            message.text
          ) : (
            typingComplete || !isNew ? (
              <FormattedMessage text={message.text} />
            ) : (
              <TypingMessage
                text={message.text}
                onComplete={() => setTypingComplete(true)}
              />
            )
          )}
        </div>
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

const AnimatedTypingIndicator = () => (
  <div className="typing-indicator-floating">
    <div className="typing-bubble">
      <div className="typing-avatar">
        <div className="ai-avatar">AI</div>
      </div>
      <div className="typing-content">
        <span className="typing-text">در حال پاسخ‌گویی</span>
        <div className="typing-dots-wave">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  </div>
);
const WelcomeMessage = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="text-center text-muted mt-3 welcome-message"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out'
      }}
    >
      برای شروع گفتگو، پیام خود را ارسال کنید...
      <div className="mt-2 small">درباره موتور الکتریکی، تحلیل ارتعاشات یا پیش‌بینی خرابی سوال کنید</div>
    </div>
  );
};

// -------------------- MAIN CHATBOX --------------------
export default function ChatBox3D({ rtl }) {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [assetInfo, setAssetInfo] = useState(null);
  const [currentModelUrl, setCurrentModelUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const assetId = new URLSearchParams(location.search).get("asset") || 1;
  const assetName = new URLSearchParams(location.search).get("name") || "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load chat history when component mounts or assetId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        console.log('Loading chat history for asset:', assetId);
        const response = await fetch(`${CHAT_HISTORY_URL}?asset_id=${assetId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const historyData = await response.json();
          console.log('Chat history loaded:', historyData);

          // Convert API response to message format with timestamps
          const historyMessages = historyData.map(chat => [
            {
              sender: "user",
              text: chat.user_message,
              timestamp: chat.timestamp || chat.created_at || chat.date
            },
            {
              sender: "bot",
              text: chat.ai_reply,
              timestamp: chat.timestamp || chat.created_at || chat.date
            }
          ]).flat();

          setMessages(historyMessages);
          console.log('Messages set:', historyMessages);
        } else {
          console.error('Failed to load chat history:', response.status);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [assetId]);

  // Fetch asset info
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    let cancelled = false;

    console.log('Fetching asset info for ID:', assetId);

    fetch(`${ASSET_API_URL_BASE}${assetId}/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          console.log('Asset data received:', data);
          setAssetInfo(data);

          const modelUrl = getModelUrl(data.model_3d);
          console.log('Processed model URL:', modelUrl);
          setCurrentModelUrl(modelUrl);
        }
      })
      .catch(err => {
        console.error("Asset API error:", err);
        if (!cancelled) {
          setAssetInfo({ error: err.message });
        }
      });

    return () => { cancelled = true; };
  }, [assetId]);

  // Get the full 3D model URL
  const getModelUrl = (model3DField) => {
    if (!model3DField) {
      return 'http://192.168.150.10:8000/media/assets/models/electric_motor_se.glb';
    }

    if (typeof model3DField === 'string') {
      if (model3DField.startsWith('http')) {
        return model3DField;
      }

      if (model3DField.startsWith('/')) {
        return `http://127.0.0.1:8000${model3DField}`;
      }

      return `http://192.168.150.10:8000/media/${model3DField}`;
    }

    if (typeof model3DField === 'object') {
      const possibleFields = ['url', 'file', 'model_url', 'file_url', 'path'];
      for (let field of possibleFields) {
        if (model3DField[field]) {
          return getModelUrl(model3DField[field]);
        }
      }
    }

    return 'http://192.168.150.10:8000/media/assets/models/electric_motor_se.glb';
  };

  // Handle model load
  const handleModelLoad = () => {
    console.log('3D model loaded successfully');
    setModelLoaded(true);
  };

  // Handle send message
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("ابتدا وارد حساب کاربری شوید.");
      return;
    }

    const userMessage = {
      sender: "user",
      text: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessageCount(prev => prev + 1);
    setIsLoading(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: messageText,
          asset_id: assetId
        }),
      });

      if (res.status === 401) {
        alert("توکن نامعتبر یا منقضی شده. لطفا دوباره وارد شوید.");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const cleanResponse = (data.ai_reply || "پاسخی از هوش مصنوعی دریافت نشد.")
        .replace(/undefined/g, '')
        .trim();

      const botMessage = {
        sender: "bot",
        text: cleanResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setNewMessageCount(prev => prev + 1);
    } catch (err) {
      console.error("AI API error:", err);
      const errorMessage = {
        sender: "bot",
        text: "خطایی در ارتباط با سرور رخ داده است.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setNewMessageCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput("");
  };

  // Determine if a message should be animated
  const shouldAnimateMessage = (index) => {
    const totalMessages = messages.length;
    return index >= totalMessages - newMessageCount;
  };

  // Asset Summary Component
  const AssetSummary = () => {
    if (!assetInfo) return null;

    return (
      <div className="asset-summary p-3 mb-3 bg-light border rounded">
        <strong>اطلاعات دارایی:</strong> {assetInfo.name || assetName} - نوع: {assetInfo.asset_type || "N/A"}

        {assetInfo.location && (
          <div className="mt-1">
            <small className="text-muted">
              <strong>موقعیت: </strong>
              {assetInfo.location.name}
            </small>
          </div>
        )}

        {assetInfo.factory_name && (
          <div className="mt-1">
            <small className="text-muted">
              <strong>کارخانه: </strong>
              {assetInfo.factory_name}
            </small>
          </div>
        )}

        {assetInfo.section && assetInfo.section.name && (
          <div className="mt-1">
            <small className="text-muted">
              <strong>بخش: </strong>
              {assetInfo.section.name}
              {assetInfo.section.description && ` - ${assetInfo.section.description}`}
            </small>
          </div>
        )}

        <div className="mt-2">
          <small>{assetInfo.description || "توضیحی موجود نیست."}</small>
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-container-3d d-flex flex-column ${rtl ? "text-end" : "text-start"}`}>
      {/* 3D Model Section */}
      <div className="model-container mb-3 mx-4">
        <div className="model-title">
          {assetInfo?.name || assetName || "مدل سه‌بعدی"}
        </div>

        <div className="model-canvas-wrapper">
          {/* Asset Details Overlay */}
          <div className="asset-details-overlay">
            <div className="asset-details-stack">
              {assetInfo?.model && (
                <div className="model-detail">
                  مدل: {assetInfo.model}
                </div>
              )}
              {assetInfo?.type && (
                <div className="model-detail">
                  نوع: {assetInfo.type}
                </div>
              )}
              {assetInfo?.serial_number && (
                <div className="model-detail">
                  سریال: {assetInfo.serial_number}
                </div>
              )}
            </div>
          </div>

          <Canvas
            camera={{
              position: [10, 10, 10],
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            shadows
          >
            <color attach="background" args={['#1e293b']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[8, 12, 8]} intensity={1.2} castShadow />
            <pointLight position={[-8, 5, -8]} intensity={0.5} />
            <Environment preset="studio" background={false} />
            <ModelWithErrorBoundary
              modelUrl={currentModelUrl}
              onModelLoad={handleModelLoad}
              scale={8}
              position={[0, 0, 0]}
            />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              minDistance={2}
              maxDistance={100}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>

          {!modelLoaded && currentModelUrl && (
            <div className="model-loading-overlay">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">در حال بارگذاری مدل...</span>
              </div>
              <p>در حال بارگذاری مدل سه‌بعدی...</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div
        className="card shadow-lg flex-grow-1 d-flex flex-column chat-card rounded-4 mx-4"
        style={{ border: 'none', overflow: 'hidden' }}
      >
        <div className="card-header bg-primary text-white fw-bold d-flex align-items-center justify-content-between">
          <span className="chat-title">💬 چت نگهداری پیش‌بینی‌شده با هوش مصنوعی</span>
          {isLoading && <AnimatedTypingIndicator />}
        </div>

        <div className="card-body overflow-auto flex-grow-1 d-flex flex-column messages-container">
          <AssetSummary />

          {isLoadingHistory && (
            <div className="text-center text-muted p-3">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">در حال بارگذاری تاریخچه...</span>
              </div>
              در حال بارگذاری تاریخچه گفتگو...
            </div>
          )}

          {!isLoadingHistory && messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            messages.map((msg, idx) => {
              const isNewMessage = shouldAnimateMessage(idx);

              if (isNewMessage) {
                return (
                  <AnimatedMessage
                    key={idx}
                    message={msg}
                    isUser={msg.sender === "user"}
                    isNew={isNewMessage}
                  />
                );
              } else {
                return (
                  <HistoryMessage
                    key={idx}
                    message={msg}
                    isUser={msg.sender === "user"}
                  />
                );
              }
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="card-footer bg-white border-top">
          <form className="d-flex" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="form-control me-2 chat-input"
              placeholder="سوال خود را درباره تجهیزات، پیش‌بینی خرابی یا زمان‌بندی نگهداری وارد کنید..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isLoadingHistory}
              dir="rtl"
            />
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center"
              disabled={isLoading || isLoadingHistory || !input.trim()}
            >
              <span>ارسال</span>
              <svg
                className="ms-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transform: 'scaleX(-1)' }}
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}