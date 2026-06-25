import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelAPI } from '../services/api';
import { Search, MapPin, Calendar, Users, Star, ArrowRight } from 'lucide-react';

const Home = () => {
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await hotelAPI.getAll({ limit: 3 });
        setFeaturedHotels(data.hotels);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('capacity', guests);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden opacity-30 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200')" }}></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find Your Next Perfect Stay
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Book premium hotels & luxury rooms at guaranteed best rates. Experience seamless booking.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white text-slate-900 rounded-xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 items-end text-left border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Destination (City)</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York"
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Check-in</span>
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Check-out</span>
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Guests</span>
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            <div className="md:col-span-4 mt-2">
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <Search className="h-5 w-5" />
                <span>Search Available Rooms</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900">Featured Stays</h2>
            <p className="text-slate-500">Explore some of our handpicked top-rated hotels</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1 hover:underline transition"
          >
            <span>See all hotels</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl h-80 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHotels.map((hotel) => (
              <div
                key={hotel._id}
                onClick={() => navigate(`/hotels/${hotel._id}`)}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer group"
              >
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <img
                    src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400'}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 text-xs font-semibold text-slate-800">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{hotel.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-xs text-primary-600 font-semibold uppercase tracking-wider">
                    {hotel.city}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{hotel.description}</p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {hotel.amenities?.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Why StaySphere?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We provide premium amenities and the smoothest hotel booking process ever built.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl space-y-3 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto text-xl font-bold">1</div>
              <h3 className="text-lg font-bold text-slate-900">Verified Hotels</h3>
              <p className="text-slate-500 text-sm">Every hotel in our catalogue is rigorously vetted for safety, cleanliness, and quality.</p>
            </div>
            <div className="bg-white p-6 rounded-xl space-y-3 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto text-xl font-bold">2</div>
              <h3 className="text-lg font-bold text-slate-900">No Booking Fees</h3>
              <p className="text-slate-500 text-sm">We provide completely transparent pricing, showing all rates upfront with zero hidden charges.</p>
            </div>
            <div className="bg-white p-6 rounded-xl space-y-3 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto text-xl font-bold">3</div>
              <h3 className="text-lg font-bold text-slate-900">Instant Confirmations</h3>
              <p className="text-slate-500 text-sm">Your booking is sent straight to the hotel PMS instantly, securing your room in real-time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
