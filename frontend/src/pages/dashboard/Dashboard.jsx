// File: frontend/src/pages/dashboard/Dashboard.jsx
import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import StatsCards from './StatsCards';
import ThreatTimeline from './ThreatTimeline';
import FeedStatus from './FeedStatus';
import RecentIOCs from './RecentIOCs';
import ThreatMap from './ThreatMap';
import { useAPI } from '../../contexts/APIContext';

const Dashboard = () => {
  const api = useAPI();

  // Fetch dashboard data
  const { data: systemStatus } = useQuery('systemStatus', api.system.getStatus);
  const { data: iocs } = useQuery('recentIOCs', () => api.iocs.getAll({ limit: 10 }));
  const { data: feeds } = useQuery('feeds', api.feeds.getAll);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Threat Intelligence Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Real-time threat monitoring and intelligence overview
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button className="btn-primary">
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={itemVariants}>
        <StatsCards iocs={iocs?.data} feeds={feeds?.data} />
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <ThreatTimeline />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <RecentIOCs iocs={iocs?.data} />
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <FeedStatus feeds={feeds?.data} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ThreatMap />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
