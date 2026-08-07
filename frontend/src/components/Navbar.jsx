
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">
        RecommendTrip
      </Link>
      <div className="flex gap-6 text-gray-600 text-sm font-medium">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <Link to="/preferences" className="hover:text-blue-600 transition-colors">
          Get Recommendations
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;