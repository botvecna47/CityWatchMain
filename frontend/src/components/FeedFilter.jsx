import React from 'react';

const FeedFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All', icon: '📄' },
    { key: 'reports', label: 'Reports', icon: '📝' },
    { key: 'alerts', label: 'Alerts', icon: '🚨' },
    { key: 'events', label: 'Events', icon: '📢' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            activeFilter === filter.key
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="mr-2">{filter.icon}</span>
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FeedFilter;
