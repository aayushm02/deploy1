const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  features: [String],
  vehicleTypes: [{ type: String, enum: ['car', 'motorcycle', 'bicycle', 'truck'] }],
  isAvailable: { type: Boolean, default: true },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  reports: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
