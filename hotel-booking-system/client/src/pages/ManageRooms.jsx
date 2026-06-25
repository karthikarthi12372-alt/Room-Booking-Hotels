import { useState, useEffect } from 'react';
import { roomAPI, hotelAPI } from '../services/api';
import { Trash2, Edit, Plus, X } from 'lucide-react';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Single');
  const [pricePerNight, setPricePerNight] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [amenities, setAmenities] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        roomAPI.getAll(),
        hotelAPI.getAll({ limit: 100 }),
      ]);
      setRooms(roomsRes.data || []);
      const hotelList = hotelsRes.data?.hotels || [];
      setHotels(hotelList);
      if (hotelList.length > 0) setSelectedHotelId(hotelList[0]._id);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch rooms metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setRoomNumber('');
    setType('Single');
    setPricePerNight('');
    setCapacity('1');
    setAmenities('');
    setImageUrl('');
    setError('');
    setFormOpen(true);
  };

  const openEditForm = (room) => {
    setEditingId(room._id);
    setSelectedHotelId(room.hotel?._id || '');
    setRoomNumber(room.roomNumber);
    setType(room.type);
    setPricePerNight(room.pricePerNight.toString());
    setCapacity(room.capacity.toString());
    setAmenities(room.amenities?.join(', ') || '');
    setImageUrl(room.images?.[0] || '');
    setError('');
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this room?\nThis will remove all past and future bookings associated with it!'
    );
    if (!confirmDelete) return;

    try {
      await roomAPI.delete(id);
      setSuccess('Room and bookings removed successfully');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete room');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedHotelId || !roomNumber || !pricePerNight || !capacity) {
      setError('Please fill in all required fields');
      return;
    }

    const amenitiesList = amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      hotel: selectedHotelId,
      roomNumber,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      amenities: amenitiesList,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      if (editingId) {
        await roomAPI.update(editingId, payload);
        setSuccess('Room updated successfully');
      } else {
        await roomAPI.create(payload);
        setSuccess('New Room added successfully');
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Rooms</h1>
          <p className="text-sm text-slate-500">Configure room inventories, capacities and pricing.</p>
        </div>
        {hotels.length > 0 && (
          <button
            onClick={openCreateForm}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Room</span>
          </button>
        )}
      </div>

      {hotels.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          You must create at least one hotel first before adding rooms.
        </div>
      )}

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

      {/* Form Dialog */}
      {formOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg font-sans">
              {editingId ? 'Edit Room Settings' : 'Add New Room'}
            </h3>
            <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Associate Hotel *
                </label>
                <select
                  disabled={editingId !== null} // Lock hotel on editing
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-100"
                  required
                >
                  {hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.name} ({hotel.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. 101"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Room Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Price Per Night ($) *
                </label>
                <input
                  type="number"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="150"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Capacity (Guests) *
                </label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Room Amenities (comma-separated)
              </label>
              <input
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="WiFi, AC, TV, MiniBar"
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Room Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... (optional)"
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Create Room'}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white h-16 rounded-lg border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">
          No rooms configured yet. Click "Add Room" above.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Hotel</th>
                <th className="p-4">Room No.</th>
                <th className="p-4">Type</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Price / Night</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">{room.hotel?.name || 'Deleted Hotel'}</td>
                  <td className="p-4">{room.roomNumber}</td>
                  <td className="p-4">{room.type}</td>
                  <td className="p-4">{room.capacity} Guest(s)</td>
                  <td className="p-4 font-bold text-primary-600">${room.pricePerNight}</td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button
                      onClick={() => openEditForm(room)}
                      className="p-1 text-slate-500 hover:text-primary-600 transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="p-1 text-slate-500 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
