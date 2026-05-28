// AIChatPage.jsx
import React, { useState } from "react";
import ChatBox3D from "../components/Chat/ChatBox3D";


const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text) => {
    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    setTimeout(() => {
      const aiMessage = {
        sender: "ai",
        text: `پیام AI به: "${text}"`,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (

      <div className="container-fluid p-0" style={{ height: '120vh', overflow: 'hidden' }}>
        <br />
        <div className="row" style={{ height: 'calc(120vh - 80px)', overflowY: 'auto' }}>
          <div className="col-12">
            <ChatBox3D
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              rtl={true} // راست‌چین
            />
          </div>
        </div>
        <br />
      </div>

  );
};

export default AIChatPage;