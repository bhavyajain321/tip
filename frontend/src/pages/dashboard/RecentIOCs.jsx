// File: frontend/src/pages/dashboard/RecentIOCs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';


const RecentIOCs = ({ iocs = [] }) => {
  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'badge-danger',
      high: 'badge-warning',
      medium: 'badge-primary',
      low: 'badge-success',
    };
    return badges[severity] || 'badge-gray';
  };

  const getTypeBadge = (type) => {
    const badges = {
      ip: 'bg-blue-100 text-blue-800',
      domain: 'bg-green-100 text-green-800',
      url: 'bg-purple-100 text-purple-800',
      hash: 'bg-yellow-100 text-yellow-800',
      email: 'bg-red-100 text-red-800',
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent IOCs</h3>
          <Link 
            to="/iocs" 
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            View All
            <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {iocs.slice(0, 8).map((ioc) => (
            <div key={ioc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`badge ${getTypeBadge(ioc.type)}`}>
                    {ioc.type.toUpperCase()}
                  </span>
                  <span className={`badge ${getSeverityBadge(ioc.severity)}`}>
                    {ioc.severity}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {ioc.value}
                </p>
                <p className="text-xs text-gray-500">
                  Added {formatDistanceToNow(new Date(ioc.first_seen))} ago
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  ioc.confidence > 0.8 ? 'bg-success-400' :
                  ioc.confidence > 0.5 ? 'bg-warning-400' :
                  'bg-danger-400'
                }`} title={`Confidence: ${(ioc.confidence * 100).toFixed(0)}%`}></div>
              </div>
            </div>
          ))}
          
          {iocs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShieldExclamationIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No IOCs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentIOCs;
