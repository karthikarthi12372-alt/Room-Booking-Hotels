import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  const { hotel: hotelId, room: roomId, checkInDate, checkOutDate } = req.body;

  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      res.status(400);
      throw new Error('Invalid dates provided');
    }

    if (checkIn < today) {
      res.status(400);
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkIn >= checkOut) {
      res.status(400);
      throw new Error('Check-out date must be after check-in date');
    }

    // Check if room and hotel exist
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404);
      throw new Error('Hotel not found');
    }

    // Verify room availability for dates
    const conflictingBooking = await Booking.findOne({
      room: roomId,
      status: { $ne: 'Cancelled' },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (conflictingBooking) {
      res.status(400);
      throw new Error('This room is already booked for the selected dates');
    }

    // Calculate total price
    const differenceInTime = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    const totalPrice = numberOfNights * room.pricePerNight;

    const booking = new Booking({
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
      status: 'Confirmed', // Default to confirmed for booking flow simplicity
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name city address images')
      .populate('room', 'roomNumber type pricePerNight')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('hotel', 'name city')
      .populate('room', 'roomNumber type')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      // Check ownership or admin status
      if (
        booking.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        res.status(403);
        throw new Error('Not authorized to cancel this booking');
      }

      if (booking.status === 'Cancelled') {
        res.status(400);
        throw new Error('Booking is already cancelled');
      }

      booking.status = 'Cancelled';
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404);
      throw new Error('Booking not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status option');
    }

    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = status;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404);
      throw new Error('Booking not found');
    }
  } catch (error) {
    next(error);
  }
};
