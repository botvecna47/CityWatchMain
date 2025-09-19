const prisma = require('./database');

class AIService {
  constructor() {
    this.responses = {
      greetings: [
        "Hello! I'm your CityWatch AI assistant. How can I help you today?",
        "Hi there! I'm here to help you stay updated about your city. What would you like to know?",
        "Welcome! I can tell you about the latest happenings in your city. What's on your mind?"
      ],
      cityUpdates: [
        "Here's what's happening in your city right now:",
        "Let me check the latest updates for your city:",
        "Here are the recent developments in your area:"
      ],
      noUpdates: [
        "Things are pretty quiet in your city right now. No major updates to report!",
        "Your city is running smoothly! No recent reports or events to share.",
        "All quiet on the city front! No new updates at the moment."
      ]
    };
  }

  // Generate greeting response
  getGreeting() {
    const randomIndex = Math.floor(Math.random() * this.responses.greetings.length);
    return this.responses.greetings[randomIndex];
  }

  // Get latest city updates
  async getCityUpdates(userCityId, limit = 5) {
    try {
      const city = await prisma.city.findUnique({
        where: { id: userCityId },
        select: { name: true }
      });

      if (!city) {
        return "I couldn't find your city information. Please make sure your city is set correctly.";
      }

      // Get latest reports
      const latestReports = await prisma.report.findMany({
        where: { 
          cityId: userCityId
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          status: true,
          createdAt: true,
          author: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      // Get upcoming events
      const upcomingEvents = await prisma.event.findMany({
        where: { 
          cityId: userCityId,
          dateTime: { gte: new Date() }
        },
        orderBy: { dateTime: 'asc' },
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          dateTime: true,
          location: true
        }
      });

      // Get active alerts
      const activeAlerts = await prisma.alert.findMany({
        where: { 
          cityId: userCityId,
          deleted: false
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true
        }
      });

      return this.formatCityUpdates(city.name, latestReports, upcomingEvents, activeAlerts);
    } catch (error) {
      console.error('Error getting city updates:', error);
      return "Sorry, I'm having trouble accessing the latest city information right now. Please try again later.";
    }
  }

  // Format city updates into natural language
  formatCityUpdates(cityName, reports, events, alerts) {
    let response = `🏙️ **Latest Updates for ${cityName}**\n\n`;

    // Add reports
    if (reports.length > 0) {
      response += "📋 **Recent Reports:**\n";
      reports.forEach((report, index) => {
        const timeAgo = this.getTimeAgo(report.createdAt);
        const author = `${report.author.firstName} ${report.author.lastName}`;
        response += `${index + 1}. **${report.title}** (${report.category})\n`;
        response += `   Status: ${report.status} | Reported by ${author} ${timeAgo}\n`;
        if (report.description && report.description.length > 100) {
          response += `   ${report.description.substring(0, 100)}...\n`;
        } else if (report.description) {
          response += `   ${report.description}\n`;
        }
        response += "\n";
      });
    }

    // Add events
    if (events.length > 0) {
      response += "🎉 **Upcoming Events:**\n";
      events.forEach((event, index) => {
        const eventDate = new Date(event.dateTime).toLocaleDateString();
        response += `${index + 1}. **${event.title}**\n`;
        response += `   📅 ${eventDate}`;
        if (event.location) {
          response += ` | 📍 ${event.location}`;
        }
        response += "\n";
        if (event.description && event.description.length > 80) {
          response += `   ${event.description.substring(0, 80)}...\n`;
        } else if (event.description) {
          response += `   ${event.description}\n`;
        }
        response += "\n";
      });
    }

    // Add alerts
    if (alerts.length > 0) {
      response += "⚠️ **Active Alerts:**\n";
      alerts.forEach((alert, index) => {
        const timeAgo = this.getTimeAgo(alert.createdAt);
        response += `${index + 1}. ⚠️ **${alert.title}**\n`;
        response += `   ${alert.message}\n`;
        response += `   Posted ${timeAgo}\n\n`;
      });
    }

    // If no updates
    if (reports.length === 0 && events.length === 0 && alerts.length === 0) {
      const randomIndex = Math.floor(Math.random() * this.responses.noUpdates.length);
      response = this.responses.noUpdates[randomIndex];
    }

    return response;
  }

  // Get time ago string
  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  }

  // Get severity emoji
  getSeverityEmoji(severity) {
    switch (severity) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🟠';
      case 'CRITICAL': return '🔴';
      default: return '⚪';
    }
  }

