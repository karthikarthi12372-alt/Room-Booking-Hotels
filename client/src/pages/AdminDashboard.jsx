import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelAPI, roomAPI, bookingAPI } from '../services/api';
import { Hotel, Bed, CalendarCheck, CircleDollarSign, ArrowUpRight, LayoutGrid, Settings, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    hotelsCount: 0,
    roomsCount: 0,
    bookingsCount: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hotelsRes, roomsRes, bookingsRes] = await Promise.all([
          hotelAPI.getAll({ limit: 1000 }), // Fetch all
          roomAPI.getAll(),
          bookingAPI.getAll(),
        ]);

        const bookings = bookingsRes.data || [];
        const revenue = bookings
          .filter((b) => b.status === 'Confirmed')
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        setStats({
          hotelsCount: hotelsRes.data?.total || 0,
          roomsCount: roomsRes.data?.length || 0,
          bookingsCount: bookings.length,
          revenue,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Shield className="h-8 w-8 text-amber-600" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-slate-500">Monitor platform metrics, manage inventories, and track bookings.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl h-28 border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
              <Hotel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Hotels</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.hotelsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Bed className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Rooms</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.roomsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.bookingsCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">${stats.revenue}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Nav cards to sub pages */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <LayoutGrid className="h-5 w-5 text-slate-500" />
          <span>Management Modules</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Manage Hotels</h3>
              <p className="text-sm text-slate-500">Add, edit details, or remove properties from the catalog.</p>
            </div>
            <Link
              to="/admin/hotels"
              className="bg-primary-600 hover:bg-primary-750 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center justify-center space-x-1"
            >
              <span>Manage Hotels</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Manage Rooms</h3>
              <p className="text-sm text-slate-500">Configure room details, capacities, price points, and assignments.</p>
            </div>
            <Link
              to="/admin/rooms"
              className="bg-primary-600 hover:bg-primary-750 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center justify-center space-x-1"
            >
              <span>Manage Rooms</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Manage Bookings</h3>
              <p className="text-sm text-slate-500">Monitor all reservation records and adjust confirmation states.</p>
            </div>
            <Link
              to="/admin/bookings"
              className="bg-primary-600 hover:bg-primary-750 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center justify-center space-x-1"
            >
              <span>Manage Bookings</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
