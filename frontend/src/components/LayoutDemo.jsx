import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LayoutDemo = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Layout Refactoring Complete!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            The CityWatch navigation has been successfully refactored with a modern, clean design.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ What's New</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Single top navbar for global navigation</li>
                <li>• Collapsible sidebar for admin functions</li>
                <li>• Clean separation of app vs admin features</li>
                <li>• Mobile-responsive design</li>
                <li>• Smooth animations and transitions</li>
                <li>• Consistent icon usage</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Navigation Structure</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>Top Nav:</strong> Dashboard, Reports, Events, Announcements, Alerts, Settings</li>
                <li>• <strong>Admin Sidebar:</strong> Manage Users, Create Authority, Authority Types, etc.</li>
                <li>• <strong>User Info:</strong> Profile picture, welcome message, logout</li>
                <li>• <strong>Notifications:</strong> Real-time notification dropdown</li>
              </ul>
            </div>
          </div>

          {user && (
            <div className="bg-primary-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                👋 Welcome back, {user.username}!
              </h3>
              <p className="text-primary-700">
                Your role: <span className="font-medium capitalize">{user.role}</span>
                {user.role === 'admin' && (
                  <span className="ml-2 text-sm bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
                    Full Access
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </a>
            {user?.role === 'admin' && (
              <a 
                href="/admin/dashboard" 
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Admin Panel
              </a>
            )}
            <a 
              href="/reports" 
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              View Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutDemo;
