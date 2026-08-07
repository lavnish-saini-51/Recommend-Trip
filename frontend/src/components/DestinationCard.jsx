function DestinationCard({ destination, onSelect }) {
  const { city, country, region, short_description, budget_level, avg_annual_temp } = destination;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{city}</h3>
          <p className="text-sm text-gray-500">
            {country} &middot; {region.replace("_", " ")}
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          {budget_level}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 flex-1">{short_description}</p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm text-gray-500">
          Avg. temp: <span className="font-semibold text-gray-700">{avg_annual_temp}°C</span>
        </span>
        <button
          onClick={() => onSelect(destination)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Chat about this
        </button>
      </div>
    </div>
  );
}

export default DestinationCard;