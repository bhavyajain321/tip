// File: frontend/src/pages/dashboard/StatsCards.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  RssIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const StatsCards = ({ iocs = [], feeds = [] }) => {
  const stats = [
    {
      name: 'Total IOCs',
      value: iocs.length?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'increase',
      icon: ShieldExclamationIcon,
      color: 'bg-primary-500',
    },
    {
      name: 'Active Feeds',
      value: feeds.filter(feed => feed.is_active)?.length || '0',
      change: '+2',
      changeType: 'increase',
      icon: RssIcon,
      color: 'bg-success-500',
    },
    {
      name: 'High Severity Threats',
      value: iocs.filter(ioc => ioc.severity === 'high' || ioc.severity === 'critical')?.length || '0',
      change: '-8%',
      changeType: 'decrease',
      icon: ExclamationTriangleIcon,
      color: 'bg-danger-500',
    },
    {
      name: 'Feed Success Rate',
      value: '98.5%',
      change: '+0.5%',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'bg-warning-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
