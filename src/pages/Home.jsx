import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Import real room photos
import single1 from '../assets/rooms/single-1.jpeg';
import single2 from '../assets/rooms/single-2.jpeg';
import single3 from '../assets/rooms/single-3.jpeg';
import single4 from '../assets/rooms/single-4.jpeg';
import single5 from '../assets/rooms/single-5.jpeg';
import single6 from '../assets/rooms/single-6.jpeg';

import double1 from '../assets/rooms/double-1.jpeg';
import double2 from '../assets/rooms/double-2.jpeg';
import double3 from '../assets/rooms/double-3.jpeg';
import double4 from '../assets/rooms/double-4.jpeg';
import double5 from '../assets/rooms/double-5.jpeg';
import double6 from '../assets/rooms/double-6.jpeg';

import triple1 from '../assets/rooms/triple-1.jpeg';
import triple2 from '../assets/rooms/triple-2.jpeg';
import triple3 from '../assets/rooms/triple-3.jpeg';
import triple4 from '../assets/rooms/triple-4.jpeg';
import triple5 from '../assets/rooms/triple-5.jpeg';
import triple6 from '../assets/rooms/triple-6.jpeg';


const roomPhotos = {
  single: [single1, single4, single3, single2, single5, single6],
  double: [double4, double1, double3, double2, double5, double6],
  triple: [triple4, triple1, triple5, triple3, triple2, triple6],
};

