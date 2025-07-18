// File: frontend/src/pages/dashboard/ThreatMap.jsx
import React from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const ThreatMap = () => {
  // Sample threat data by country
  const threatData = [
    { country: 'United States', threats: 156, percentage: 28 },
    { country: 'China', threats: 134, percentage: 24 },
    { country: 'Russia', threats: 98, percentage: 18 },
    { country: 'Brazil', threats: 67, percentage: 12 },
    { country: 'India', threats: 45, percentage: 8 },
    { country: 'Others', threats: 56, percentage: 10 },
  ];

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Threat Origins</h3>
          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {threatData.map((item, index) => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-danger-500' :
                  index === 1 ? 'bg-warning-500' :
                  index === 2 ? 'bg-primary-500' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium text-gray-900">{item.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{item.threats}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-danger-500' :
                      index === 1 ? 'bg-warning-500' :
                      index === 2 ? 'bg-primary-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;
