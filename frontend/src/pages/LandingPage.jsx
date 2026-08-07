import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/preferences");
  };

  return (
    <main className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[80vh]">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
        Find Your Perfect Trip with{" "}
        <span className="text-blue-600">RecommendTrip</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Tell us your budget, climate preference, and travel interests — our
        data-driven recommendation engine matches you with real destinations
        that fit. Then chat with our AI assistant to learn everything you
        need about your chosen spot.
      </p>
      <button
        onClick={handleGetStarted}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors cursor-pointer"
      >
        Get Started
      </button>
    </main>
  );
}

export default LandingPage;