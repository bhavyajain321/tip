// File: frontend/src/pages/dashboard/FeedStatus.jsx
import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { RssIcon } from '@heroicons/react/24/outline';


const FeedStatus = ({ feeds = [] }) => {
  const getStatusIcon = (isActive, lastUpdate) => {
    if (!isActive) {
      return <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
    
    if (lastUpdate) {
      const lastUpdateDate = new Date(lastUpdate);
      const hoursSinceUpdate = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 2) {
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      } else if (hoursSinceUpdate < 24) {
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      }
    }
    
    return <ExclamationCircleIcon className="h-5 w-5 text-danger-500" />;
  };

  const getStatusText = (isActive, lastUpdate) => {
    if (!isActive) return 'Inactive';
    
    if (lastUpdate) {
      const lastUpdateDate = new Date(lastUpdate);
      const hoursSinceUpdate = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 2) return 'Online';
      if (hoursSinceUpdate < 24) return 'Warning';
    }
    
    return 'Error';
  };

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Feed Status</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {feeds.slice(0, 5).map((feed) => (
            <div key={feed.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(feed.is_active, feed.last_update)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{feed.name}</p>
                  <p className="text-xs text-gray-500">
                    {feed.last_update 
                      ? `Updated ${formatDistanceToNow(new Date(feed.last_update))} ago`
                      : 'Never updated'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${
                  getStatusText(feed.is_active, feed.last_update) === 'Online' ? 'text-success-600' :
                  getStatusText(feed.is_active, feed.last_update) === 'Warning' ? 'text-warning-600' :
                  getStatusText(feed.is_active, feed.last_update) === 'Error' ? 'text-danger-600' :
                  'text-gray-600'
                }`}>
                  {getStatusText(feed.is_active, feed.last_update)}
                </p>
                <p className="text-xs text-gray-500">
                  {feed.total_iocs || 0} IOCs
                </p>
              </div>
            </div>
          ))}
          
          {feeds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <RssIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No feeds configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedStatus;
