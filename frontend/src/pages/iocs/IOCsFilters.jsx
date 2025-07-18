// File: frontend/src/pages/iocs/IOCsFilters.jsx
import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const IOCsFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      ioc_type: '',
      severity: '',
      is_active: true,
      confidence_min: 0,
      confidence_max: 1,
    });
  };

  return (
    <div className="card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* IOC Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              IOC Type
            </label>
            <select
              value={filters.ioc_type}
              onChange={(e) => handleFilterChange('ioc_type', e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Types</option>
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="url">URL</option>
              <option value="hash">Hash</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange('is_active', e.target.value === 'true')}
              className="form-select text-sm"
            >
              <option value={true}>Active Only</option>
              <option value={false}>Inactive Only</option>
              <option value="">All Status</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Confidence
            </label>
            <select
              value={filters.confidence_min}
              onChange={(e) => handleFilterChange('confidence_min', parseFloat(e.target.value))}
              className="form-select text-sm"
            >
              <option value={0}>Any Confidence</option>
              <option value={0.5}>≥ 50%</option>
              <option value={0.7}>≥ 70%</option>
              <option value={0.8}>≥ 80%</option>
              <option value={0.9}>≥ 90%</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOCsFilters;
