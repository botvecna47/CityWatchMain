const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * AI/ML Service for CityWatch
 * Provides intelligent analysis and validation of reports
 */

class AIService {
  constructor() {
    this.confidenceThreshold = 0.7;
    this.similarityThreshold = 0.8;
  }

  /**
   * Analyze report content for problem validation
   * @param {Object} reportData - Report data including title, description, category, location
   * @returns {Object} Analysis results with confidence score and recommendations
   */
  async validateReportProblem(reportData) {
    try {
      const { title, description, category, latitude, longitude } = reportData;
      
      // Combine text for analysis
      const fullText = `${title} ${description}`.toLowerCase();
      
      // Problem validation patterns
      const validationResults = {
        confidence: 0,
        isGenuine: true,
        riskFactors: [],
        recommendations: [],
        categoryMatch: false,
        locationRelevance: false,
        urgencyScore: 0
      };

      // 1. Category-Content Matching Analysis
      validationResults.categoryMatch = this.analyzeCategoryMatch(fullText, category);
      if (validationResults.categoryMatch) {
        validationResults.confidence += 0.3;
      } else {
        validationResults.riskFactors.push('Category may not match content');
        validationResults.recommendations.push('Review category selection');
      }

      // 2. Location Relevance Analysis
      validationResults.locationRelevance = await this.analyzeLocationRelevance(
        latitude, longitude, category, fullText
      );
      if (validationResults.locationRelevance) {
        validationResults.confidence += 0.2;
      } else {
        validationResults.riskFactors.push('Location may not be relevant to reported issue');
      }

      // 3. Content Quality Analysis
      const contentQuality = this.analyzeContentQuality(fullText);
      validationResults.confidence += contentQuality.score * 0.2;
      validationResults.riskFactors.push(...contentQuality.risks);
      validationResults.recommendations.push(...contentQuality.recommendations);

      // 4. Urgency Assessment
      validationResults.urgencyScore = this.assessUrgency(fullText, category);
      if (validationResults.urgencyScore > 0.7) {
        validationResults.confidence += 0.1;
        validationResults.recommendations.push('High priority - consider immediate action');
      }

      // 5. Duplicate Detection
      const duplicateCheck = await this.checkForDuplicates(reportData);
      if (duplicateCheck.isDuplicate) {
        validationResults.isGenuine = false;
        validationResults.confidence = 0.1;
        validationResults.riskFactors.push('Potential duplicate report');
        validationResults.recommendations.push('Check existing reports in the area');
      }

      // 6. Spam/Inappropriate Content Detection
      const spamCheck = this.detectSpamContent(fullText);
      if (spamCheck.isSpam) {
        validationResults.isGenuine = false;
        validationResults.confidence = 0.05;
        validationResults.riskFactors.push('Content appears to be spam or inappropriate');
      }

      // Final confidence calculation
      validationResults.confidence = Math.min(validationResults.confidence, 1.0);
      validationResults.isGenuine = validationResults.confidence >= this.confidenceThreshold;

      return validationResults;
    } catch (error) {
      console.error('Error in AI report validation:', error);
      return {
        confidence: 0.5,
        isGenuine: true,
        riskFactors: ['Analysis failed'],
        recommendations: ['Manual review recommended'],
        categoryMatch: false,
        locationRelevance: false,
        urgencyScore: 0.5
      };
    }
  }

  /**
   * Analyze if category matches the content
   */
  analyzeCategoryMatch(text, category) {
    const categoryKeywords = {
      'GARBAGE': ['garbage', 'trash', 'waste', 'litter', 'dump', 'rubbish', 'bin', 'cleanup'],
      'ROAD': ['road', 'street', 'pothole', 'asphalt', 'pavement', 'traffic', 'vehicle', 'accident'],
      'WATER': ['water', 'pipe', 'leak', 'flood', 'drainage', 'sewer', 'hydrant', 'supply'],
      'POWER': ['power', 'electricity', 'outage', 'wire', 'cable', 'transformer', 'light', 'lamp'],
      'OTHER': ['other', 'general', 'miscellaneous', 'various', 'different']
    };

    const keywords = categoryKeywords[category] || [];
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
    
    return matchCount >= 1 || keywords.length === 0; // OTHER category always matches
  }

