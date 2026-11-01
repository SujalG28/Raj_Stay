import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Feedback form state
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  async function loadData() {
    if (!user) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking_requests')
        .select(`
          id,
          id_proof,
          permanent_address,
          move_in_date,
          status,
          reject_reason,
          created_at,
          rooms (
            id,
            type,
            price,
            capacity
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch student feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedbackList(feedbackData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setErrorMsg('Could not load your records. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  async function handleCancelBooking(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('student_id', user.id);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Cancel booking error:', err);
      alert('Failed to cancel booking: ' + err.message);
    }
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    setFeedbackSuccess('');
    setErrorMsg('');

    if (!feedbackMessage.trim()) return;

    setSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            student_id: user.id,
            message: feedbackMessage.trim(),
            rating: parseInt(feedbackRating, 10),
          },
        ]);

      if (error) throw error;
      setFeedbackSuccess('Your feedback has been submitted to the owner.');
      setFeedbackMessage('');
      setFeedbackRating('5');
      loadData();
    } catch (err) {
      console.error('Submit feedback error:', err);
      setErrorMsg('Failed to submit feedback: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-forest-100 text-forest-900 border border-forest-600">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-terracotta-100 text-terracotta-700 border border-terracotta-500">
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-sand-200 text-sand-800 border border-sand-300">
            Cancelled
          </span>
        );
      case 'moved_out':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-sand-200 text-sand-800 border border-sand-300">
            Moved Out
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-sand-100 text-sand-900 border border-sand-300">
            Pending Review
          </span>
        );
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-sand-800">
        Loading student dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Student Profile Header */}
      <div className="bg-white border border-sand-200 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-bold text-sand-800">
            Student Portal
          </div>
          <h1 className="font-display text-2xl font-bold text-forest-900 mt-1">
            {profile?.name || user?.email}
          </h1>
          <div className="text-xs text-sand-800 mt-1 space-x-4">
            <span>Email: {user?.email}</span>
            <span>Phone: {profile?.phone || 'Not provided'}</span>
          </div>
        </div>
        <Link
          to="/"
          className="bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs py-2.5 px-4 border border-forest-900 transition-colors"
        >
          View All Rooms
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-terracotta-50 border border-terracotta-500 text-terracotta-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Bookings Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-forest-900">
            My Room Bookings
          </h2>
          <span className="text-xs text-sand-800">
            {bookings.length} {bookings.length === 1 ? 'request' : 'requests'} found
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-sand-200 p-8 text-center text-sm text-sand-800">
            <p className="mb-4">You have not submitted any room booking requests yet.</p>
            <Link
              to="/"
              className="inline-block bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold px-4 py-2 border border-forest-900"
            >
              Explore Available Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-sand-200 p-6 flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-display text-lg font-bold text-forest-900 uppercase">
                      {booking.rooms?.type} Room
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="text-sm text-sand-900 font-semibold">
                    Rent: ₹{booking.rooms?.price?.toLocaleString('en-IN')}/month
                  </div>

                  <div className="text-xs text-sand-800 space-y-0.5">
                    <div>Requested Move-in: {booking.move_in_date}</div>
                    <div>Applied On: {new Date(booking.created_at).toLocaleDateString()}</div>
                    <div>ID Document: {booking.id_proof}</div>
                    <div>Permanent Address: {booking.permanent_address}</div>
                  </div>

                  {booking.status === 'rejected' && booking.reject_reason && (
                    <div className="p-3 mt-2 bg-sand-50 border border-sand-300 text-xs text-sand-900">
                      <span className="font-bold text-terracotta-700">Reason for rejection: </span>
                      {booking.reject_reason}
                    </div>
                  )}

                  {booking.status === 'approved' && (
                    <div className="p-3 mt-2 bg-forest-50 border border-forest-600 text-xs text-forest-900">
                      Your room has been approved by the owner. Please contact the owner on arrival to verify your original documents and collect your room key.
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end items-end gap-2">
                  {booking.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-xs font-semibold text-terracotta-700 hover:text-terracotta-600 py-1 px-3 border border-sand-300 bg-sand-50 hover:bg-sand-100"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feedback Section */}
      <section className="border-t border-sand-200 pt-8">
        <h2 className="font-display text-xl font-bold text-forest-900 mb-4">
          Submit Feedback or Maintenance Notice
        </h2>
        <div className="bg-white border border-sand-200 p-6 sm:p-8">
          {feedbackSuccess && (
            <div className="p-4 mb-4 bg-forest-50 border border-forest-600 text-forest-900 text-sm">
              {feedbackSuccess}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                Rating
              </label>
              <select
                id="rating"
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 text-sm"
              >
                <option value="5">5 / 5 - Excellent</option>
                <option value="4">4 / 5 - Good</option>
                <option value="3">3 / 5 - Average</option>
                <option value="2">2 / 5 - Needs Attention</option>
                <option value="1">1 / 5 - Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-sand-900 uppercase tracking-wider mb-1">
                Message / Maintenance Details
              </label>
              <textarea
                id="message"
                rows={3}
                required
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Share your stay experience or report any repairs needed in your room..."
                className="w-full px-3 py-2 border border-sand-300 bg-sand-50 text-sand-900 focus:outline-none focus:border-forest-700 focus:bg-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="bg-forest-800 hover:bg-forest-900 text-white font-semibold py-2 px-5 text-xs border border-forest-900 transition-colors disabled:opacity-60"
            >
              {submittingFeedback ? 'Submitting...' : 'Send to Owner'}
            </button>
          </form>

          {feedbackList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-sand-200">
              <h3 className="text-xs uppercase tracking-wider font-bold text-sand-800 mb-3">
                Your Previous Submissions
              </h3>
              <div className="space-y-2">
                {feedbackList.map((item) => (
                  <div key={item.id} className="p-3 bg-sand-50 border border-sand-200 text-xs">
                    <div className="flex justify-between items-center text-sand-800 mb-1">
                      <span className="font-semibold text-forest-900">Rating: {item.rating} / 5</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sand-900">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
