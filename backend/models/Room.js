import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Please associate this room with a hotel'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Please add a room number'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please add a room type'],
      enum: ['Single', 'Double', 'Suite', 'Deluxe'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please add price per night'],
      min: [0, 'Price must be positive'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please add maximum guest capacity'],
      min: [1, 'Capacity must be at least 1 guest'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure room number is unique within a hotel
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;
