import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// @desc    Get all hotels with search, filter and pagination
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res, next) => {
  try {
    const { search, city, rating, amenities, page, limit } = req.query;

    const query = {};

    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { city: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
      ];
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim()).filter(Boolean);
      
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 6;
    const skip = (pageNum - 1) * limitNum;

    const total = await Hotel.countDocuments(query);
    const hotels = await Hotel.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.json({
      hotels,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      // Fetch rooms associated with this hotel
      const rooms = await Room.find({ hotel: hotel._id });
      res.json({ hotel, rooms });
    } else {
      res.status(404);
      throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new hotel
// @route   POST /api/hotels
// @access  Private/Admin
export const createHotel = async (req, res, next) => {
  const { name, description, address, city, images, amenities, rating } = req.body;

  try {
    const hotel = new Hotel({
      name,
      description,
      address,
      city,
      images: images || [],
      amenities: amenities || [],
      rating: rating || 0,
    });

    const createdHotel = await hotel.save();
    res.status(201).json(createdHotel);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
export const updateHotel = async (req, res, next) => {
  const { name, description, address, city, images, amenities, rating } = req.body;

  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      hotel.name = name || hotel.name;
      hotel.description = description || hotel.description;
      hotel.address = address || hotel.address;
      hotel.city = city || hotel.city;
      hotel.images = images || hotel.images;
      hotel.amenities = amenities || hotel.amenities;
      hotel.rating = rating !== undefined ? rating : hotel.rating;

      const updatedHotel = await hotel.save();
      res.json(updatedHotel);
    } else {
      res.status(404);
      throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      // Delete all associated rooms
      await Room.deleteMany({ hotel: hotel._id });
      // Delete all bookings associated with the hotel
      await Booking.deleteMany({ hotel: hotel._id });
      
      await hotel.deleteOne();
      res.json({ message: 'Hotel and associated rooms/bookings removed' });
    } else {
      res.status(404);
      throw new Error('Hotel not found');
    }
  } catch (error) {
    next(error);
  }
};
