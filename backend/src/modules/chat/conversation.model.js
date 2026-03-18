/**
 * BuildMyHome - Conversation Model
 * Chat conversation between 2 users
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
}, {
  timestamps: true,
});

// Compound indexes
conversationSchema.index({ 'participants.1': 1, 'participants.0': 1 });
conversationSchema.index({ bookingId: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

