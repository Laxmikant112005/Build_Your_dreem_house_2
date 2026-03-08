/**
 * BuildMyHome - Favorite Model
 * Mongoose schema for user favorites
 */

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
favoriteSchema.index({ userId: 1, designId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

