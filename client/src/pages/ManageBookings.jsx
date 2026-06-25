import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { Search, Filter, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getAll();
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = bookings;

    if (statusFilter !== 'All') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.user?.name?.toLowerCase().includes(term) ||
          b.user?.email?.toLowerCase().includes(term) ||
          b.hotel?.name?.toLowerCase().includes(term) ||
          b._id.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(result);
  }, [searchTerm, statusFilter, bookings]);

  const handleStatusUpdate = async (id, status) => {
    const confirmAction = window.confirm(`Update booking status to ${status}?`);
    if (!confirmAction) return;

    setActionLoading(true);
    try {
      await bookingAPI.updateStatus(id, status);
      setSuccess(`Booking status changed to ${status}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError('Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Bookings</h1>
          <p className="text-sm text-slate-500">Monitor and manage guest reservations globally.</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchBookings();
          }}
          className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-slate-200 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search user, hotel, or ref ID..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-slate-200 border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
          >
            <option value="All">All Bookings</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white h-16 rounded-lg border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">
          No matching reservations found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Ref ID / User</th>
                  <th className="p-4">Hotel / Room</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Total Cost</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{booking.user?.name || 'Deleted User'}</p>
                      <p className="text-xs text-slate-400">{booking.user?.email || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{booking._id}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{booking.hotel?.name || 'Deleted Hotel'}</p>
                      <p className="text-xs text-slate-500">
                        Room {booking.room?.roomNumber} ({booking.room?.type})
                      </p>
                    </td>
                    <td className="p-4 text-xs">
                      <p>
                        In: <span className="font-medium text-slate-900">{formatDate(booking.checkInDate)}</span>
                      </p>
                      <p>
                        Out: <span className="font-medium text-slate-900">{formatDate(booking.checkOutDate)}</span>
                      </p>
                    </td>
                    <td className="p-4 font-bold text-slate-950">${booking.totalPrice}</td>
                    <td className="p-4">
                      {booking.status === 'Confirmed' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Confirmed</span>
                        </span>
                      ) : booking.status === 'Cancelled' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" />
                          <span>Cancelled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end space-x-2 items-center h-full">
                      {booking.status === 'Confirmed' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded transition"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                            className="bg-emerald-550 hover:bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                          >
                            Confirm
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
