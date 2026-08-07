import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ChatBubble from "../components/ChatBubble";
import { sendChatMessage } from "../services/chatService";

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.destination;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!destination) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          No destination selected
        </h1>
        <p className="text-gray-600 mb-6">
          Please select a destination from your recommendations first.
        </p>
        <button
          onClick={() => navigate("/preferences")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
        >
          Get Recommendations
        </button>
      </main>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending) return;

    const userMessage = { role: "user", content: trimmedMessage };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputValue("");
    setIsSending(true);

    try {
      // conversation_history sent to the API is everything before this
      // new message, matching the ChatRequest schema's expectation of
      // "prior turns" separate from the new message itself.
      const reply = await sendChatMessage(destination, trimmedMessage, messages);
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          Chatting about {destination.city}, {destination.country}
        </h1>
        <p className="text-sm text-gray-500">
          Ask anything about this destination — best time to visit, things to
          do, and more.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            Start the conversation — ask a question about {destination.city}.
          </p>
        )}
        {messages.map((msg, index) => (
          <ChatBubble key={index} role={msg.role} content={msg.content} />
        ))}
        {isSending && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-2xl rounded-bl-sm">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-gray-200">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about this destination..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !inputValue.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Send
        </button>
      </form>
    </main>
  );
}

export default ChatPage;