  // Process user message and generate response
  async processMessage(message, user) {
    const lowerMessage = message.toLowerCase().trim();

    // Greeting patterns
    if (this.isGreeting(lowerMessage)) {
      return this.getGreeting();
    }

    // Latest alerts patterns
    if (this.isAlertsQuery(lowerMessage)) {
      if (!user.cityId) {
        return "I'd love to show you the latest alerts, but I need to know which city you're in. Please set your city in your profile settings first.";
      }
      return await this.getLatestAlerts(user.cityId);
    }

    // User reports patterns
    if (this.isUserReportsQuery(lowerMessage)) {
      return await this.getUserReports(user.id);
    }

    // Upcoming events patterns
    if (this.isEventsQuery(lowerMessage)) {
      if (!user.cityId) {
        return "I'd love to show you upcoming events, but I need to know which city you're in. Please set your city in your profile settings first.";
      }
      return await this.getUpcomingEvents(user.cityId);
    }

    // City updates patterns
    if (this.isCityUpdateQuery(lowerMessage)) {
      if (!user.cityId) {
        return "I'd love to tell you about your city updates, but I need to know which city you're in. Please set your city in your profile settings first.";
      }
      return await this.getCityUpdates(user.cityId);
    }

    // Help patterns
    if (this.isHelpQuery(lowerMessage)) {
      return this.getHelpResponse();
    }

    // Default response
    return this.getDefaultResponse();
  }

