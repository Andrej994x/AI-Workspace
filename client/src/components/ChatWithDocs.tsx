// client/src/components/ChatWithDocs.tsx
import React, { useState } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";
import { MdUploadFile, MdDelete } from "react-icons/md";

const ChatWithDocs: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ sender: string; text: string; sources?: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const userId = "default";

  // Upload documents
  const handleUpload = async () => {
    if (files.length === 0) return alert("Select at least one file.");
    setUploading(true);

    const formData = new FormData();
    formData.append("userId", userId);
    files.forEach((f) => formData.append("files", f));

    try {
      await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Documents uploaded successfully!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/rag-chat", {
        userId,
        message,
      });
      const botMessage = {
        sender: "bot",
        text: res.data.reply,
        sources: res.data.sources || [],
      };
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

  const clearDocs = async () => {
    try {
      await axios.post("http://localhost:5000/api/clear-docs", { userId });
      alert("🗑️ All documents cleared!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl w-[600px] h-[650px] flex flex-col overflow-hidden border border-gray-200">
      <div className="bg-blue-600 text-white py-3 text-lg font-semibold flex justify-between items-center px-4">
        <span>📄 Chat with Documents (RAG)</span>
        <button
          onClick={clearDocs}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white text-sm px-2 py-1 rounded-md transition"
          title="Clear all documents"
        >
          <MdDelete size={16} /> Clear Docs
        </button>
      </div>

      {/* Upload area */}
      <div className="border-b p-4 flex flex-col gap-2">
        <input
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="border rounded-lg px-3 py-2"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          <MdUploadFile size={18} /> {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {chat.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            Upload PDF/TXT documents, then ask a question 👇
          </p>
        ) : (
          chat.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Sources: {msg.sources.join(", ")}
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <p className="text-sm text-gray-500 italic text-center">Thinking...</p>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-3 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask about your uploaded documents..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

export default ChatWithDocs;
