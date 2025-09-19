import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsCharts = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Charts</h3>
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Charts will be implemented here</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsCharts;
