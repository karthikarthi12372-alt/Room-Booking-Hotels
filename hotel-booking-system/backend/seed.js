import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Hotel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();

    console.log('Creating users...');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'StaySphere Admin',
      email: 'admin@staysphere.com',
      password: 'password123', // hashed by pre-save mongoose hook
      role: 'admin',
      phoneNumber: '+1 (555) 123-4567',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    });

    // Create guest user
    const guestUser = await User.create({
      name: 'John Guest',
      email: 'guest@staysphere.com',
      password: 'password123',
      role: 'user',
      phoneNumber: '+1 (555) 987-6543',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    });

    console.log('Creating hotels...');

    const hotel1 = await Hotel.create({
      name: 'The Grand Ritz Plaza',
      description: 'Experience luxury at its finest in the heart of New York City. StaySphere guests receive exclusive access to our sky lounge, private health club, and Michelin-star in-house dining options. High-speed fiber internet and complimentary airport transfers are included.',
      address: '768 5th Ave',
      city: 'New York',
      rating: 4.8,
      amenities: ['WiFi', 'Gym', 'Restaurant', 'AC', 'Spa'],
      images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600'],
    });

    const hotel2 = await Hotel.create({
      name: 'Sunset Beach Resort & Spa',
      description: 'Escape to a tropical paradise right on the shores of Miami Beach. Sunset Resort features private beach cabanas, a multi-tiered infinity pool, deep-sea diving excursions, and our signature holistic spa treatments. All rooms offer panoramic ocean views.',
      address: '2201 Collins Ave',
      city: 'Miami',
      rating: 4.5,
      amenities: ['WiFi', 'Pool', 'Parking', 'Spa', 'AC', 'Restaurant'],
      images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600'],
    });

    const hotel3 = await Hotel.create({
      name: 'Alpine Timberline Lodge',
      description: 'Nestled between snowcapped peaks and dense pine forests, Alpine Timberline Lodge provides a cozy sanctuary for skiers and hikers alike. Relax in front of our open hearth fireplaces, soak in outdoor hot tubs, or enjoy local craft beers in our rustic taproom.',
      address: '1200 Winter Park Dr',
      city: 'Denver',
      rating: 4.2,
      amenities: ['WiFi', 'Parking', 'Restaurant', 'AC'],
      images: ['https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=600'],
    });

    console.log('Creating rooms...');

    // Hotel 1 (NYC) Rooms
    await Room.create([
      {
        hotel: hotel1._id,
        roomNumber: '101',
        type: 'Single',
        pricePerNight: 199,
        capacity: 1,
        amenities: ['WiFi', 'AC', 'TV'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400'],
      },
      {
        hotel: hotel1._id,
        roomNumber: '202',
        type: 'Double',
        pricePerNight: 299,
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'MiniBar'],
        images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=400'],
      },
      {
        hotel: hotel1._id,
        roomNumber: 'PH-1',
        type: 'Suite',
        pricePerNight: 599,
        capacity: 4,
        amenities: ['WiFi', 'AC', 'TV', 'MiniBar', 'Spa', 'Kitchen'],
        images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=400'],
      },
    ]);

    // Hotel 2 (Miami) Rooms
    await Room.create([
      {
        hotel: hotel2._id,
        roomNumber: '101B',
        type: 'Double',
        pricePerNight: 250,
        capacity: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=400'],
      },
      {
        hotel: hotel2._id,
        roomNumber: '102B',
        type: 'Deluxe',
        pricePerNight: 399,
        capacity: 3,
        amenities: ['WiFi', 'AC', 'TV', 'MiniBar', 'Balcony', 'SeaView'],
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=400'],
      },
    ]);

    // Hotel 3 (Denver) Rooms
    await Room.create([
      {
        hotel: hotel3._id,
        roomNumber: '50',
        type: 'Single',
        pricePerNight: 99,
        capacity: 1,
        amenities: ['WiFi', 'TV', 'Fireplace'],
        images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400'],
      },
      {
        hotel: hotel3._id,
        roomNumber: '100',
        type: 'Double',
        pricePerNight: 150,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Fireplace', 'AC'],
        images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400'],
      },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
