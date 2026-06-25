import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookings,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getBookings);

router.route('/my-bookings')
  .get(protect, getMyBookings);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

router.route('/:id/status')
  .put(protect, admin, updateBookingStatus);

export default router;
