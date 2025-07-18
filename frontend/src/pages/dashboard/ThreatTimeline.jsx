// File: frontend/src/pages/dashboard/ThreatTimeline.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ThreatTimeline = () => {
  // Sample data - replace with real data from API
  const data = [
    { date: '2024-01-01', threats: 24, high: 5, medium: 12, low: 7 },
    { date: '2024-01-02', threats: 31, high: 8, medium: 15, low: 8 },
    { date: '2024-01-03', threats: 18, high: 3, medium: 9, low: 6 },
    { date: '2024-01-04', threats: 45, high: 12, medium: 20, low: 13 },
    { date: '2024-01-05', threats: 38, high: 9, medium: 18, low: 11 },
    { date: '2024-01-06', threats: 22, high: 4, medium: 11, low: 7 },
    { date: '2024-01-07', threats: 29, high: 7, medium: 14, low: 8 },
  ];

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Threat Timeline</h3>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-danger-500 rounded-full mr-2"></div>
              <span className="text-gray-600">High</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-warning-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Low</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="medium" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ThreatTimeline;

