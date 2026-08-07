import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import PreferencesPage from "./pages/PreferencesPage";
import ResultsPage from "./pages/ResultsPage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;