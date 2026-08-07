/**
 * ResultsPage
 *
 * Displays the ranked list of recommended destinations returned from
 * the /recommend endpoint. Receives recommendations via router state
 * (passed from PreferencesPage on submit). If a user lands here
 * directly without state (e.g. page refresh), shows an empty state
 * prompting them to fill out the form.
 */

import { useLocation, useNavigate } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const recommendations = location.state?.recommendations || [];

  const handleSelectDestination = (destination) => {
    navigate("/chat", { state: { destination } });
  };

  if (recommendations.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          No recommendations to show
        </h1>
        <p className="text-gray-600 mb-6">
          It looks like you haven't submitted your preferences yet.
        </p>
        <button
          onClick={() => navigate("/preferences")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
        >
          Fill Out Preferences
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Your Recommended Destinations
      </h1>
      <p className="text-gray-600 mb-8">
        Based on your preferences, here are your best matches. Select one to
        chat and learn more.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {recommendations.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onSelect={handleSelectDestination}
          />
        ))}
      </div>
    </main>
  );
}

export default ResultsPage;