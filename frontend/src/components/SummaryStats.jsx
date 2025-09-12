import React from 'react';
import { Link } from 'react-router-dom';

const SummaryStats = ({ stats, loading }) => {
  const statItems = [
    {
      label: 'Reports',
      count: stats.reports || 0,
      icon: '📝',
      color: 'blue',
      link: '/dashboard?filter=reports'
    },
    {
      label: 'Alerts',
      count: stats.alerts || 0,
      icon: '🚨',
      color: 'yellow',
      link: '/dashboard?filter=alerts'
    },
    {
      label: 'Events',
      count: stats.events || 0,
      icon: '📢',
      color: 'green',
      link: '/dashboard?filter=events'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200'
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {statItems.map((item) => {
        const colors = getColorClasses(item.color);
        return (
          <Link
            key={item.label}
            to={item.link}
            className={`bg-white rounded-lg border ${colors.border} p-4 hover:shadow-sm transition-shadow duration-200`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-lg`}>
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">{item.label}</div>
                <div className={`text-2xl font-bold ${colors.text}`}>{item.count}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SummaryStats;
