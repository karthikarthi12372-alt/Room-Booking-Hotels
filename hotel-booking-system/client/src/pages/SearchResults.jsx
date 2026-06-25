import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { hotelAPI } from '../services/api';
import { Search, MapPin, Star, Filter, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';

const AMENITIES_OPTIONS = ['WiFi', 'Pool', 'Gym', 'Parking', 'Spa', 'AC', 'Restaurant'];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search States
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Sync state from query params
  const city = searchParams.get('city') || '';
  const searchInput = searchParams.get('search') || '';
  const ratingInput = searchParams.get('rating') || '';
  const selectedAmenities = searchParams.get('amenities')
    ? searchParams.get('amenities').split(',')
    : [];
  const page = Number(searchParams.get('page')) || 1;

  // Filter Form State
  const [cityField, setCityField] = useState(city);
  const [searchField, setSearchField] = useState(searchInput);
  const [ratingField, setRatingField] = useState(ratingInput);
  const [amenitiesField, setAmenitiesField] = useState(selectedAmenities);

  // Sync state if search params change externally
  useEffect(() => {
    setCityField(city);
    setSearchField(searchInput);
    setRatingField(ratingInput);
    setAmenitiesField(selectedAmenities);
  }, [city, searchInput, ratingInput, searchParams]);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = {
          city,
          search: searchInput,
          rating: ratingInput,
          amenities: selectedAmenities.join(','),
          page,
          limit: 6,
        };

        const { data } = await hotelAPI.getAll(params);
        setHotels(data.hotels);
        setTotalPages(data.pages);
        setTotalResults(data.total);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [city, searchInput, ratingInput, searchParams, page]);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (cityField) params.set('city', cityField);
    if (searchField) params.set('search', searchField);
    if (ratingField) params.set('rating', ratingField);
    if (amenitiesField.length > 0) params.set('amenities', amenitiesField.join(','));
    params.set('page', '1'); // Reset to page 1

    // Carry forward reservation date/guest details if they were in the URL
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const capacity = searchParams.get('capacity');
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (capacity) params.set('capacity', capacity);

    setSearchParams(params);
  };

  const handleAmenityChange = (amenity) => {
    if (amenitiesField.includes(amenity)) {
      setAmenitiesField(amenitiesField.filter((a) => a !== amenity));
    } else {
      setAmenitiesField([...amenitiesField, amenity]);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setCityField('');
    setSearchField('');
    setRatingField('');
    setAmenitiesField([]);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Destination City
            </label>
            <input
              type="text"
              value={cityField}
              onChange={(e) => setCityField(e.target.value)}
              placeholder="Search by city..."
              className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Hotel Name / Keyword
            </label>
            <input
              type="text"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              placeholder="Search by hotel name..."
              className="w-full border-slate-200 border rounded-lg p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm h-[38px]"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6 h-fit shrink-0">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-primary-600 hover:underline transition"
            >
              Reset All
            </button>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Minimum Rating</label>
            <select
              value={ratingField}
              onChange={(e) => setRatingField(e.target.value)}
              className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4.0+ Stars</option>
              <option value="3">3.0+ Stars</option>
              <option value="2">2.0+ Stars</option>
            </select>
          </div>

          {/* Amenities Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Amenities</label>
            <div className="space-y-2">
              {AMENITIES_OPTIONS.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenitiesField.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleApplyFilters}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center space-x-1 shadow-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
        </aside>

        {/* Results Area */}
        <main className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-sm">
              Showing <span className="font-semibold text-slate-950">{totalResults}</span> hotels
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-xl h-80 animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-12 text-center space-y-3 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">No hotels match your search</p>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Try widening your city query, reducing minimum rating, or unchecking some amenities.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
                  <div
                    key={hotel._id}
                    onClick={() => {
                      const checkIn = searchParams.get('checkIn') || '';
                      const checkOut = searchParams.get('checkOut') || '';
                      const capacity = searchParams.get('capacity') || '';
                      const detailParams = new URLSearchParams();
                      if (checkIn) detailParams.set('checkIn', checkIn);
                      if (checkOut) detailParams.set('checkOut', checkOut);
                      if (capacity) detailParams.set('capacity', capacity);
                      navigate(`/hotels/${hotel._id}?${detailParams.toString()}`);
                    }}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-350 cursor-pointer group flex flex-col h-full"
                  >
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img
                        src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400'}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 text-xs font-semibold text-slate-800">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{hotel.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <span className="text-xs text-primary-600 font-semibold uppercase tracking-wider flex items-center space-x-1">
                          <MapPin className="h-3 w-3 inline" />
                          <span>{hotel.city}</span>
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{hotel.description}</p>
                      </div>
                      <div className="pt-2 flex flex-wrap gap-1">
                        {hotel.amenities?.map((amenity) => (
                          <span key={amenity} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-slate-600">
                    Page <span className="font-semibold">{page}</span> of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
