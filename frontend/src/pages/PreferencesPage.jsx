import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormSlider from "../components/FormSlider";
import { getRecommendations } from "../services/recommendService";

const INTEREST_FIELDS = [
  { key: "culture", label: "Culture & History" },
  { key: "adventure", label: "Adventure & Activities" },
  { key: "nature", label: "Nature & Outdoors" },
  { key: "beaches", label: "Beaches" },
  { key: "nightlife", label: "Nightlife" },
  { key: "cuisine", label: "Food & Cuisine" },
  { key: "wellness", label: "Wellness & Relaxation" },
  { key: "urban", label: "Urban / City Life" },
  { key: "seclusion", label: "Seclusion & Quiet" },
];

const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const INITIAL_FORM_STATE = {
  budget_level: "Mid-range",
  preferred_temp: 20,
  culture: 3,
  adventure: 3,
  nature: 3,
  beaches: 3,
  nightlife: 3,
  cuisine: 3,
  wellness: 3,
  urban: 3,
  seclusion: 3,
  group_size: 1,
  preferred_month: new Date().getMonth() + 1,
};

function PreferencesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterestChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.preferred_temp < -20 || formData.preferred_temp > 45) {
      newErrors.preferred_temp = "Temperature must be between -20°C and 45°C.";
    }
    if (formData.group_size < 1 || formData.group_size > 20) {
      newErrors.group_size = "Group size must be between 1 and 20.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const recommendations = await getRecommendations(formData);
      navigate("/results", { state: { recommendations } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Tell Us Your Preferences
      </h1>
      <p className="text-gray-600 mb-8">
        We'll use these to find real destinations that match what you're
        looking for.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Budget */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Level
          </label>
          <select
            value={formData.budget_level}
            onChange={(e) => handleFieldChange("budget_level", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Budget">Budget</option>
            <option value="Mid-range">Mid-range</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        {/* Preferred temperature */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Climate (average °C)
          </label>
          <input
            type="number"
            value={formData.preferred_temp}
            onChange={(e) => handleFieldChange("preferred_temp", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.preferred_temp && (
            <p className="text-red-500 text-sm mt-1">{errors.preferred_temp}</p>
          )}
        </div>

        {/* Group size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Size
          </label>
          <input
            type="number"
            value={formData.group_size}
            onChange={(e) => handleFieldChange("group_size", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.group_size && (
            <p className="text-red-500 text-sm mt-1">{errors.group_size}</p>
          )}
        </div>

        {/* Preferred travel month */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Travel Month
          </label>
          <select
            value={formData.preferred_month}
            onChange={(e) => handleFieldChange("preferred_month", Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_OPTIONS.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Interest sliders */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            What matters most to you?
          </h2>
          {INTEREST_FIELDS.map(({ key, label }) => (
            <FormSlider
              key={key}
              label={label}
              value={formData[key]}
              onChange={(value) => handleInterestChange(key, value)}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors cursor-pointer"
        >
          {isSubmitting ? "Finding your destinations..." : "Get Recommendations"}
        </button>
      </form>
    </main>
  );
}

export default PreferencesPage;