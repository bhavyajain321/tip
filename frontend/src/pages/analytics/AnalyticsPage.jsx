import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAPI } from '../../contexts/APIContext';

const AnalyticsPage = () => {
  const api = useAPI();

  // Fetch data for analytics
  const { data: iocs } = useQuery('analyticsIOCs', () => api.iocs.getAll({ limit: 1000 }));
  const { data: feeds } = useQuery('analyticsFeeds', api.feeds.getAll);

  // Process data for charts
  const processIOCsByType = () => {
    if (!iocs?.data) return [];
    
    const typeCount = {};
    iocs.data.forEach(ioc => {
      typeCount[ioc.type] = (typeCount[ioc.type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([type, count]) => ({
      type: type.toUpperCase(),
      count
    }));
  };

  const processIOCsBySeverity = () => {
    if (!iocs?.data) return [];
    
    const severityCount = {};
    iocs.data.forEach(ioc => {
      severityCount[ioc.severity] = (severityCount[ioc.severity] || 0) + 1;
    });
    
    return Object.entries(severityCount).map(([severity, count]) => ({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count
    }));
  };

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#f97316'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive threat intelligence analytics and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {iocs?.data?.length?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-500">Total IOCs</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {feeds?.data?.length || '0'}
            </div>
            <p className="text-sm text-gray-500">Active Feeds</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {iocs?.data?.filter(ioc => ioc.severity === 'high' || ioc.severity === 'critical')?.length || '0'}
            </div>
            <p className="text-sm text-gray-500">High Risk IOCs</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {iocs?.data?.filter(ioc => ioc.confidence > 0.8)?.length || '0'}
            </div>
            <p className="text-sm text-gray-500">High Confidence</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IOCs by Type */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">IOCs by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processIOCsByType()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* IOCs by Severity */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">IOCs by Severity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processIOCsBySeverity()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ severity, percent }) => `${severity} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {processIOCsBySeverity().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
