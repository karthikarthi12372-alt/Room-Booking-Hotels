import { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { hotelAPI, roomAPI, bookingAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Star, MapPin, Calendar, Users, AlertCircle, CheckCircle, Bed, Armchair } from 'lucide-react';

const HotelDetails = () => {
  const { id: hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // States
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reservation details
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('capacity') || '1');

  // Load hotel details
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const { data } = await hotelAPI.getById(hotelId);
        setHotel(data.hotel);
      } catch (err) {
        console.error('Error fetching hotel:', err);
        setError('Failed to fetch hotel details');
      }
    };
    fetchHotelDetails();
  }, [hotelId]);

  // Load available rooms based on selected check-in/check-out dates
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          hotelId,
          capacity: guests,
        };

        if (checkIn && checkOut) {
          params.checkIn = checkIn;
          params.checkOut = checkOut;
        }

        const { data } = await roomAPI.getAll(params);
        setRooms(data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(err.response?.data?.message || 'Failed to check room availability');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId, checkIn, checkOut, guests]);

  const handleBookRoom = async (room) => {
    setError('');
    setSuccess('');

    if (!user) {
      navigate(`/login?redirect=/hotels/${hotelId}`);
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select Check-in and Check-out dates first');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      setError('Check-in date cannot be in the past');
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    // Calculate nights
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(diffTime / (1000 * 3600 * 24));
    const totalPrice = nights * room.pricePerNight;

    const confirmBooking = window.confirm(
      `Confirm Booking for ${room.type} Room?\n` +
      `Dates: ${checkIn} to ${checkOut}\n` +
      `Duration: ${nights} Night(s)\n` +
      `Total Cost: $${totalPrice}`
    );

    if (!confirmBooking) return;

    setBookingLoading(true);
    try {
      await bookingAPI.create({
        hotel: hotelId,
        room: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });

      setSuccess('Booking confirmed successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Booking reservation failed. Please check room availability.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hotel Info & Gallery */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-96 bg-slate-200 relative">
          <img
            src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-primary-600 text-white font-semibold uppercase tracking-wider px-2 py-1 rounded">
                {hotel.city}
              </span>
              <div className="flex items-center space-x-1 text-sm text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="font-semibold text-white">{hotel.rating.toFixed(1)}</span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{hotel.name}</h1>
            <p className="text-slate-200 flex items-center space-x-1">
              <MapPin className="h-4 w-4 inline" />
              <span>{hotel.address}, {hotel.city}</span>
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">About the Hotel</h2>
              <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">Hotel Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities?.map((amenity) => (
                  <span
                    key={amenity}
                    className="text-sm bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking / Check availability parameters card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 h-fit space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-200 pb-2">
              Stay Dates
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Check-in Date</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Check-out Date</span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Guests Capacity</span>
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2 text-sm bg-white focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rooms Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Available Rooms</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-md flex items-start space-x-2 animate-bounce">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-xl h-60 border border-slate-100"></div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center space-y-2 shadow-sm">
            <p className="text-slate-800 font-semibold">No available rooms for the selected dates/capacity</p>
            <p className="text-slate-500 text-sm">Try modifying your check-in dates or guest filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row"
              >
                <div className="w-full md:w-48 h-48 md:h-full bg-slate-100 shrink-0">
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400'}
                    alt={room.type}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded">
                        Room {room.roomNumber}
                      </span>
                      <p className="text-xl font-extrabold text-primary-600">
                        ${room.pricePerNight} <span className="text-xs text-slate-500 font-normal">/ night</span>
                      </p>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{room.type} Room</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Up to {room.capacity} Guest(s)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Bed className="h-4 w-4" />
                        <span>{room.type} Bed</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {room.amenities?.map((amenity) => (
                        <span key={amenity} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={bookingLoading}
                    onClick={() => handleBookRoom(room)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm transition shadow-sm hover:shadow"
                  >
                    {bookingLoading ? 'Reserving...' : 'Book Room'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelDetails;
