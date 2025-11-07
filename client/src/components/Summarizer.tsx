// client/src/components/Summarizer.tsx
import { useState } from "react";

function Summarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"short" | "detailed" | "bullets">("short");

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSummarize() {
    if (!text && !file) {
      alert("Upload a file or paste text first.");
      return;
    }

    setLoading(true);
    setSummary("");

    const form = new FormData();
    form.append("mode", mode);
    if (file) form.append("file", file);
    if (text) form.append("text", text);

    try {
      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!data.ok) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }

    setLoading(false);
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-6 text-center">📄 Document Summarizer</h2>

      {/* File upload */}
      <div className="mb-4">
        <label className="font-semibold">Upload PDF/TXT:</label>
        <input
          type="file"
          accept=".pdf,.txt"
          className="mt-2 block w-full"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {/* Optional textarea */}
      <div className="mb-4">
        <label className="font-semibold">Or paste text:</label>
        <textarea
          className="w-full mt-2 p-3 border rounded-md h-32"
          placeholder="Paste text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Summary mode */}
      <div className="mb-6">
        <label className="font-semibold">Summary mode:</label>
        <select
          className="ml-3 p-2 border rounded"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="short">Short (4–7 sentences)</option>
          <option value="detailed">Detailed summary</option>
          <option value="bullets">Bullet points</option>
        </select>
      </div>

      {/* Summarize button */}
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {/* Summary output */}
      {summary && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
          <h3 className="font-semibold mb-2">✅ Summary:</h3>
          {summary}
        </div>
      )}
    </div>
  );
}

export default Summarizer;
