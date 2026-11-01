import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function BookRoom() {
  const { roomId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [idProof, setIdProof] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadRoom() {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error) throw error;
        setRoom(data);
      } catch (err) {
        console.error('Error fetching room details:', err.message);
        setErrorMsg('Unable to find selected room. Please choose from available rooms.');
      } finally {
        setLoadingRoom(false);
      }
    }

    if (roomId) loadRoom();
  }, [roomId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to submit a booking request.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('booking_requests')
        .insert([
          {
            student_id: user.id,
            room_id: roomId,
            id_proof: idProof.trim(),
            permanent_address: permanentAddress.trim(),
            move_in_date: moveInDate,
            status: 'pending',
          },
        ]);

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      console.error('Booking request failed:', err);
      setErrorMsg(err.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingRoom) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-sm text-sand-800">
        Loading room specification...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sand-800 mb-4">{errorMsg || 'Room not found.'}</p>
        <Link to="/" className="text-forest-800 font-semibold underline">
          Return to room options
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white border border-sand-200 p-8 shadow-sm">
        <div className="border-b border-sand-200 pb-6 mb-6">
          <div className="text-xs uppercase tracking-wider font-bold text-sand-800 mb-1">
            Room Booking Application
          </div>
          <h1 className="font-display text-2xl font-bold text-forest-900">
            Apply for {room.type.toUpperCase()} Room
          </h1>
          <p className="text-sm text-sand-800 mt-1">
            Rate: ₹{room.price.toLocaleString('en-IN')}/month | Capacity: {room.capacity} student(s) | Current Occupants: {room.occupied}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-6 bg-terracotta-50 border border-terracotta-500 text-terracotta-700 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                Student Name
              </label>
              <input
                type="text"
                disabled
                value={profile?.name || user?.email || ''}
                className="w-full px-3 py-2 border border-sand-300 bg-sand-100 text-sand-800 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                disabled
                value={profile?.phone || 'Not provided'}
                className="w-full px-3 py-2 border border-sand-300 bg-sand-100 text-sand-800 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="idProof" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
              Government ID or College Roll Number
            </label>
            <input
              id="idProof"
              type="text"
              required
              value={idProof}
              onChange={(e) => setIdProof(e.target.value)}
              placeholder="e.g. Aadhaar 1234-5678-9012 or College Roll 22CS045"
              className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
              Permanent Home Address
            </label>
            <textarea
              id="address"
              rows={3}
              required
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              placeholder="House number, Street, District, State, PIN Code"
              className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="moveInDate" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
              Requested Move-in Date
            </label>
            <input
              id="moveInDate"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
            />
          </div>

          <div className="pt-4 border-t border-sand-200 flex items-center justify-between">
            <Link
              to="/"
              className="text-xs font-semibold text-sand-800 hover:text-forest-900 underline"
            >
              Cancel and return
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-forest-800 hover:bg-forest-900 text-white font-semibold py-2.5 px-6 text-sm border border-forest-900 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting request...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
