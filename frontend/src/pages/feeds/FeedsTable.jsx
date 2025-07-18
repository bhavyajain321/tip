// File: frontend/src/pages/feeds/FeedsTable.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  TrashIcon, 
  EyeIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const FeedsTable = ({ 
  feeds, 
  loading, 
  onDeleteFeed, 
  onTriggerUpdate, 
  onToggleFeed, 
  onViewDetails 
}) => {
  const getStatusIcon = (feed) => {
    if (!feed.is_active) {
      return <StopIcon className="h-5 w-5 text-gray-400" />;
    }
    
    if (feed.last_update) {
      const lastUpdateDate = new Date(feed.last_update);
      const hoursSinceUpdate = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 2) {
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      } else if (hoursSinceUpdate < 24) {
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      }
    }
    
    return <ExclamationCircleIcon className="h-5 w-5 text-danger-500" />;
  };

  const getStatusText = (feed) => {
    if (!feed.is_active) return 'Inactive';
    
    if (feed.last_update) {
      const lastUpdateDate = new Date(feed.last_update);
      const hoursSinceUpdate = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 2) return 'Online';
      if (hoursSinceUpdate < 24) return 'Warning';
    }
    
    return 'Error';
  };

  const getReliabilityBadge = (reliability) => {
    const badges = {
      'a': 'badge-success',
      'b': 'badge-primary',
      'c': 'badge-warning',
      'd': 'badge-danger',
      'e': 'badge-danger',
      'f': 'badge-gray',
      'unknown': 'badge-gray',
    };
    return badges[reliability] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feed Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reliability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IOCs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feeds.map((feed, index) => (
              <motion.tr
                key={feed.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {feed.name}
                    </div>
                    {feed.url && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {feed.url}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-primary">
                    {feed.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(feed)}
                    <span className="ml-2 text-sm text-gray-600">
                      {getStatusText(feed)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getReliabilityBadge(feed.reliability)}`}>
                    {feed.reliability.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {feed.total_iocs?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {feed.last_update 
                    ? formatDistanceToNow(new Date(feed.last_update)) + ' ago'
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetails(feed)}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onTriggerUpdate(feed.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Trigger Update"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleFeed(feed)}
                      className={feed.is_active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                      title={feed.is_active ? "Disable Feed" : "Enable Feed"}
                    >
                      {feed.is_active ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => onDeleteFeed(feed.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Feed"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {feeds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No feeds configured</p>
            <p className="text-sm">Add your first threat intelligence feed to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedsTable;
