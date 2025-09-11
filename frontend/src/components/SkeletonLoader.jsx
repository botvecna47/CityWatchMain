import React from 'react';

// Skeleton loader for report cards
export const ReportCardSkeleton = () => (
  <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="ml-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Skeleton loader for dashboard stats
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center">
      <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
      <div className="ml-4">
        <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  </div>
);

// Skeleton loader for user profile
export const ProfileSkeleton = () => (
  <div className="flex items-center space-x-4 animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
    <div>
      <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

// Skeleton loader for notification items
export const NotificationSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

// Skeleton loader for comments
export const CommentSkeleton = () => (
  <div className="border-b border-gray-200 p-4 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export default {
  ReportCardSkeleton,
  StatsCardSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
  CommentSkeleton
};
