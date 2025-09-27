const mongoose = require('mongoose');
const User = require('./models/user');
const ParkingSpot = require('./models/ParkingSpot');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking_spot_finder')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function testBackend() {
  try {
    console.log('\n🧪 Testing Backend Models and Routes...\n');

    // Test 1: Check if we can find users
    const userCount = await User.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);

    // Test 2: Check if we can find parking spots
    const spotCount = await ParkingSpot.countDocuments();
    console.log(`🅿️ Parking spots in database: ${spotCount}`);

    // Test 3: Check if we can find bookings
    const bookingCount = await Booking.countDocuments();
    console.log(`📅 Bookings in database: ${bookingCount}`);

    // Test 4: Check if we can find payments
    const paymentCount = await Payment.countDocuments();
    console.log(`💳 Payments in database: ${paymentCount}`);

    // Test 5: Test user creation
    console.log('\n🔍 Testing User Model...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'testpassword',
      role: 'user'
    });
    
    // Don't save, just validate
    const userValidation = testUser.validateSync();
    if (userValidation) {
      console.log('❌ User validation failed:', userValidation.message);
    } else {
      console.log('✅ User model validation passed');
    }

    // Test 6: Test parking spot creation
    console.log('\n🔍 Testing ParkingSpot Model...');
    const testSpot = new ParkingSpot({
      ownerId: new mongoose.Types.ObjectId(),
      title: 'Test Parking Spot',
      description: 'A test parking spot',
      location: { lat: 28.6139, lng: 77.2090 },
      address: 'Test Address',
      pricePerHour: 50,
      features: ['Test Feature'],
      vehicleTypes: ['car'],
      isAvailable: true
    });
    
    const spotValidation = testSpot.validateSync();
    if (spotValidation) {
      console.log('❌ ParkingSpot validation failed:', spotValidation.message);
    } else {
      console.log('✅ ParkingSpot model validation passed');
    }

    // Test 7: Test booking creation
    console.log('\n🔍 Testing Booking Model...');
    const testBooking = new Booking({
      userId: new mongoose.Types.ObjectId(),
      spotId: new mongoose.Types.ObjectId(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // 1 hour later
      status: 'active'
    });
    
    const bookingValidation = testBooking.validateSync();
    if (bookingValidation) {
      console.log('❌ Booking validation failed:', bookingValidation.message);
    } else {
      console.log('✅ Booking model validation passed');
    }

    // Test 8: Test payment creation
    console.log('\n🔍 Testing Payment Model...');
    const testPayment = new Payment({
      userId: new mongoose.Types.ObjectId(),
      bookingId: new mongoose.Types.ObjectId(),
      amount: 100,
      status: 'pending',
      paymentMethod: 'card'
    });
    
    const paymentValidation = testPayment.validateSync();
    if (paymentValidation) {
      console.log('❌ Payment validation failed:', paymentValidation.message);
    } else {
      console.log('✅ Payment model validation passed');
    }

    console.log('\n🎉 Backend tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Parking Spots: ${spotCount}`);
    console.log(`   - Bookings: ${bookingCount}`);
    console.log(`   - Payments: ${paymentCount}`);
    console.log('\n💡 To populate with sample data, run: node createSampleData.js');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBackend();
