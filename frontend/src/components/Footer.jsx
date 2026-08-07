function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-500">
      <p>&copy; {currentYear} RecommendTrip. Built for demo purposes only.</p>
    </footer>
  );
}

export default Footer;