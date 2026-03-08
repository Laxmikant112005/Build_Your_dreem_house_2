/**
 * BuildMyHome - Design Service
 * Business logic for design operations
 */

const Design = require('./design.model');
const ApiError = require('../../utils/ApiError');
const { DESIGN_STATUS } = require('../../constants/enums');
const { cache } = require('../../config/redis');

class DesignService {
  /**
   * Create a new design
   */
  async createDesign(engineerId, designData) {
    const design = await Design.create({
      ...designData,
      engineerId,
    });
    return design;
  }

  /**
   * Get design by ID
   */
  async getDesignById(designId, incrementView = false) {
    const cacheKey = `design:${designId}`;
    
    if (!incrementView) {
      const cached = await cache.get(cacheKey);
      if (cached) return cached;
    }

    const design = await Design.findById(designId)
      .populate('engineerId', 'firstName lastName avatar engineerProfile');

    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    if (incrementView) {
      design.metrics.views += 1;
      await design.save();
    }

    await cache.set(cacheKey, design, 300);
    return design;
  }

  /**
   * Get design by slug
   */
  async getDesignBySlug(slug) {
    const design = await Design.findOne({ slug })
      .populate('engineerId', 'firstName lastName avatar engineerProfile');

    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    return design;
  }

  /**
   * Update design
   */
  async updateDesign(designId, engineerId, updateData) {
    const design = await Design.findOne({ _id: designId, engineerId });
    
    if (!design) {
      throw new ApiError(404, 'Design not found or unauthorized');
    }

    // Can't update if already approved
    if (design.status === DESIGN_STATUS.APPROVED) {
      throw new ApiError(400, 'Cannot update approved design');
    }

    Object.assign(design, updateData);
    await design.save();
    
    // Invalidate cache
    await cache.del(`design:${designId}`);
    
    return design;
  }

  /**
   * Delete design
   */
  async deleteDesign(designId, engineerId) {
    const design = await Design.findOneAndDelete({ _id: designId, engineerId });
    
    if (!design) {
      throw new ApiError(404, 'Design not found or unauthorized');
    }

    // Invalidate cache
    await cache.del(`design:${designId}`);
    
    return true;
  }

  /**
   * Get designs with filters and pagination
   */
  async getDesigns(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      style,
      minCost,
      maxCost,
      minArea,
      maxArea,
      floors,
      city,
    } = options;

    const query = { status: DESIGN_STATUS.APPROVED };

    // Apply filters
    if (search) {
      query.$text = { $search: search };
    }
    if (style) {
      query['specifications.style'] = style;
    }
    if (minCost || maxCost) {
      query['specifications.estimatedCost'] = {};
      if (minCost) query['specifications.estimatedCost'].$gte = minCost;
      if (maxCost) query['specifications.estimatedCost'].$lte = maxCost;
    }
    if (minArea || maxArea) {
      query['specifications.totalArea'] = {};
      if (minArea) query['specifications.totalArea'].$gte = minArea;
      if (maxArea) query['specifications.totalArea'].$lte = maxArea;
    }
    if (floors) {
      query['specifications.floors'] = floors;
    }
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      Design.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating'),
      Design.countDocuments(query),
    ]);

    return {
      designs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get featured designs
   */
  async getFeatured(limit = 10) {
    const cacheKey = `designs:featured:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const designs = await Design.getFeatured(limit);
    await cache.set(cacheKey, designs, 600);
    return designs;
  }

  /**
   * Get trending designs
   */
  async getTrending(days = 7, limit = 10) {
    const cacheKey = `designs:trending:${days}:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const designs = await Design.getTrending(days, limit);
    await cache.set(cacheKey, designs, 300);
    return designs;
  }

  /**
   * Get engineer designs
   */
  async getEngineerDesigns(engineerId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const query = { engineerId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [designs, total] = await Promise.all([
      Design.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Design.countDocuments(query),
    ]);

    return {
      designs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Submit design for approval
   */
  async submitForApproval(designId, engineerId) {
    const design = await Design.findOne({ _id: designId, engineerId });
    
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    if (design.status !== DESIGN_STATUS.DRAFT) {
      throw new ApiError(400, 'Design already submitted');
    }

    design.status = DESIGN_STATUS.PENDING;
    await design.save();

    return design;
  }

  /**
   * Approve design (admin)
   */
  async approveDesign(designId) {
    const design = await Design.findById(designId);
    
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    design.status = DESIGN_STATUS.APPROVED;
    design.publishedAt = new Date();
    await design.save();

    // Invalidate cache
    await cache.del(`design:${designId}`);
    await cache.del('designs:featured');
    await cache.del('designs:trending');

    return design;
  }

  /**
   * Reject design (admin)
   */
  async rejectDesign(designId, reason) {
    const design = await Design.findById(designId);
    
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    design.status = DESIGN_STATUS.REJECTED;
    design.rejectionReason = reason;
    await design.save();

    // Invalidate cache
    await cache.del(`design:${designId}`);

    return design;
  }

  /**
   * Get related designs
   */
  async getRelatedDesigns(designId, limit = 5) {
    const design = await Design.findById(designId);
    
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    const query = {
      _id: { $ne: designId },
      status: DESIGN_STATUS.APPROVED,
      $or: [
        { 'specifications.style': design.specifications.style },
        { category: design.category },
      ],
    };

    const designs = await Design.find(query)
      .limit(limit)
      .populate('engineerId', 'firstName lastName avatar');

    return designs;
  }

  /**
   * Like/unlike design
   */
  async toggleLike(designId, userId) {
    const DesignLike = require('../favorite/favorite.model');
    
    const existing = await DesignLike.findOne({ userId, designId });
    
    if (existing) {
      await DesignLike.findByIdAndDelete(existing._id);
      await Design.findByIdAndUpdate(designId, { $inc: { 'metrics.likes': -1 } });
      return { liked: false };
    } else {
      await DesignLike.create({ userId, designId });
      await Design.findByIdAndUpdate(designId, { $inc: { 'metrics.likes': 1 } });
      return { liked: true };
    }
  }

  /**
   * Get filter options
   */
  async getFilterOptions() {
    const styles = await Design.distinct('specifications.style', { status: DESIGN_STATUS.APPROVED });
    const cities = await Design.distinct('location.city', { status: DESIGN_STATUS.APPROVED, 'location.city': { $exists: true } });
    
    const costRange = await Design.findOne({ status: DESIGN_STATUS.APPROVED, 'specifications.estimatedCost': { $exists: true } })
      .sort({ 'specifications.estimatedCost': -1 })
      .select('specifications.estimatedCost');

    const areaRange = await Design.findOne({ status: DESIGN_STATUS.APPROVED })
      .sort({ 'specifications.totalArea': -1 })
      .select('specifications.totalArea');

    return {
      styles,
      cities: cities.filter(Boolean),
      costRange: {
        min: 0,
        max: costRange?.specifications?.estimatedCost || 10000000,
      },
      areaRange: {
        min: 0,
        max: areaRange?.specifications?.totalArea || 10000,
      },
      floors: [1, 2, 3, 4, 5],
    };
  }
}

module.exports = new DesignService();

