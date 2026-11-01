export default function Footer() {
  return (
    <footer className="bg-sand-900 text-sand-100 border-t border-sand-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-3">
              Raj Stay
            </h3>
            <p className="text-sm text-sand-300 leading-relaxed">
              Clean and quiet accommodation for college students. Located within walking distance of campus, with dedicated study spaces, high speed internet, and daily maintenance.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-sand-300 mb-3">
              House Rules and Facilities
            </h4>
            <ul className="text-sm text-sand-300 space-y-2">
              <li>Three healthy meals daily (North and South Indian)</li>
              <li>High speed fiber internet on all floors</li>
              <li>24/7 CCTV surveillance and security guard</li>
              <li>Gate closing time: 10:00 PM</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-sand-300 mb-3">
              Contact Owner
            </h4>
            <div className="text-sm text-sand-300 space-y-2">
              <p className="text-white font-medium">Raj Stay PG Accommodation</p>
              <p>97/4 Ganesh Nagar, Pardesipura, Indore, Madhya Pradesh</p>
              <p>Phone: +91 98267 05696</p>
              <p>Email: rajatyadav25009@gmail.com</p>
              <p>Visiting hours: 10:00 AM to 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-sand-800 text-xs text-sand-300 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Raj Stay. Built for college project demonstration.</p>
          <p>Administered directly by PG Owner</p>
        </div>
      </div>
    </footer>
  );
}
