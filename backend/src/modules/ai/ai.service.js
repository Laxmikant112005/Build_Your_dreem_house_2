/**
 * BuildMyHome - AI Service
 * AI-powered recommendations and estimations
 */

const OpenAI = require('openai');
const config = require('../../config');
const ApiError = require('../../utils/ApiError');
const Design = require('../design/design.model');
const Material = require('../materials/material.model');

const openai = new OpenAI({
  apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY,
});

class AIService {
  /**
   * Generate design suggestions using AI
   */
  async generateDesignSuggestions({ budget, area, location, preferences }) {
    try {
      const prompt = `Generate 3-5 practical architectural design suggestions for a house with:
- Budget: $${budget}
- Area: ${area} sq ft
- Location: ${location}
- Preferences: ${preferences}

Return as JSON array:
["Suggestion 1", "Suggestion 2", ...]
Focus on space optimization, cost efficiency, climate adaptation.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      // Fallback rule-based
      const fallback = this.ruleBasedDesignSuggestions({ budget, area, location, preferences });
      const suggestions = JSON.parse(response.choices[0].message.content || '[]').concat(fallback);

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('OpenAI error:', error);
      return this.ruleBasedDesignSuggestions({ budget, area, location, preferences });
    }
  }

  /**
   * Rule-based fallback for design suggestions
   */
  ruleBasedDesignSuggestions({ budget, area }) {
    const suggestions = [];
    if (budget < 100000) {
      suggestions.push("Consider open floor plans to save on walls", "Use prefabricated materials");
    }
    if (area < 1000) {
      suggestions.push("Optimize vertical space with mezzanine", "Multi-functional furniture");
    }
    return suggestions;
  }

  /**
   * Cost estimation
   */
  async calculateCostEstimate({ area, location = 'India', materials = 'standard', floors = 1 }) {
    const baseCostPerSqft = location === 'India' ? 1500 : 200;
    
    // Adjust for floors
    const floorMultiplier = floors * 1.1;
    
    const baseEstimate = area * baseCostPerSqft * floorMultiplier;
    
    const breakdown = {
      structure: baseEstimate * 0.4,
      materials: baseEstimate * 0.3,
      labor: baseEstimate * 0.2,
      finishes: baseEstimate * 0.1,
    };

    return {
      total: baseEstimate,
      range: [baseEstimate * 0.85, baseEstimate * 1.15],
      breakdown,
      perSqft: (baseEstimate / area).toFixed(0),
      assumptions: ['Standard materials', `${floors} floors`, location],
    };
  }

  /**
   * Material recommendations
   */
  async recommendMaterials({ budget, type, location, quantity = 1 }) {
    try {
      const prompt = `Recommend 3 materials for ${type} suitable for ${location}, budget $${budget} for ${quantity} units.
Return JSON:
[{
  "name": "material name",
  "estimatedCost": 123,
  "reason": "why recommended"
}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      // Rule-based fallback
      return [
        {
          name: "Standard " + type,
          estimatedCost: budget * 1.1,
          reason: "Cost-effective choice for budget",
        },
        {
          name: "Premium " + type,
          estimatedCost: budget * 1.8,
          reason: "Higher quality for better durability",
        },
      ];
    }
  }
}

module.exports = new AIService();