  /**
   * Analyze location relevance
   */
  async analyzeLocationRelevance(lat, lng, category, text) {
    try {
      // Check for nearby similar reports
      const nearbyReports = await prisma.report.findMany({
        where: {
          latitude: {
            gte: lat - 0.01, // ~1km radius
            lte: lat + 0.01
          },
          longitude: {
            gte: lng - 0.01,
            lte: lng + 0.01
          },
          category: category,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      // If there are many similar reports in the area, it's likely relevant
      return nearbyReports.length < 5; // Allow up to 5 similar reports
    } catch (error) {
      console.error('Error analyzing location relevance:', error);
      return true; // Default to relevant if analysis fails
    }
  }

  /**
   * Analyze content quality
   */
  analyzeContentQuality(text) {
    const result = {
      score: 0.5,
      risks: [],
      recommendations: []
    };

    // Check text length
    if (text.length < 20) {
      result.score -= 0.3;
      result.risks.push('Content too short');
      result.recommendations.push('Provide more detailed description');
    } else if (text.length > 100) {
      result.score += 0.2;
    }

    // Check for specific details
    const detailIndicators = ['location', 'time', 'date', 'specific', 'exact', 'near', 'around'];
    const hasDetails = detailIndicators.some(indicator => text.includes(indicator));
    if (hasDetails) {
      result.score += 0.2;
    }

    // Check for emotional language (might indicate urgency)
    const emotionalWords = ['urgent', 'emergency', 'dangerous', 'serious', 'critical', 'immediate'];
    const hasEmotional = emotionalWords.some(word => text.includes(word));
    if (hasEmotional) {
      result.score += 0.1;
    }

    // Check for inappropriate content
    const inappropriateWords = ['spam', 'test', 'fake', 'joke', 'prank'];
    const hasInappropriate = inappropriateWords.some(word => text.includes(word));
    if (hasInappropriate) {
      result.score -= 0.4;
      result.risks.push('Content may be inappropriate');
    }

    return result;
  }

  /**
   * Assess urgency level
   */
  assessUrgency(text, category) {
    let urgencyScore = 0.3; // Base urgency

    // Category-based urgency
    const categoryUrgency = {
      'POWER': 0.8,
      'WATER': 0.7,
      'ROAD': 0.6,
      'GARBAGE': 0.4,
      'OTHER': 0.5
    };
    urgencyScore = Math.max(urgencyScore, categoryUrgency[category] || 0.5);

    // Keyword-based urgency
    const urgentKeywords = ['emergency', 'urgent', 'dangerous', 'accident', 'flood', 'fire', 'outage'];
    const urgentCount = urgentKeywords.filter(keyword => text.includes(keyword)).length;
    urgencyScore += urgentCount * 0.1;

    return Math.min(urgencyScore, 1.0);
  }

  /**
   * Check for duplicate reports
   */
  async checkForDuplicates(reportData) {
    try {
      const { title, description, latitude, longitude, category } = reportData;
      
      // Find similar reports in the same area
      const similarReports = await prisma.report.findMany({
        where: {
          latitude: {
            gte: latitude - 0.005, // ~500m radius
            lte: latitude + 0.005
          },
          longitude: {
            gte: longitude - 0.005,
            lte: longitude + 0.005
          },
          category: category,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      // Check for text similarity
      const titleWords = title.toLowerCase().split(' ');
      const descriptionWords = description.toLowerCase().split(' ');
      
      for (const report of similarReports) {
        const reportTitleWords = report.title.toLowerCase().split(' ');
        const reportDescWords = report.description.toLowerCase().split(' ');
        
        // Calculate similarity
        const titleSimilarity = this.calculateSimilarity(titleWords, reportTitleWords);
        const descSimilarity = this.calculateSimilarity(descriptionWords, reportDescWords);
        
        if (titleSimilarity > this.similarityThreshold || descSimilarity > this.similarityThreshold) {
          return {
            isDuplicate: true,
            similarReport: report,
            similarity: Math.max(titleSimilarity, descSimilarity)
          };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Calculate text similarity
   */
  calculateSimilarity(words1, words2) {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Detect spam content
   */
  detectSpamContent(text) {
    const spamIndicators = [
      'spam', 'test', 'fake', 'joke', 'prank', 'lorem ipsum',
      'asdf', 'qwerty', '123456', 'password', 'admin'
    ];

    const spamCount = spamIndicators.filter(indicator => 
      text.includes(indicator)
    ).length;

    return {
      isSpam: spamCount > 0,
      confidence: spamCount / spamIndicators.length
    };
  }

  /**
   * Generate AI-powered insights for admin dashboard
   */
  async generateInsights() {
    try {
      const insights = {
        trends: await this.analyzeTrends(),
        predictions: await this.generatePredictions(),
        recommendations: await this.generateRecommendations(),
        alerts: await this.generateAlerts()
      };

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        trends: [],
        predictions: [],
        recommendations: [],
        alerts: []
      };
    }
  }

  /**
   * Analyze trends in reports
   */
  async analyzeTrends() {
    try {
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const reports = await prisma.report.findMany({
        where: {
          createdAt: { gte: last30Days }
        },
        select: {
          category: true,
          status: true,
          createdAt: true,
          latitude: true,
          longitude: true
        }
      });

      // Category trends
      const categoryCounts = reports.reduce((acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
      }, {});

      // Status trends
      const statusCounts = reports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {});

      return {
        categoryTrends: categoryCounts,
        statusTrends: statusCounts,
        totalReports: reports.length,
        period: '30 days'
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return {};
    }
  }

  /**
   * Generate predictions
   */
  async generatePredictions() {
    try {
      const predictions = [];

      // Predict report volume for next week
      const lastWeekReports = await prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      predictions.push({
        type: 'report_volume',
        prediction: Math.round(lastWeekReports * 1.1), // 10% increase
        confidence: 0.7,
        timeframe: 'next 7 days'
      });

      // Predict high-risk areas
      const highVolumeAreas = await prisma.report.groupBy({
        by: ['latitude', 'longitude'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          id: true
        },
        having: {
          id: {
            _count: {
              gt: 3
            }
          }
        }
      });

      predictions.push({
        type: 'high_risk_areas',
        prediction: highVolumeAreas.length,
        confidence: 0.8,
        timeframe: 'next 7 days',
        areas: highVolumeAreas
      });

      return predictions;
    } catch (error) {
      console.error('Error generating predictions:', error);
      return [];
    }
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations() {
    try {
      const recommendations = [];

      // Check for unresolved reports
      const unresolvedCount = await prisma.report.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
          }
        }
      });

      if (unresolvedCount > 0) {
        recommendations.push({
          type: 'action_required',
          priority: 'high',
          message: `${unresolvedCount} reports have been unresolved for over 7 days`,
          action: 'Review and prioritize older reports'
        });
      }

      // Check for high-volume categories
      const categoryCounts = await prisma.report.groupBy({
        by: ['category'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const topCategory = categoryCounts.reduce((max, current) => 
        current._count.id > max._count.id ? current : max
      );

      if (topCategory._count.id > 10) {
        recommendations.push({
          type: 'resource_allocation',
          priority: 'medium',
          message: `${topCategory.category} reports are increasing significantly`,
          action: `Consider allocating more resources to ${topCategory.category} issues`
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Generate alerts
   */
  async generateAlerts() {
    try {
      const alerts = [];

      // Check for emergency reports
      const emergencyReports = await prisma.report.count({
        where: {
          status: 'OPEN',
          category: { in: ['POWER', 'WATER'] },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (emergencyReports > 5) {
        alerts.push({
          type: 'emergency',
          severity: 'high',
          message: `${emergencyReports} emergency reports in the last 24 hours`,
          action: 'Immediate attention required'
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error generating alerts:', error);
      return [];
    }
  }
}

module.exports = new AIService();
