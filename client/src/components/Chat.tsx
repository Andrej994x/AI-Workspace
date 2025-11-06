import React, { useState } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";
import { MdDelete } from "react-icons/md";

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = "default";

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        userId,
        message,
      });

      const botMessage = { sender: "bot", text: res.data.reply };
      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error: Cannot connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axios.post("http://localhost:5000/api/clear", { userId });
      setChat([]);
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl w-[500px] h-[600px] flex flex-col overflow-hidden border border-gray-200">
      <div className="bg-blue-600 text-white py-3 text-lg font-semibold flex justify-between items-center px-4">
        <span>Chat with AI</span>
        <button
          onClick={clearChat}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white text-sm px-2 py-1 rounded-md transition"
          title="Clear chat"
        >
          <MdDelete size={16} /> Clear
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {chat.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            Start chatting with your AI assistant 👇
          </p>
        ) : (
          chat.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        {loading && (
          <p className="text-sm text-gray-500 italic text-center">
            Thinking...
          </p>
        )}
      </div>

      <div className="border-t p-3 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
