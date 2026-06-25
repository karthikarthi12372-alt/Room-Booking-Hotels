import { useState, useEffect } from 'react';
import { hotelAPI } from '../services/api';
import { Trash2, Edit, Plus, X, Search } from 'lucide-react';

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [amenities, setAmenities] = useState('');
  const [rating, setRating] = useState('0');
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHotels = async () => {
    try {
      const { data } = await hotelAPI.getAll({ limit: 100 });
      setHotels(data.hotels || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch hotels list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setAddress('');
    setCity('');
    setAmenities('');
    setRating('0');
    setImageUrl('');
    setError('');
    setFormOpen(true);
  };

  const openEditForm = (hotel) => {
    setEditingId(hotel._id);
    setName(hotel.name);
    setDescription(hotel.description);
    setAddress(hotel.address);
    setCity(hotel.city);
    setAmenities(hotel.amenities?.join(', ') || '');
    setRating(hotel.rating.toString());
    setImageUrl(hotel.images?.[0] || '');
    setError('');
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this hotel?\nThis will permanently delete all associated rooms and bookings!'
    );
    if (!confirmDelete) return;

    try {
      await hotelAPI.delete(id);
      setSuccess('Hotel and its records deleted successfully');
      fetchHotels();
    } catch (err) {
      console.error(err);
      setError('Failed to delete hotel');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !description || !address || !city) {
      setError('Please fill in all required fields');
      return;
    }

    const amenitiesList = amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      name,
      description,
      address,
      city,
      rating: Number(rating),
      amenities: amenitiesList,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      if (editingId) {
        await hotelAPI.update(editingId, payload);
        setSuccess('Hotel details updated successfully!');
      } else {
        await hotelAPI.create(payload);
        setSuccess('New Hotel added successfully!');
      }
      setFormOpen(false);
      fetchHotels();
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
          <h1 className="text-2xl font-bold text-slate-900">Manage Hotels</h1>
          <p className="text-sm text-slate-500">Configure parameters for properties listing.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Hotel</span>
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

      {/* Editor Modal / Card */}
      {formOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg">
              {editingId ? 'Edit Hotel Details' : 'Add New Hotel'}
            </h3>
            <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Full Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="WiFi, Gym, Pool, Parking"
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Rating (0 - 5)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="0">0.0</option>
                  <option value="1">1.0</option>
                  <option value="2">2.0</option>
                  <option value="3">3.0</option>
                  <option value="4">4.0</option>
                  <option value="5">5.0</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Image URL
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
                {editingId ? 'Save Changes' : 'Create Hotel'}
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

      {/* Hotels List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white h-16 rounded-lg border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">
          No hotels configured yet. Click "Add Hotel" above.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Hotel Name</th>
                <th className="p-4">City</th>
                <th className="p-4">Address</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {hotels.map((hotel) => (
                <tr key={hotel._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">{hotel.name}</td>
                  <td className="p-4">{hotel.city}</td>
                  <td className="p-4 max-w-xs truncate">{hotel.address}</td>
                  <td className="p-4 font-semibold text-amber-600">{hotel.rating.toFixed(1)} Stars</td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button
                      onClick={() => openEditForm(hotel)}
                      className="p-1 text-slate-500 hover:text-primary-600 transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
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

export default ManageHotels;