  // Check if message is a greeting
  isGreeting(message) {
    const greetingPatterns = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'greetings', 'howdy', 'what\'s up', 'how are you'
    ];
    return greetingPatterns.some(pattern => message.includes(pattern));
  }

  // Check if message is asking for alerts
  isAlertsQuery(message) {
    const alertPatterns = [
      'alerts', 'alert', 'warnings', 'warning', 'emergency', 'emergencies',
      'latest alerts', 'recent alerts', 'active alerts', 'show alerts',
      'any alerts', 'alert me', 'alert updates'
    ];
    return alertPatterns.some(pattern => message.includes(pattern));
  }

  // Check if message is asking about user's reports
  isUserReportsQuery(message) {
    const reportPatterns = [
      'my reports', 'my report', 'reports i created', 'my submissions',
      'status of my reports', 'my report status', 'reports i made',
      'show my reports', 'my report updates', 'my submitted reports'
    ];
    return reportPatterns.some(pattern => message.includes(pattern));
  }

  // Check if message is asking for events
  isEventsQuery(message) {
    const eventPatterns = [
      'events', 'event', 'upcoming events', 'today events', 'events today',
      'events later', 'events soon', 'what events', 'show events',
      'city events', 'local events', 'community events', 'event schedule'
    ];
    return eventPatterns.some(pattern => message.includes(pattern));
  }

  // Check if message is asking for city updates
  isCityUpdateQuery(message) {
    const updatePatterns = [
      'what\'s new', 'whats new', 'latest', 'recent', 'updates', 'happenings',
      'going on', 'news', 'city updates', 'anything new', 'what\'s happening', 
      'whats happening', 'city news', 'local news'
    ];
    return updatePatterns.some(pattern => message.includes(pattern));
  }

  // Check if message is asking for help
  isHelpQuery(message) {
    const helpPatterns = [
      'help', 'assist', 'support', 'how to', 'what can you do', 'commands',
      'features', 'guide', 'tutorial'
    ];
    return helpPatterns.some(pattern => message.includes(pattern));
  }

  // Get help response
  getHelpResponse() {
    return `🤖 **I can help you with:**

🚨 **Latest Alerts** - Ask "Latest alerts" to see the 2 most recent alerts in your city

📝 **Your Reports** - Ask "Show my reports" to see your submitted reports and their status updates

🎉 **Upcoming Events** - Ask "Upcoming events" to see events happening today or tomorrow

📋 **City Updates** - Ask "What's new in the city?" for a general overview

🎯 **Try asking:**
• "Latest alerts"
• "Show my reports" 
• "Upcoming events"
• "What's new in the city?"

💡 **Tips:**
• I show real-time data from your city
• Make sure your city is set in your profile
• I give friendly, short, and clear answers

Just ask me anything about your city! 🏙️`;
  }

  // Get default response
  getDefaultResponse() {
    const responses = [
      "I'm not sure I understand that. Try asking me about 'latest alerts', 'my reports', 'upcoming events', or 'what's new in the city'!",
      "I'm here to help with city information! Ask me about alerts, your reports, events, or general city updates.",
      "I can tell you about alerts, your reports, upcoming events, or city news. Try asking 'help' to see all options!",
      "I'm your city assistant! I can show you alerts, your reports, events, or city updates. What would you like to know?"
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  // Get latest alerts for a city
  async getLatestAlerts(cityId) {
    try {
      const city = await prisma.city.findUnique({
        where: { id: cityId },
        select: { name: true }
      });

      if (!city) {
        return "I couldn't find your city information. Please make sure your city is set correctly.";
      }

      const alerts = await prisma.alert.findMany({
        where: { 
          cityId: cityId,
          deleted: false
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true
        }
      });

      if (alerts.length === 0) {
        return `🚨 **Latest Alerts for ${city.name}**\n\nGood news! There are no active alerts in your city right now. Everything looks safe! 😊`;
      }

      let response = `🚨 **Latest Alerts for ${city.name}**\n\n`;
      alerts.forEach((alert, index) => {
        const timeAgo = this.getTimeAgo(alert.createdAt);
        response += `${index + 1}. **${alert.title}**\n`;
        response += `   ${alert.message}\n`;
        response += `   Posted ${timeAgo}\n\n`;
      });

      return response;
    } catch (error) {
      console.error('Error getting latest alerts:', error);
      return "Sorry, I'm having trouble accessing the latest alerts right now. Please try again later.";
    }
  }

  // Get user's reports with status updates
  async getUserReports(userId) {
    try {
      const reports = await prisma.report.findMany({
        where: { 
          authorId: userId,
          status: { not: 'DELETED' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          authorityUpdates: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              text: true,
              newStatus: true,
              createdAt: true,
              authority: {
                select: { username: true }
              }
            }
          }
        }
      });

      if (reports.length === 0) {
        return "📝 **Your Reports**\n\nYou haven't submitted any reports yet. Create your first report to track city issues!";
      }

      let response = "📝 **Your Recent Reports**\n\n";
      reports.forEach((report, index) => {
        const timeAgo = this.getTimeAgo(report.createdAt);
        const statusEmoji = this.getStatusEmoji(report.status);
        
        response += `${index + 1}. ${statusEmoji} **${report.title}**\n`;
        response += `   Status: ${report.status.replace('_', ' ')}\n`;
        response += `   Submitted ${timeAgo}\n`;
        
        if (report.authorityUpdates.length > 0) {
          const latestUpdate = report.authorityUpdates[0];
          const updateTimeAgo = this.getTimeAgo(latestUpdate.createdAt);
          response += `   Latest update: "${latestUpdate.text}"\n`;
          response += `   By ${latestUpdate.authority.username} ${updateTimeAgo}\n`;
        }
        response += "\n";
      });

      return response;
    } catch (error) {
      console.error('Error getting user reports:', error);
      return "Sorry, I'm having trouble accessing your reports right now. Please try again later.";
    }
  }

  // Get upcoming events for a city
  async getUpcomingEvents(cityId) {
    try {
      const city = await prisma.city.findUnique({
        where: { id: cityId },
        select: { name: true }
      });

      if (!city) {
        return "I couldn't find your city information. Please make sure your city is set correctly.";
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const events = await prisma.event.findMany({
        where: { 
          cityId: cityId,
          dateTime: { 
            gte: now,
            lte: tomorrow
          }
        },
        orderBy: { dateTime: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          dateTime: true,
          location: true
        }
      });

      if (events.length === 0) {
        return `🎉 **Upcoming Events in ${city.name}**\n\nNo events scheduled for today or tomorrow. Check back later for new events!`;
      }

      let response = `🎉 **Upcoming Events in ${city.name}**\n\n`;
      events.forEach((event, index) => {
        const eventDate = new Date(event.dateTime);
        const isToday = eventDate.toDateString() === now.toDateString();
        const timeStr = eventDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        response += `${index + 1}. **${event.title}**\n`;
        response += `   📅 ${isToday ? 'Today' : 'Tomorrow'} at ${timeStr}\n`;
        if (event.location) {
          response += `   📍 ${event.location}\n`;
        }
        if (event.description && event.description.length > 80) {
          response += `   ${event.description.substring(0, 80)}...\n`;
        } else if (event.description) {
          response += `   ${event.description}\n`;
        }
        response += "\n";
      });

      return response;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return "Sorry, I'm having trouble accessing upcoming events right now. Please try again later.";
    }
  }

  // Get status emoji for reports
  getStatusEmoji(status) {
    switch (status) {
      case 'OPEN': return '🔴';
      case 'IN_PROGRESS': return '🟡';
      case 'RESOLVED': return '🟢';
      case 'CLOSED': return '⚫';
      default: return '⚪';
    }
  }

  // Get smart suggestions based on user's city
  async getSmartSuggestions(userCityId) {
    try {
      const suggestions = [
        { text: "What's new in the city?", type: "query" },
        { text: "Show my reports", type: "action" },
        { text: "Latest alerts", type: "action" },
        { text: "Upcoming events", type: "action" }
      ];

      // Add city-specific suggestions if we have data
      if (userCityId) {
        const reportCount = await prisma.report.count({
          where: { cityId: userCityId }
        });

        if (reportCount > 0) {
          suggestions.push({ text: `View all ${reportCount} reports`, type: "action" });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [
        { text: "What's new in the city?", type: "query" },
        { text: "Show my reports", type: "action" },
        { text: "Help", type: "action" }
      ];
    }
  }
}

module.exports = new AIService();
