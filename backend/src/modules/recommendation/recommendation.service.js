/**
 * BuildMyHome - Recommendation Service
 * Business logic for design and engineer recommendations
 */

const Design = require('../design/design.model');
const User = require('../user/user.model');
const Booking = require('../booking/booking.model');
const Review = require('../review/review.model');
const { DESIGN_STATUS } = require('../../constants/enums');
const { cache } = require('../../config/redis');
const logger = require('../../utils/logger');

class RecommendationService {
  /**
   * Get home page recommendations (featured + trending)
   */
  async getHomeRecommendations() {
    const cacheKey = 'recommendations:home';
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const [featured, trending, newDesigns] = await Promise.all([
      Design.getFeatured(6),
      Design.getTrending(7, 6),
      Design.find({ status: DESIGN_STATUS.APPROVED })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating'),
    ]);

    const result = {
      featured,
      trending,
      newArrivals: newDesigns,
    };

    await cache.set(cacheKey, result, 600);
    return result;
  }

  /**
   * Get trending designs
   */
  async getTrendingDesigns(days = 7, limit = 10) {
    return Design.getTrending(days, limit);
  }

  /**
   * Get popular designs
   */
  async getPopularDesigns(limit = 10) {
    const cacheKey = `recommendations:popular:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const designs = await Design.find({ status: DESIGN_STATUS.APPROVED })
      .sort({ 'metrics.likes': -1, 'metrics.views': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');

    await cache.set(cacheKey, designs, 300);
    return designs;
  }

  /**
   * Get design recommendations based on a specific design
   */
  async getDesignRecommendations(designId, limit = 6) {
    const design = await Design.findById(designId);
    if (!design) return [];

    // Find similar designs based on style, category, and price range
    const similarDesigns = await Design.find({
      _id: { $ne: designId },
      status: DESIGN_STATUS.APPROVED,
      $or: [
        { 'specifications.style': design.specifications.style },
        { category: design.category },
      ],
      'specifications.estimatedCost': {
        $gte: (design.specifications.estimatedCost || 0) * 0.8,
        $lte: (design.specifications.estimatedCost || 0) * 1.2,
      },
    })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar');

    return similarDesigns;
  }

  /**
   * Get budget-based recommendations
   */
  async getBudgetRecommendations(budget, limit = 10) {
    const cacheKey = `recommendations:budget:${budget}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const designs = await Design.find({
      status: DESIGN_STATUS.APPROVED,
      'specifications.estimatedCost': { $lte: budget },
    })
      .sort({ 'specifications.estimatedCost': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');

    await cache.set(cacheKey, designs, 300);
    return designs;
  }

  /**
   * Get style-based recommendations
   */
  async getStyleRecommendations(style, limit = 10) {
    const designs = await Design.find({
      status: DESIGN_STATUS.APPROVED,
      'specifications.style': style,
    })
      .sort({ 'metrics.likes': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');

    return designs;
  }

  /**
   * Get personalized recommendations based on user preferences and history
   */
  async getPersonalizedRecommendations(userId, limit = 10) {
    const user = await User.findById(userId);
    if (!user) return [];

    const { preferences } = user;
    const query = { status: DESIGN_STATUS.APPROVED };

    // Apply user preferences
    if (preferences?.budgetMax > 0) {
      query['specifications.estimatedCost'] = { $lte: preferences.budgetMax };
    }

    if (preferences?.preferredStyles?.length > 0) {
      query['specifications.style'] = { $in: preferences.preferredStyles };
    }

    if (preferences?.landSize) {
      query['specifications.totalArea'] = { $gte: preferences.landSize * 0.8 };
    }

    // Get user's booking history to find similar engineers
    const userBookings = await Booking.find({ userId }).populate('engineerId');
    const bookedEngineerIds = userBookings.map(b => b.engineerId?._id).filter(Boolean);

    // Exclude already booked engineers if needed, or prioritize them
    // For now, get designs matching preferences
    const designs = await Design.find(query)
      .sort({ 'metrics.likes': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');

    return designs;
  }

  /**
   * Get engineer recommendations for users
   */
  async getEngineerRecommendations(userId, limit = 10) {
    const user = await User.findById(userId);
    if (!user) return [];

    const { preferences } = user;
    const query = {
      role: 'engineer',
      isActive: true,
      'engineerProfile.isVerified': true,
    };

    // Filter by preferred locations
    if (preferences?.preferredLocations?.length > 0) {
      query['engineerProfile.serviceAreas'] = {
        $elemMatch: { 
          location: { $in: preferences.preferredLocations.map(l => new RegExp(l, 'i')) } 
        }
      };
    }

    const engineers = await User.find(query)
      .select('firstName lastName avatar phone engineerProfile')
      .sort({ 'engineerProfile.rating.average': -1 })
      .limit(limit);

    return engineers;
  }

  /**
   * Get collaborative filtering recommendations
   * (Simple version - based on users with similar preferences)
   */
  async getCollaborativeDesigns(userId, limit = 10) {
    const user = await User.findById(userId);
    if (!user) return [];

    // Find users with similar budget preferences
    const similarUsers = await User.find({
      _id: { $ne: userId },
      'preferences.budgetMax': {
        $gte: (user.preferences?.budgetMax || 0) * 0.8,
        $lte: (user.preferences?.budgetMax || 10000000) * 1.2,
      },
    }).limit(50);

    if (similarUsers.length === 0) {
      return this.getPopularDesigns(limit);
    }

    // Get designs that similar users have interacted with (simplified)
    // In production, you'd track design views/likes in a separate collection
    const similarUserIds = similarUsers.map(u => u._id);
    
    // Get popular designs among similar users (mock implementation)
    const designs = await Design.find({
      status: DESIGN_STATUS.APPROVED,
    })
      .sort({ 'metrics.likes': -1, 'metrics.views': -1 })
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar');

    return designs;
  }

  /**
   * Record user interaction for better recommendations
   */
  async recordInteraction(userId, designId, interactionType) {
    // In production, store these in a separate collection for analysis
    logger.info(`User ${userId} ${interactionType} design ${designId}`);
    
    // Increment view count if it's a view
    if (interactionType === 'view') {
      await Design.findByIdAndUpdate(designId, { $inc: { 'metrics.views': 1 } });
    }
    
    return true;
  }

  /**
   * Refresh recommendations cache
   */
  async refreshRecommendations() {
    await cache.del('recommendations:home');
    await cache.del('recommendations:popular');
    
    // Pre-warm cache
    await this.getHomeRecommendations();
    await this.getPopularDesigns(10);
    
    return { message: 'Recommendations cache refreshed' };
  }
}

module.exports = new RecommendationService();

