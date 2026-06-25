import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { Calendar, Bed, CircleDollarSign, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const { data } = await bookingAPI.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking?\nThis action cannot be undone.'
    );
    if (!confirmCancel) return;

    setActionLoading(true);
    try {
      await bookingAPI.cancel(bookingId);
      // Refresh list
      await fetchMyBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
            <XCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 font-sans">User Dashboard</h1>
        <p className="text-slate-500">Manage your active reservations and view booking history.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-xl h-44 border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center space-y-2 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No bookings found</p>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You don't have any bookings yet. Search for hotels to make your first reservation.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition duration-300"
            >
              {/* Hotel image */}
              <div className="w-full md:w-56 h-48 md:h-auto bg-slate-100 shrink-0">
                <img
                  src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400'}
                  alt={booking.hotel?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Booking metadata */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Reference ID: {booking._id}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">{booking.hotel?.name}</h2>
                  <p className="text-sm text-slate-500">{booking.hotel?.address}, {booking.hotel?.city}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-in</p>
                        <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-out</p>
                        <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Bed className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Room</p>
                        <p className="font-medium">
                          No. {booking.room?.roomNumber} ({booking.room?.type})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <CircleDollarSign className="h-5 w-5 text-primary-600" />
                    <p className="text-lg font-bold text-slate-900">
                      Total Cost:{' '}
                      <span className="text-primary-600">${booking.totalPrice}</span>
                    </p>
                  </div>

                  {booking.status === 'Confirmed' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancelBooking(booking._id)}
                      className="w-full sm:w-auto bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-sm px-4 py-2 rounded-lg transition"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
