// MongoDB initialization script for Docker
db = db.getSiblingDB('parking_spot_finder');

// Create collections
db.createCollection('users');
db.createCollection('parkingspots');
db.createCollection('bookings');
db.createCollection('payments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.parkingspots.createIndex({ "location": "2dsphere" });
db.parkingspots.createIndex({ "isAvailable": 1 });
db.bookings.createIndex({ "userId": 1 });
db.bookings.createIndex({ "spotId": 1 });
db.payments.createIndex({ "userId": 1 });
db.payments.createIndex({ "bookingId": 1 });

// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@parking.com",
  passwordHash: "$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K",
  role: "admin",
  createdAt: new Date()
});

print("Database initialized successfully!");

