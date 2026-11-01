import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'rooms' | 'feedback'
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Rejection modal state
  const [rejectingBookingId, setRejectingBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit room state
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editOccupied, setEditOccupied] = useState(0);
  const [editPrice, setEditPrice] = useState(0);

  async function loadAllData() {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch Rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('capacity', { ascending: true });
      if (roomsError) throw roomsError;
      setRooms(roomsData || []);

      // 2. Fetch Bookings with linked student profiles and rooms
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
          room_id,
          rooms (
            id,
            type,
            price,
            capacity,
            occupied
          ),
          profiles (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // 3. Fetch Feedback with student profiles
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          id,
          message,
          rating,
          created_at,
          profiles (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);
    } catch (err) {
      console.error('Error fetching admin records:', err);
      setErrorMsg('Failed to load records from database: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  async function handleApproveBooking(booking) {
    if (!window.confirm(`Approve booking request for ${booking.profiles?.name || 'this student'}?`)) {
      return;
    }

    setActionLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Update booking status
      const { error: bookingUpdateError } = await supabase
        .from('booking_requests')
        .update({ status: 'approved' })
        .eq('id', booking.id);
      if (bookingUpdateError) throw bookingUpdateError;

      // 2. Increment room occupied count if not exceeding capacity
      const currentOccupied = booking.rooms?.occupied || 0;
      const capacity = booking.rooms?.capacity || 1;
      if (currentOccupied < capacity) {
        await supabase
          .from('rooms')
          .update({ occupied: currentOccupied + 1 })
          .eq('id', booking.room_id);
      }

      setSuccessMsg('Booking request approved and room record updated.');
      loadAllData();
    } catch (err) {
      console.error('Approval failed:', err);
      setErrorMsg('Failed to approve booking: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectingBookingId) return;

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({
          status: 'rejected',
          reject_reason: rejectReason.trim(),
        })
        .eq('id', rejectingBookingId);

      if (error) throw error;
      setSuccessMsg('Booking request rejected with reason recorded.');
      setRejectingBookingId(null);
      setRejectReason('');
      loadAllData();
    } catch (err) {
      console.error('Rejection failed:', err);
      setErrorMsg('Failed to reject booking: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(booking, newStatus) {
    setActionLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Update the booking status
      const { error } = await supabase
        .from('booking_requests')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (error) throw error;

      // 2. If moving an approved guest out, decrement room occupied count
      if (booking.status === 'approved' && (newStatus === 'moved_out' || newStatus === 'cancelled' || newStatus === 'rejected')) {
        const currentOccupied = booking.rooms?.occupied ?? 1;
        const newOccupied = Math.max(0, currentOccupied - 1);

        const { error: roomError } = await supabase
          .from('rooms')
          .update({ occupied: newOccupied })
          .eq('id', booking.room_id);

        if (roomError) console.error('Error updating room occupancy on move-out:', roomError);
      }

      setSuccessMsg(`Status updated to ${newStatus.replace('_', ' ')}.`);
      await loadAllData();
    } catch (err) {
      console.error('Status update failed:', err);
      setErrorMsg('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSyncOccupancy() {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Recalculate occupancy for every room based on active approved bookings
      for (const room of rooms) {
        const approvedCount = bookings.filter(
          (b) => b.room_id === room.id && b.status === 'approved'
        ).length;

        if (room.occupied !== approvedCount) {
          await supabase
            .from('rooms')
            .update({ occupied: approvedCount })
            .eq('id', room.id);
        }
      }

      setSuccessMsg('Room occupancy successfully synchronized with active approved bookings.');
      await loadAllData();
    } catch (err) {
      console.error('Sync error:', err);
      setErrorMsg('Failed to sync occupancy: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveRoom(roomId) {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          occupied: parseInt(editOccupied, 10),
          price: parseFloat(editPrice),
        })
        .eq('id', roomId);

      if (error) throw error;
      setSuccessMsg('Room details updated in database.');
      setEditingRoomId(null);
      loadAllData();
    } catch (err) {
      console.error('Update room error:', err);
      setErrorMsg('Failed to update room: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm text-sand-800">
        Loading property management dashboard...
      </div>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + (r.occupied || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white border border-sand-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-terracotta-600">
              Administrator Access
            </div>
            <h1 className="font-display text-2xl font-bold text-forest-900 mt-1">
              Raj Stay Management Portal
            </h1>
            <p className="text-xs text-sand-800 mt-1">
              Logged in as {profile?.name || 'Owner'} ({profile?.email})
            </p>
          </div>
          <button
            type="button"
            onClick={loadAllData}
            className="text-xs font-semibold px-4 py-2 bg-sand-100 hover:bg-sand-200 border border-sand-300 text-sand-900 transition-colors"
          >
            Refresh Records
          </button>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sand-200 text-sm">
          <div>
            <div className="text-xs text-sand-800">Rooms Listed</div>
            <div className="font-display text-2xl font-bold text-forest-900 mt-1">{rooms.length}</div>
          </div>
          <div>
            <div className="text-xs text-sand-800">Total Bed Capacity</div>
            <div className="font-display text-2xl font-bold text-forest-900 mt-1">{totalCapacity}</div>
          </div>
          <div>
            <div className="text-xs text-sand-800">Current Occupants</div>
            <div className="font-display text-2xl font-bold text-forest-900 mt-1">{totalOccupied}</div>
          </div>
          <div>
            <div className="text-xs text-sand-800">Pending Requests</div>
            <div className="font-display text-2xl font-bold text-terracotta-600 mt-1">{pendingCount}</div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-forest-50 border border-forest-600 text-forest-900 text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-terracotta-50 border border-terracotta-500 text-terracotta-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-sand-200 flex space-x-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 ${
            activeTab === 'bookings'
              ? 'text-forest-900 border-b-2 border-forest-900'
              : 'text-sand-800 hover:text-forest-900'
          }`}
        >
          Booking Requests ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`pb-3 ${
            activeTab === 'rooms'
              ? 'text-forest-900 border-b-2 border-forest-900'
              : 'text-sand-800 hover:text-forest-900'
          }`}
        >
          Rooms and Occupancy ({rooms.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 ${
            activeTab === 'feedback'
              ? 'text-forest-900 border-b-2 border-forest-900'
              : 'text-sand-800 hover:text-forest-900'
          }`}
        >
          Student Feedback ({feedback.length})
        </button>
      </div>

      {/* Tab 1: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white border border-sand-200 p-8 text-center text-sm text-sand-800">
              No booking applications received yet.
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-sand-200 p-6 flex flex-col lg:flex-row justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-display font-bold text-lg text-forest-900 uppercase">
                      {b.rooms?.type} Room Request
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold border ${
                        b.status === 'approved'
                          ? 'bg-forest-100 text-forest-900 border-forest-600'
                          : b.status === 'rejected'
                          ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-500'
                          : 'bg-sand-100 text-sand-900 border-sand-300'
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-sand-900 pt-1">
                    <div>
                      <span className="text-sand-800 font-semibold">Student: </span>
                      {b.profiles?.name || 'Not provided'}
                    </div>
                    <div>
                      <span className="text-sand-800 font-semibold">Phone: </span>
                      {b.profiles?.phone || 'Not provided'}
                    </div>
                    <div>
                      <span className="text-sand-800 font-semibold">Email: </span>
                      {b.profiles?.email || 'Not provided'}
                    </div>
                    <div>
                      <span className="text-sand-800 font-semibold">Move-in Date: </span>
                      {b.move_in_date}
                    </div>
                    <div>
                      <span className="text-sand-800 font-semibold">ID Proof: </span>
                      {b.id_proof}
                    </div>
                    <div>
                      <span className="text-sand-800 font-semibold">Submitted: </span>
                      {new Date(b.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-xs text-sand-900 pt-1">
                    <span className="text-sand-800 font-semibold">Address: </span>
                    {b.permanent_address}
                  </div>

                  {b.reject_reason && (
                    <div className="p-3 bg-sand-50 border border-sand-300 text-xs text-sand-900">
                      <span className="font-bold text-terracotta-700">Rejection note: </span>
                      {b.reject_reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col justify-end items-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
                  {b.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleApproveBooking(b)}
                        className="bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs px-4 py-2 border border-forest-900 transition-colors"
                      >
                        Approve Booking
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setRejectingBookingId(b.id);
                          setRejectReason('');
                        }}
                        className="bg-sand-100 hover:bg-sand-200 text-terracotta-700 font-semibold text-xs px-4 py-2 border border-sand-300 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {b.status === 'approved' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange(b, 'moved_out')}
                      className="text-xs text-sand-800 hover:text-sand-900 underline py-1 px-2"
                    >
                      Mark as Moved Out
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rejection Modal / Prompt */}
      {rejectingBookingId && (
        <div className="fixed inset-0 bg-sand-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-sand-300 p-6 max-w-lg w-full space-y-4">
            <h3 className="font-display text-lg font-bold text-forest-900">
              Reject Booking Application
            </h3>
            <p className="text-xs text-sand-800">
              Please state why this request cannot be accepted (e.g., room fully allocated, document verification incomplete).
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason for the student..."
                className="w-full p-2 border border-sand-300 bg-sand-50 text-sm focus:outline-none focus:border-forest-700"
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectingBookingId(null)}
                  className="px-4 py-2 text-xs font-semibold border border-sand-300 text-sand-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold bg-terracotta-600 hover:bg-terracotta-700 text-white"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Rooms and Occupancy */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-sand-100 p-4 border border-sand-200 gap-3">
            <div>
              <h3 className="font-display font-bold text-sm text-forest-900">
                Live Occupancy Manager
              </h3>
              <p className="text-xs text-sand-800">
                Update vacancy manually or synchronize with currently active approved bookings.
              </p>
            </div>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleSyncOccupancy}
              className="bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs px-4 py-2 border border-forest-900 transition-colors"
            >
              Sync Occupancy with Bookings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const isEditing = editingRoomId === room.id;

              return (
                <div key={room.id} className="bg-white border border-sand-200 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-sand-200">
                      <span className="font-display font-bold text-lg text-forest-900 uppercase">
                        {room.type} Room
                      </span>
                      <span className="text-xs text-sand-800 font-semibold">
                        Capacity: {room.capacity}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 py-2 text-xs">
                        <div>
                          <label className="block font-semibold text-sand-800 mb-1">
                            Occupied Beds (Max {room.capacity}):
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={room.capacity}
                            value={editOccupied}
                            onChange={(e) => setEditOccupied(e.target.value)}
                            className="w-full p-2 border border-sand-300 bg-sand-50"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-sand-800 mb-1">
                            Monthly Price (₹):
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full p-2 border border-sand-300 bg-sand-50"
                          />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleSaveRoom(room.id)}
                            className="px-3 py-1.5 bg-forest-800 text-white font-semibold text-xs"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRoomId(null)}
                            className="px-3 py-1.5 border border-sand-300 text-sand-800 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <div className="font-display text-2xl font-bold text-forest-900">
                            ₹{room.price?.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-sand-800 mt-1">
                            Occupied: <span className="font-bold text-forest-900">{room.occupied}</span> of {room.capacity} beds
                          </div>
                        </div>

                        <p className="text-xs text-sand-800 leading-relaxed mb-4">
                          {room.description}
                        </p>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoomId(room.id);
                        setEditOccupied(room.occupied);
                        setEditPrice(room.price);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold bg-sand-100 hover:bg-sand-200 border border-sand-300 text-sand-900 transition-colors"
                    >
                      Update Price or Occupancy
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Student Feedback */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <div className="bg-white border border-sand-200 p-8 text-center text-sm text-sand-800">
              No feedback or maintenance requests recorded.
            </div>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="bg-white border border-sand-200 p-6 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-forest-900">
                    Rating: {item.rating} / 5
                  </span>
                  <span className="text-sand-800">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-sand-900 leading-relaxed">
                  {item.message}
                </p>
                <div className="pt-2 border-t border-sand-200 text-xs text-sand-800">
                  From: {item.profiles?.name || 'Student'} ({item.profiles?.email || 'No email'}) {item.profiles?.phone ? `| Phone: ${item.profiles?.phone}` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
