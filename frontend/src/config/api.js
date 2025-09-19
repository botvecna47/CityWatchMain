// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP_VALIDATE: `${API_BASE_URL}/api/auth/validate-signup`,
  SIGNUP_VERIFY: `${API_BASE_URL}/api/auth/send-verification`,
  SIGNUP_COMPLETE: `${API_BASE_URL}/api/auth/complete-signup`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  ME: `${API_BASE_URL}/api/auth/me`,
  
  // Reports endpoints
  REPORTS: `${API_BASE_URL}/api/reports`,
  REPORTS_NEARBY: `${API_BASE_URL}/api/reports/nearby`,
  REPORTS_CHECK_DUPLICATE: `${API_BASE_URL}/api/reports/check-duplicate`,
  REPORTS_CREATE: `${API_BASE_URL}/api/reports`,
  REPORTS_BY_ID: (id) => `${API_BASE_URL}/api/reports/${id}`,
  REPORTS_TIMELINE: (id) => `${API_BASE_URL}/api/reports/${id}/timeline`,
  REPORTS_UPDATE: (id) => `${API_BASE_URL}/api/reports/${id}/updates`,
  REPORTS_CLOSE: (id) => `${API_BASE_URL}/api/reports/${id}/close`,
  
  // Comments endpoints
  COMMENTS: (reportId) => `${API_BASE_URL}/api/comments/${reportId}`,
  COMMENTS_DELETE: (commentId) => `${API_BASE_URL}/api/comments/${commentId}`,
  
  // Users endpoints
  USERS_ME: `${API_BASE_URL}/api/users/me`,
  USERS_CITY: `${API_BASE_URL}/api/users/me/city`,
  USERS_PROFILE: `${API_BASE_URL}/api/users/me/profile`,
  
  // Cities endpoints
  CITIES: `${API_BASE_URL}/api/cities`,
  
  // Attachments endpoints
  ATTACHMENTS_UPLOAD: (reportId) => `${API_BASE_URL}/api/attachments/${reportId}/upload`,
  ATTACHMENTS_GET: (reportId) => `${API_BASE_URL}/api/attachments/${reportId}`,
  ATTACHMENTS_DELETE: (attachmentId) => `${API_BASE_URL}/api/attachments/${attachmentId}`,
  
  // Notifications endpoints
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATIONS_READ: `${API_BASE_URL}/api/notifications/read`,
  NOTIFICATIONS_UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_REPORTS: `${API_BASE_URL}/api/admin/reports`,
  ADMIN_AUDIT: `${API_BASE_URL}/api/admin/audit`,
  ADMIN_USER_ROLE: (userId) => `${API_BASE_URL}/api/admin/users/${userId}/role`,
  ADMIN_USER_BAN: (userId) => `${API_BASE_URL}/api/admin/users/${userId}/ban`,
  ADMIN_REPORT_DELETE: (reportId) => `${API_BASE_URL}/api/admin/reports/${reportId}`,
  ADMIN_REPORT_RESTORE: (reportId) => `${API_BASE_URL}/api/admin/reports/${reportId}/restore`,
  
  // Alerts endpoints
  ALERTS: `${API_BASE_URL}/api/alerts`,
  ALERTS_MY: `${API_BASE_URL}/api/alerts/my/alerts`,
  ALERTS_BY_ID: (id) => `${API_BASE_URL}/api/alerts/${id}`,
  ALERTS_UPDATE: (id) => `${API_BASE_URL}/api/alerts/${id}`,
  ALERTS_DELETE: (id) => `${API_BASE_URL}/api/alerts/${id}`,
  
  // Events endpoints
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENTS_MY: `${API_BASE_URL}/api/events/my/events`,
  EVENTS_BY_ID: (id) => `${API_BASE_URL}/api/events/${id}`,
  EVENTS_DELETE: (id) => `${API_BASE_URL}/api/events/${id}`,

  // AI endpoints
  AI_CHAT: `${API_BASE_URL}/api/ai/chat`,
  AI_CITY_UPDATES: `${API_BASE_URL}/api/ai/city-updates`,
  AI_SUGGESTIONS: `${API_BASE_URL}/api/ai/suggestions`,
  AI_HELP: `${API_BASE_URL}/api/ai/help`,
  AI_STATUS: `${API_BASE_URL}/api/ai/status`,

  // Analytics endpoints
  ANALYTICS_DASHBOARD: `${API_BASE_URL}/api/analytics/dashboard`,
  ANALYTICS_USERS: `${API_BASE_URL}/api/analytics/users`,
  ANALYTICS_REPORTS: `${API_BASE_URL}/api/analytics/reports`,
  ANALYTICS_EVENTS: `${API_BASE_URL}/api/analytics/events`,
  ANALYTICS_ALERTS: `${API_BASE_URL}/api/analytics/alerts`,
  ANALYTICS_AUTHORITY_DASHBOARD: `${API_BASE_URL}/api/analytics/authority/dashboard`,
};

export default API_BASE_URL;
