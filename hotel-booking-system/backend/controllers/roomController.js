import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';

// @desc    Get rooms with filters and availability check
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    const { hotelId, type, minPrice, maxPrice, capacity, checkIn, checkOut } = req.query;

    const query = {};

    if (hotelId) {
      query.hotel = hotelId;
    }

    if (type) {
      query.type = type;
    }

    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Date range availability filter
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        res.status(400);
        throw new Error('Invalid date parameters');
      }

      if (checkInDate >= checkOutDate) {
        res.status(400);
        throw new Error('Check-out date must be after check-in date');
      }

      // Find all bookings overlapping with this range that are not cancelled
      const overlappingBookings = await Booking.find({
        status: { $ne: 'Cancelled' },
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      });

      const bookedRoomIds = overlappingBookings.map((b) => b.room.toString());
      query._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(query).populate('hotel', 'name city address');
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name city address');

    if (room) {
      res.json(room);
    } else {
      res.status(404);
      throw new Error('Room not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = async (req, res, next) => {
  const { hotel, roomNumber, type, pricePerNight, capacity, amenities, images, isAvailable } = req.body;

  try {
    // Check if hotel exists
    const hotelExists = await Hotel.findById(hotel);
    if (!hotelExists) {
      res.status(404);
      throw new Error('Associated Hotel not found');
    }

    // Check if room number already exists in that hotel
    const roomExists = await Room.findOne({ hotel, roomNumber });
    if (roomExists) {
      res.status(400);
      throw new Error(`Room number ${roomNumber} already exists in this hotel`);
    }

    const room = new Room({
      hotel,
      roomNumber,
      type,
      pricePerNight,
      capacity,
      amenities: amenities || [],
      images: images || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = async (req, res, next) => {
  const { roomNumber, type, pricePerNight, capacity, amenities, images, isAvailable } = req.body;

  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      // If roomNumber is changing, check if there is a conflict in the same hotel
      if (roomNumber && roomNumber !== room.roomNumber) {
        const roomExists = await Room.findOne({ hotel: room.hotel, roomNumber });
        if (roomExists) {
          res.status(400);
          throw new Error(`Room number ${roomNumber} already exists in this hotel`);
        }
      }

      room.roomNumber = roomNumber || room.roomNumber;
      room.type = type || room.type;
      room.pricePerNight = pricePerNight !== undefined ? pricePerNight : room.pricePerNight;
      room.capacity = capacity !== undefined ? capacity : room.capacity;
      room.amenities = amenities || room.amenities;
      room.images = images || room.images;
      room.isAvailable = isAvailable !== undefined ? isAvailable : room.isAvailable;

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } else {
      res.status(404);
      throw new Error('Room not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      // Delete bookings associated with this room
      await Booking.deleteMany({ room: room._id });
      await room.deleteOne();
      res.json({ message: 'Room and associated bookings removed' });
    } else {
      res.status(404);
      throw new Error('Room not found');
    }
  } catch (error) {
    next(error);
  }
};
