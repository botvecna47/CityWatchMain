import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { motion } from 'framer-motion';

// Color palette for consistent theming
const COLORS = {
  primary: '#2f83f7',
  secondary: '#16a34a',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.gray
];

// Reports Over Time Chart
export const ReportsOverTimeChart = ({ data, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Reports Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="reports"
            stroke={COLORS.primary}
            fillOpacity={1}
            fill="url(#colorReports)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Category Distribution Pie Chart
export const CategoryDistributionChart = ({ data, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Reports by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Status Distribution Chart
export const StatusDistributionChart = ({ data, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Reports by Status
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="status" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="count" 
            fill={COLORS.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Response Time Chart
export const ResponseTimeChart = ({ data, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Average Response Time (Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="category" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="responseTime" 
            stroke={COLORS.secondary}
            strokeWidth={3}
            dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// User Activity Chart
export const UserActivityChart = ({ data, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        User Activity
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar dataKey="newUsers" stackId="a" fill={COLORS.primary} name="New Users" />
          <Bar dataKey="activeUsers" stackId="a" fill={COLORS.secondary} name="Active Users" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Performance Metrics Radial Chart
export const PerformanceMetricsChart = ({ data, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Performance Metrics
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data}>
          <RadialBar
            minAngle={15}
            label={{ position: "insideStart", fill: "#fff" }}
            background
            clockWise
            dataKey="value"
          />
          <Legend />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// KPI Cards Component
export const KPICards = ({ data, className = "" }) => {
  const cards = [
    {
      title: "Total Reports",
      value: data?.totalReports || 0,
      change: "+12%",
      changeType: "positive",
      icon: "📊"
    },
    {
      title: "Resolved Issues",
      value: data?.resolvedReports || 0,
      change: "+8%",
      changeType: "positive",
      icon: "✅"
    },
    {
      title: "Active Users",
      value: data?.activeUsers || 0,
      change: "+15%",
      changeType: "positive",
      icon: "👥"
    },
    {
      title: "Avg Response Time",
      value: `${data?.avgResponseTime || 0} days`,
      change: "-2 days",
      changeType: "positive",
      icon: "⏱️"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {card.value}
              </p>
              <p className={`text-sm font-medium ${
                card.changeType === 'positive' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {card.change}
              </p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
