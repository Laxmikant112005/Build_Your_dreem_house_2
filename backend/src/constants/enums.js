/**
 * BuildMyHome - Enumerations
 */

module.exports = {
  // User Roles
  USER_ROLES: ['user', 'engineer', 'admin'],

  // Booking Status
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  },

  // Booking Types
  BOOKING_TYPE: {
    CONSULTATION: 'consultation',
    DESIGN: 'design',
    CONSTRUCTION: 'construction',
    RENOVATION: 'renovation',
  },

  // Meeting Types
  MEETING_TYPE: {
    VIDEO: 'video',
    IN_PERSON: 'in-person',
    PHONE: 'phone',
  },

  // Design Status
  DESIGN_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // House Styles
  HOUSE_STYLES: [
    'modern',
    'traditional',
    'villa',
    'duplex',
    'contemporary',
    'minimalist',
    'colonial',
    'mediterranean',
    'industrial',
  ],

  // Construction Types
  CONSTRUCTION_TYPES: ['RCC', 'Steel', 'Wood', 'Mixed'],

  // Review Rating
  REVIEW_RATINGS: {
    MIN: 1,
    MAX: 5,
  },

  // Engineer Verification Status
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    BOOKING: 'booking',
    MESSAGE: 'message',
    REVIEW: 'review',
    SYSTEM: 'system',
    DESIGN: 'design',
    PROMOTION: 'promotion',
  },

  // Chat Types
  CHAT_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group',
    BOOKING: 'booking',
  },

  // Message Types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    SYSTEM: 'system',
  },

  // File Categories
  FILE_CATEGORIES: {
    IMAGE: 'image',
    FLOOR_PLAN: 'floorPlan',
    CAD_FILE: 'cadFile',
    MODEL_3D: 'model3d',
    DOCUMENT: 'document',
  },
};

