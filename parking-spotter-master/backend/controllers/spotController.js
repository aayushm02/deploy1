const ParkingSpot = require('../models/ParkingSpot');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const spotController = {
  // Get all spots with optional search parameters
  async getAllSpots(req, res) {
    try {
      const { lat, lng, radius = 25, maxPrice, page = 1, limit = 20 } = req.query;
      
      let query = { isAvailable: true };
      
      // Add price filter
      if (maxPrice) {
        query.pricePerHour = { $lte: parseFloat(maxPrice) };
      }
      
      // Add location filter if coordinates provided
      if (lat && lng) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radiusNum = parseFloat(radius);
        
        // Simple bounding box filter (for better performance, consider using MongoDB geospatial queries)
        query['location.lat'] = {
          $gte: latNum - (radiusNum / 111), // Rough conversion: 1 degree ≈ 111 km
          $lte: latNum + (radiusNum / 111)
        };
        query['location.lng'] = {
          $gte: lngNum - (radiusNum / (111 * Math.cos(latNum * Math.PI / 180))),
          $lte: lngNum + (radiusNum / (111 * Math.cos(latNum * Math.PI / 180)))
        };
      }
      
      const spots = await ParkingSpot.find(query)
        .populate('ownerId', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      
      const total = await ParkingSpot.countDocuments(query);
      
      res.json({
        success: true,
        spots,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      console.error('Get all spots error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Search spots with advanced filters
  async searchSpots(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { lat, lng, radius = 25, maxPrice, features, page = 1, limit = 20 } = req.query;
      
      let query = { isAvailable: true };
      
      // Add price filter
      if (maxPrice) {
        query.pricePerHour = { $lte: parseFloat(maxPrice) };
      }
      
      // Add features filter
      if (features) {
        const featureArray = Array.isArray(features) ? features : [features];
        query.features = { $in: featureArray };
      }
      
      // Add location filter
      if (lat && lng) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radiusNum = parseFloat(radius);
        
        query['location.lat'] = {
          $gte: latNum - (radiusNum / 111),
          $lte: latNum + (radiusNum / 111)
        };
        query['location.lng'] = {
          $gte: lngNum - (radiusNum / (111 * Math.cos(latNum * Math.PI / 180))),
          $lte: lngNum + (radiusNum / (111 * Math.cos(latNum * Math.PI / 180)))
        };
      }
      
      const spots = await ParkingSpot.find(query)
        .populate('ownerId', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ pricePerHour: 1 });
      
      const total = await ParkingSpot.countDocuments(query);
      
      res.json({
        success: true,
        spots,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      console.error('Search spots error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get nearby spots
  async getNearbySpots(req, res) {
    try {
      const { lat, lng, radius = 5 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      
      const spots = await ParkingSpot.find({
        isAvailable: true,
        'location.lat': {
          $gte: latNum - (radiusNum / 111),
          $lte: latNum + (radiusNum / 111)
        },
        'location.lng': {
          $gte: lngNum - (radiusNum / (111 * Math.cos(latNum * Math.PI / 180))),
          $lte: lngNum + (radiusNum / (111 * Math.cos(latNum * Math.PI / 180)))
        }
      })
      .populate('ownerId', 'name email')
      .sort({ pricePerHour: 1 });
      
      // Calculate distances and add to response
      const spotsWithDistance = spots.map(spot => {
        const distance = calculateDistance(latNum, lngNum, spot.location.lat, spot.location.lng);
        return {
          ...spot.toObject(),
          distance: Math.round(distance * 100) / 100
        };
      }).filter(spot => spot.distance <= radiusNum)
        .sort((a, b) => a.distance - b.distance);
      
      res.json({
        success: true,
        spots: spotsWithDistance,
        center: { lat: latNum, lng: lngNum },
        radius: radiusNum
      });
    } catch (error) {
      console.error('Get nearby spots error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get spot by ID
  async getSpotById(req, res) {
    try {
      const spot = await ParkingSpot.findById(req.params.id)
        .populate('ownerId', 'name email');
      
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }
      
      res.json({ spot });
    } catch (error) {
      console.error('Get spot by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create new spot
  async createSpot(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const spotData = {
        ...req.body,
        ownerId: req.user.userId,
        location: {
          lat: req.body.location.coordinates[1], // latitude
          lng: req.body.location.coordinates[0]  // longitude
        },
        pricePerHour: req.body.pricing.hourlyRate
      };

      const spot = new ParkingSpot(spotData);
      await spot.save();
      
      await spot.populate('ownerId', 'name email');
      
      res.status(201).json({
        message: 'Spot created successfully',
        spot
      });
    } catch (error) {
      console.error('Create spot error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update spot
  async updateSpot(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const spot = await ParkingSpot.findById(req.params.id);
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      // Check ownership
      if (spot.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const updateData = { ...req.body };
      
      // Handle location update
      if (updateData.location && updateData.location.coordinates) {
        updateData.location = {
          lat: updateData.location.coordinates[1],
          lng: updateData.location.coordinates[0]
        };
      }
      
      // Handle pricing update
      if (updateData.pricing && updateData.pricing.hourlyRate) {
        updateData.pricePerHour = updateData.pricing.hourlyRate;
      }

      const updatedSpot = await ParkingSpot.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name email');

      res.json({
        message: 'Spot updated successfully',
        spot: updatedSpot
      });
    } catch (error) {
      console.error('Update spot error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete spot
  async deleteSpot(req, res) {
    try {
      const spot = await ParkingSpot.findById(req.params.id);
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      // Check ownership
      if (spot.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await ParkingSpot.findByIdAndDelete(req.params.id);
      
      res.json({ message: 'Spot deleted successfully' });
    } catch (error) {
      console.error('Delete spot error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user's spots
  async getMySpots(req, res) {
    try {
      const spots = await ParkingSpot.find({ ownerId: req.user.userId })
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 });
      
      res.json({ spots });
    } catch (error) {
      console.error('Get my spots error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update spot availability
  async updateAvailability(req, res) {
    try {
      const { isAvailable } = req.body;
      
      const spot = await ParkingSpot.findById(req.params.id);
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      // Check ownership
      if (spot.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      spot.isAvailable = isAvailable;
      await spot.save();
      
      res.json({
        message: 'Availability updated successfully',
        spot
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add rating to spot
  async addRating(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, comment } = req.body;
      
      const spot = await ParkingSpot.findById(req.params.id);
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      // Check if user already rated this spot
      const existingRating = spot.ratings?.find(r => r.userId.toString() === req.user.userId);
      if (existingRating) {
        return res.status(400).json({ message: 'You have already rated this spot' });
      }

      if (!spot.ratings) {
        spot.ratings = [];
      }

      spot.ratings.push({
        userId: req.user.userId,
        rating,
        comment,
        createdAt: new Date()
      });

      // Recalculate average rating
      const totalRating = spot.ratings.reduce((sum, r) => sum + r.rating, 0);
      spot.averageRating = totalRating / spot.ratings.length;

      await spot.save();
      
      res.json({
        message: 'Rating added successfully',
        spot
      });
    } catch (error) {
      console.error('Add rating error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user's favorite spots
  async getFavorites(req, res) {
    try {
      const user = await User.findById(req.user.userId).populate('favoriteSpots');
      res.json({ favorites: user.favoriteSpots || [] });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add spot to favorites
  async addToFavorites(req, res) {
    try {
      const spot = await ParkingSpot.findById(req.params.id);
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      const user = await User.findById(req.user.userId);
      if (!user.favoriteSpots) {
        user.favoriteSpots = [];
      }

      if (user.favoriteSpots.includes(req.params.id)) {
        return res.status(400).json({ message: 'Spot already in favorites' });
      }

      user.favoriteSpots.push(req.params.id);
      await user.save();
      
      res.json({ message: 'Spot added to favorites' });
    } catch (error) {
      console.error('Add to favorites error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Remove spot from favorites
  async removeFromFavorites(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user.favoriteSpots) {
        return res.status(400).json({ message: 'No favorites found' });
      }

      const index = user.favoriteSpots.indexOf(req.params.id);
      if (index === -1) {
        return res.status(400).json({ message: 'Spot not in favorites' });
      }

      user.favoriteSpots.splice(index, 1);
      await user.save();
      
      res.json({ message: 'Spot removed from favorites' });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Report spot
  async reportSpot(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reason, description } = req.body;
      
      const spot = await ParkingSpot.findById(req.params.id);
      if (!spot) {
        return res.status(404).json({ message: 'Spot not found' });
      }

      if (!spot.reports) {
        spot.reports = [];
      }

      spot.reports.push({
        userId: req.user.userId,
        reason,
        description,
        createdAt: new Date()
      });

      await spot.save();
      
      res.json({ message: 'Spot reported successfully' });
    } catch (error) {
      console.error('Report spot error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
}

module.exports = spotController;
