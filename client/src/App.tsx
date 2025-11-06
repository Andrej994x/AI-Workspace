// client/src/App.tsx
import { useState } from "react";
import Chat from "./components/Chat";
import { FaComments, FaFileAlt } from "react-icons/fa";
import ChatWithDocs from "./components/ChatWithDocs";

function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "rag">("chat");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white py-4 shadow-md flex justify-between items-center px-8">
        <h1 className="text-2xl font-bold">💬 AI Workspace</h1>

        {/* Navigation Tabs */}
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "chat"
                ? "bg-blue-500"
                : "bg-blue-800 hover:bg-blue-600"
            }`}
          >
            <FaComments /> Chat
          </button>
          <button
            onClick={() => setActiveTab("rag")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "rag"
                ? "bg-blue-500"
                : "bg-blue-800 hover:bg-blue-600"
            }`}
          >
            <FaFileAlt /> Chat with Documents
          </button>
        </nav>
      </header>

      <main className="flex-grow flex justify-center items-center py-10">
        {activeTab === "chat" && <Chat />}
        {activeTab === "rag" && <ChatWithDocs />}
      </main>
    </div>
  );
}

export default App;