const weeklyMessMenu = [
  { day: 'Monday', breakfast: 'Poha + Tea', lunch: 'Dal, Rice, Roti, Seasonal Sabzi', snacks: 'Tea + Biscuits', dinner: 'Paneer Masala + Roti + Rice' },
  { day: 'Tuesday', breakfast: 'Aloo Paratha + Curd', lunch: 'Rajma Rice + Roti', snacks: 'Tea + Samosa', dinner: 'Mix Veg + Dal + Roti' },
  { day: 'Wednesday', breakfast: 'Idli + Sambar + Chutney', lunch: 'Dal Tadka + Jeera Rice', snacks: 'Tea + Poha', dinner: 'Chole Puri + Rice' },
  { day: 'Thursday', breakfast: 'Upma + Filter Coffee', lunch: 'Kadhi Pakoda + Rice', snacks: 'Tea + Cookies', dinner: 'Paneer Bhurji + Roti' },
  { day: 'Friday', breakfast: 'Veg Sandwich + Milk', lunch: 'Dal Makhani + Roti', snacks: 'Tea + Pakoda', dinner: 'Vegetable Biryani + Raita' },
  { day: 'Saturday', breakfast: 'Methi Paratha + Curd', lunch: 'Chole Rice + Roti', snacks: 'Tea + Biscuits', dinner: 'Dal Fry + Jeera Rice + Roti' },
  { day: 'Sunday', breakfast: 'Poori Sabzi + Halwa', lunch: 'Special Feast Thali', snacks: 'Cold Coffee + Snacks', dinner: 'Special Paneer Butter Masala + Naan' }
];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { user, isStudent } = useAuth();

  const heroVideoRef = useRef(null);
  const [videoMuted, setVideoMuted] = useState(true);

  // Slow down the hero video slightly for a calmer feel
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.playbackRate = 0.75;
    }
  }, []);

  function toggleAudio() {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !heroVideoRef.current.muted;
      setVideoMuted(heroVideoRef.current.muted);
    }
  }

  // Photo viewer modal state
  const [activeGallery, setActiveGallery] = useState(null); // { type, title, photos, index }

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location, loading]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('capacity', { ascending: true });

        if (error) throw error;
        setRooms(data || []);
      } catch (err) {
        console.error('Error fetching rooms:', err.message);
        setErrorMsg('Unable to load rooms at this moment. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  function openGallery(roomType, startIndex = 0) {
    const photos = roomPhotos[roomType] || [];
    const titles = {
      single: 'Single Seater Room Gallery',
      double: 'Double Sharing Room Gallery',
      triple: 'Triple Sharing Room Gallery',
    };
    setActiveGallery({
      type: roomType,
      title: titles[roomType] || 'Room Gallery',
      photos,
      index: startIndex,
    });
  }

  function nextGalleryPhoto() {
    if (!activeGallery) return;
    setActiveGallery((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.photos.length,
    }));
  }

  function prevGalleryPhoto() {
    if (!activeGallery) return;
    setActiveGallery((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.photos.length) % prev.photos.length,
    }));
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section with Smooth Ambient Background Video */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[480px] sm:min-h-[520px] flex items-center p-8 sm:p-14 border border-sand-300 overflow-hidden shadow-sm">
          {/* Continuous Background Video */}
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted={videoMuted}
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          >
            <source src="/videos/transition-video.mp4" type="video/mp4" />
          </video>

          {/* Solid high-contrast dark overlay to ensure sharp text legibility */}
          <div className="absolute inset-0 bg-forest-950/80 pointer-events-none"></div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl text-white">
            <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-white mt-2">
              Where late-night Maggi turns into lifelong friendships
            </h1>
            <p className="mt-4 text-base sm:text-lg text-sand-100 leading-relaxed">
              Raj Stay is a small student PG managed by the owner himself, so you and your family can talk to him directly. Clean rooms, daily home-style meals and reliable Wi-Fi, close to college. Come visit, see the rooms and then decide.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#rooms"
                className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold px-6 py-3 text-sm transition-colors border border-terracotta-600"
              >
                View Rooms and Rates
              </a>
              <a
                href="#mess-menu"
                className="bg-sand-900/60 hover:bg-sand-900 text-sand-100 font-semibold px-6 py-3 text-sm border border-sand-400 transition-colors"
              >
                Weekly Mess Menu
              </a>
              {!user && (
                <Link
                  to="/register"
                  className="bg-white hover:bg-sand-100 text-sand-900 font-semibold px-6 py-3 text-sm border border-white transition-colors"
                >
                  Student Registration
                </Link>
              )}
            </div>
          </div>

          {/* Audio toggle button */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              type="button"
              onClick={toggleAudio}
              className="bg-sand-900/80 hover:bg-sand-900 text-sand-100 text-xs font-semibold px-3 py-1.5 border border-sand-700 flex items-center space-x-1 transition-colors"
            >
              <span>{videoMuted ? 'Unmute Video Tour' : 'Mute Video'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Rooms Catalog Section with Real Photos */}
      <section id="rooms" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-wider font-bold text-forest-800">
            Accommodation Types
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest-900 mt-1">
            Room Options and Monthly Rates
          </h2>
          <p className="text-sand-800 text-sm mt-2">
            Click on any room photo to view the full gallery of beds, study desks, and storage spaces.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-6 bg-terracotta-50 border border-terracotta-500 text-terracotta-700 text-sm">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sand-800 text-sm bg-white border border-sand-200">
            Loading room data from database...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room) => {
              const availableBeds = Math.max(0, room.capacity - (room.occupied || 0));
              const isFull = availableBeds === 0;
              const photos = roomPhotos[room.type] || [];
              const mainPhoto = photos[0];

              return (
                <div
                  key={room.id}
                  className="bg-white border border-sand-200 flex flex-col justify-between shadow-sm overflow-hidden"
                >
                  <div>
                    {/* Primary Room Photo */}
                    <div className="relative group cursor-pointer bg-sand-100" onClick={() => openGallery(room.type, 0)}>
                      {mainPhoto ? (
                        <img
                          src={mainPhoto}
                          alt={`${room.type} room at Raj Stay`}
                          className="w-full h-56 object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center text-xs text-sand-800">
                          Photo coming soon
                        </div>
                      )}
                      <div className="absolute inset-0 bg-sand-900/10 hover:bg-sand-900/20 transition-colors flex items-end p-3">
                        <button
                          type="button"
                          className="bg-sand-900 text-white text-[11px] font-semibold px-2.5 py-1 border border-sand-700 shadow-sm"
                        >
                          View all 6 photos
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {photos.length > 1 && (
                      <div className="grid grid-cols-4 gap-1 p-2 bg-sand-100 border-b border-sand-200">
                        {photos.slice(1, 5).map((thumb, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => openGallery(room.type, idx + 1)}
                            className="aspect-square overflow-hidden bg-sand-200 hover:opacity-90 border border-sand-300"
                          >
                            <img
                              src={thumb}
                              alt={`Thumbnail ${idx + 2}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Room Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-sand-200 mb-4">
                        <span className="text-xs uppercase tracking-wider font-bold text-sand-800">
                          {room.type} Sharing
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 border ${
                            isFull
                              ? 'bg-sand-100 text-sand-800 border-sand-300'
                              : 'bg-forest-50 text-forest-900 border-forest-600'
                          }`}
                        >
                          {isFull ? 'Fully Occupied' : `${availableBeds} beds available`}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="font-display text-3xl font-bold text-forest-900">
                          ₹{room.price.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-sand-800 mt-0.5">
                          per student / month (including meals and Wi-Fi)
                        </div>
                      </div>

                      <p className="text-sm text-sand-800 leading-relaxed mb-4">
                        {room.description}
                      </p>

                      <div className="text-xs text-sand-800 space-y-1 border-t border-sand-200 pt-3">
                        <div>Total Room Capacity: {room.capacity} {room.capacity === 1 ? 'bed' : 'beds'}</div>
                        <div>Current Occupancy: {room.occupied || 0} residents</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    {isFull ? (
                      <button
                        type="button"
                        disabled
                        className="w-full text-center py-2.5 px-4 text-xs font-semibold bg-sand-100 text-sand-800 border border-sand-300 cursor-not-allowed"
                      >
                        Currently Full
                      </button>
                    ) : user ? (
                      isStudent ? (
                        <Link
                          to={`/book/${room.id}`}
                          className="block text-center w-full py-2.5 px-4 text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-white border border-forest-900 transition-colors"
                        >
                          Request This Room
                        </Link>
                      ) : (
                        <Link
                          to="/admin"
                          className="block text-center w-full py-2.5 px-4 text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-sand-900 border border-sand-300 transition-colors"
                        >
                          Manage in Admin
                        </Link>
                      )
                    ) : (
                      <Link
                        to="/login"
                        className="block text-center w-full py-2.5 px-4 text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-white border border-forest-900 transition-colors"
                      >
                        Sign In to Request Room
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* Facilities Overview (Structured list) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-b border-sand-200 py-10">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-forest-900 mb-4">
              What Is Included in Your Monthly Rent
            </h2>
            <p className="text-sand-800 text-sm leading-relaxed">
              We keep our terms clear and comprehensive. There are no unexpected utility surcharges or hidden fees added to your bill.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-sand-900">
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Three Daily Meals</span>
              Freshly prepared breakfast, lunch, and dinner with clean drinking water and a rotating weekly menu.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">High Speed Fiber Wi-Fi</span>
              Dedicated access points on every floor to support online coursework, study groups, and project submissions.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Housekeeping and Laundry Support</span>
              Common corridors and attached washrooms are cleaned on schedule. Washing machines and drying spaces are available.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Power Backup and Security</span>
              Inverter backup for lighting and charging stations, security guard on duty, and CCTV monitoring in corridors.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">RO Purified Drinking Water</span>
              24/7 access to clean RO-filtered drinking water on every floor. No need to buy bottled water separately.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Attached Washrooms</span>
              Every room comes with its own attached bathroom so you never have to wait or share with strangers.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Furniture and Storage</span>
              Each bed has a dedicated study table, chair, cupboard, and shelf space included. Just bring your bags and settle in.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Common Area and Recreation</span>
              A shared lounge area with seating for group study, casual hangouts, and a TV for breaks between classes.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Parking Space</span>
              Designated two-wheeler parking available within the premises at no extra charge.
            </div>
            <div className="p-4 bg-white border border-sand-200">
              <span className="font-bold text-forest-900 block mb-1">Guest and Parent Visits</span>
              Parents and guardians are welcome to visit anytime. Speak directly with the owner, no middlemen or wardens.
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Mess Menu Section */}
      <section id="mess-menu" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-sand-200 p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <span className="text-xs uppercase tracking-wider font-bold text-terracotta-600">
              Dining & Nutrition
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest-900 mt-1">
              Weekly Mess and Dining Schedule
            </h2>
            <p className="text-sm text-sand-800 mt-2 leading-relaxed">
              Wholesome, home-style 4-time meals cooked fresh daily. Pure vegetarian preparation with balanced nutrition, seasonal vegetables, and RO purified drinking water.
            </p>
          </div>

          {/* Meal Timings Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-sand-100 border border-sand-200 text-xs">
            <div>
              <span className="font-bold text-forest-900 block">Breakfast</span>
              <span className="text-sand-800">8:00 AM to 10:00 AM</span>
            </div>
            <div>
              <span className="font-bold text-forest-900 block">Lunch</span>
              <span className="text-sand-800">12:30 PM to 2:30 PM</span>
            </div>
            <div>
              <span className="font-bold text-forest-900 block">Evening Tea</span>
              <span className="text-sand-800">5:00 PM to 6:00 PM</span>
            </div>
            <div>
              <span className="font-bold text-forest-900 block">Dinner</span>
              <span className="text-sand-800">8:00 PM to 10:00 PM</span>
            </div>
          </div>

          {/* Menu Table */}
          <div className="overflow-x-auto border border-sand-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900 text-white font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 border-r border-forest-800">Day</th>
                  <th className="py-3 px-4 border-r border-forest-800">Breakfast</th>
                  <th className="py-3 px-4 border-r border-forest-800">Lunch</th>
                  <th className="py-3 px-4 border-r border-forest-800">Evening Tea</th>
                  <th className="py-3 px-4">Dinner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 bg-white">
                {weeklyMessMenu.map((m, idx) => (
                  <tr key={m.day} className={idx % 2 === 1 ? 'bg-sand-50' : 'bg-white'}>
                    <td className="py-3 px-4 font-bold text-forest-900 border-r border-sand-200 whitespace-nowrap">
                      {m.day}
                    </td>
                    <td className="py-3 px-4 text-sand-900 border-r border-sand-200">
                      {m.breakfast}
                    </td>
                    <td className="py-3 px-4 text-sand-900 border-r border-sand-200">
                      {m.lunch}
                    </td>
                    <td className="py-3 px-4 text-sand-900 border-r border-sand-200">
                      {m.snacks}
                    </td>
                    <td className="py-3 px-4 text-sand-900 font-medium">
                      {m.dinner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Location and Proximity */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-sand-200 p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <span className="text-xs uppercase tracking-wider font-bold text-forest-800">
              Campus Proximity
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest-900 mt-1">
              Location and Nearby Landmarks
            </h2>
            <p className="text-sm text-sand-800 mt-2">
              Situated in a quiet student residential locality in Indore with easy walking access to the university.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-sand-50 border border-sand-200">
              <span className="text-forest-900 font-bold block text-sm">Bus Station</span>
              <span className="text-sand-800">7 km</span>
            </div>
            <div className="p-4 bg-sand-50 border border-sand-200">
              <span className="text-forest-900 font-bold block text-sm">Railway Station</span>
              <span className="text-sand-800">3.9 km</span>
            </div>
            <div className="p-4 bg-sand-50 border border-sand-200">
              <span className="text-forest-900 font-bold block text-sm">Local Market</span>
              <span className="text-sand-800">800 m</span>
            </div>
            <div className="p-4 bg-sand-50 border border-sand-200">
              <span className="text-forest-900 font-bold block text-sm">Airport</span>
              <span className="text-sand-800">10 km</span>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Notice and Visiting Rules */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-sand-100 border border-sand-200 p-8">
          <h3 className="font-display text-xl font-bold text-forest-900 mb-2">
            Direct Owner Communication
          </h3>
          <p className="text-sm text-sand-800 leading-relaxed max-w-3xl">
            Raj Stay does not engage third party brokers or real estate agents. Room allocation and security deposits are handled directly between the student, their parents or guardians, and the property owner. Prospective residents are welcome to schedule an in-person room inspection before submitting a booking request.
          </p>
        </div>
      </section>

      {/* Photo Viewer Modal */}
      {activeGallery && (
        <div className="fixed inset-0 bg-sand-900/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-sand-300 max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-sand-200 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-forest-900">
                  {activeGallery.title}
                </h3>
                <span className="text-xs text-sand-800">
                  Photo {activeGallery.index + 1} of {activeGallery.photos.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveGallery(null)}
                className="text-sand-800 hover:text-sand-900 font-bold text-lg px-2 py-1 border border-sand-300 bg-sand-100 hover:bg-sand-200"
              >
                Close ✕
              </button>
            </div>

            <div className="relative flex-grow flex items-center justify-center bg-sand-900/5 min-h-[350px] max-h-[550px] overflow-hidden border border-sand-200">
              <img
                src={activeGallery.photos[activeGallery.index]}
                alt={`Photo ${activeGallery.index + 1}`}
                className="max-h-[500px] w-auto max-w-full object-contain mx-auto"
              />

              <button
                type="button"
                onClick={prevGalleryPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-sand-900/80 hover:bg-sand-900 text-white font-bold p-3 text-sm border border-sand-700"
                aria-label="Previous photo"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={nextGalleryPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-sand-900/80 hover:bg-sand-900 text-white font-bold p-3 text-sm border border-sand-700"
                aria-label="Next photo"
              >
                ▶
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-2 overflow-x-auto py-1">
                {activeGallery.photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGallery((prev) => ({ ...prev, index: idx }))}
                    className={`h-12 w-12 border overflow-hidden ${
                      idx === activeGallery.index
                        ? 'border-forest-900 ring-2 ring-forest-900'
                        : 'border-sand-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveGallery(null)}
                className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-sand-900 text-xs font-semibold border border-sand-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
