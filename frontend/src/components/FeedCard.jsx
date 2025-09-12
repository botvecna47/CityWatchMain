import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

const FeedCard = ({ item, type, onDelete, user }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'report':
        return '📝';
      case 'alert':
        return '🚨';
      case 'event':
        return '📢';
      default:
        return '📄';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'report':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          hover: 'hover:border-blue-300',
          text: 'text-blue-700'
        };
      case 'alert':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          hover: 'hover:border-yellow-300',
          text: 'text-yellow-700'
        };
      case 'event':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          hover: 'hover:border-green-300',
          text: 'text-green-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          hover: 'hover:border-gray-300',
          text: 'text-gray-700'
        };
    }
  };

  const getStatusBadge = () => {
    if (type === 'report' && item.status) {
      const statusColors = {
        'OPEN': 'bg-red-100 text-red-800',
        'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
        'RESOLVED': 'bg-green-100 text-green-800',
        'CLOSED': 'bg-gray-100 text-gray-800'
      };
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
          {item.status.replace('_', ' ')}
        </span>
      );
    }
    if (type === 'event' && item.dateTime) {
      const isPast = new Date(item.dateTime) < new Date();
      if (isPast) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Past Event
          </span>
        );
      }
    }
    if (type === 'alert' && item.isPinned) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Pinned
        </span>
      );
    }
    return null;
  };

  const getContent = () => {
    switch (type) {
      case 'report':
        return {
          title: item.title,
          description: item.description,
          image: item.attachments?.[0]?.url,
          author: item.author?.username,
          timestamp: item.createdAt,
          link: `/reports/${item.id}`
        };
      case 'alert':
        return {
          title: item.title,
          description: item.message,
          image: null,
          author: item.creator?.username,
          timestamp: item.createdAt,
          link: null
        };
      case 'event':
        return {
          title: item.title,
          description: item.description,
          image: item.imageUrl,
          author: item.creator?.username,
          timestamp: item.createdAt,
          link: null
        };
      default:
        return {};
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const content = getContent();
  const colors = getTypeColor();
  const isOwner = user && (
    (type === 'report' && item.authorId === user.id) ||
    (type === 'alert' && item.createdBy === user.id) ||
    (type === 'event' && item.createdBy === user.id)
  );

  const CardContent = () => (
    <div className={`bg-white rounded-lg border ${colors.border} ${colors.hover} transition-colors duration-200 hover:shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center text-sm`}>
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{content.author}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{item.city?.name}</span>
            </div>
            <div className="text-xs text-gray-500">{formatTimestamp(content.timestamp)}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {content.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          {truncateText(content.description)}
        </p>
        {content.image && (
          <div className="mb-3">
            <LazyImage
              src={content.image}
              alt={content.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {content.link && (
              <Link
                to={content.link}
                className={`text-sm font-medium ${colors.text} hover:underline`}
              >
                View Details
              </Link>
            )}
            {type === 'report' && (
              <span className="text-sm text-gray-500">
                {item.comments?.length || 0} comments
              </span>
            )}
            {type === 'event' && item.location && (
              <span className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </span>
            )}
          </div>
          {type === 'event' && item.dateTime && (
            <div className="text-sm text-gray-500">
              {new Date(item.dateTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (content.link) {
    return (
      <Link to={content.link} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default FeedCard;
