// File: frontend/src/pages/iocs/IOCsPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import IOCsTable from './IOCsTable';
import IOCsFilters from './IOCsFilters';
import AddIOCModal from './AddIOCModal';
import BulkImportModal from './BulkImportModal';
import { useAPI } from '../../contexts/APIContext';
import { PlusIcon, ArrowUpTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const IOCsPage = () => {
  const [filters, setFilters] = useState({
    ioc_type: '',
    severity: '',
    is_active: true,
    confidence_min: 0,
    confidence_max: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedIOCs, setSelectedIOCs] = useState([]);

  const api = useAPI();
  const queryClient = useQueryClient();

  // Fetch IOCs with filters
  const { data: iocs, isLoading, error } = useQuery(
    ['iocs', filters, searchTerm],
    () => {
      if (searchTerm) {
        return api.iocs.search({
          query: searchTerm,
          ...filters,
          limit: 100
        });
      }
      return api.iocs.getAll({ ...filters, limit: 100 });
    },
    {
      keepPreviousData: true,
    }
  );

  // Delete IOC mutation
  const deleteIOCMutation = useMutation(
    (iocId) => api.iocs.delete(iocId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('iocs');
        toast.success('IOC deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete IOC: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation(
    async (iocIds) => {
      const promises = iocIds.map(id => api.iocs.delete(id));
      return Promise.all(promises);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('iocs');
        setSelectedIOCs([]);
        toast.success(`Deleted ${selectedIOCs.length} IOCs successfully`);
      },
      onError: (error) => {
        toast.error('Failed to delete some IOCs');
      },
    }
  );

  const handleDeleteIOC = (iocId) => {
    if (window.confirm('Are you sure you want to delete this IOC?')) {
      deleteIOCMutation.mutate(iocId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIOCs.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIOCs.length} IOCs?`)) {
      bulkDeleteMutation.mutate(selectedIOCs);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled automatically by useQuery dependency
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Indicators of Compromise
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and analyze threat indicators across your infrastructure
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="btn-secondary flex items-center"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Bulk Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add IOC
          </button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search IOCs by value, type, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
        </form>

        {/* Bulk Actions */}
        {selectedIOCs.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedIOCs.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="btn-danger text-sm"
              disabled={bulkDeleteMutation.isLoading}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <IOCsFilters filters={filters} onFiltersChange={setFilters} />

      {/* IOCs Table */}
      <div className="card">
        {error ? (
          <div className="p-6 text-center text-red-600">
            <p>Failed to load IOCs: {error.message}</p>
          </div>
        ) : (
          <IOCsTable
            iocs={iocs?.data || []}
            loading={isLoading}
            selectedIOCs={selectedIOCs}
            onSelectionChange={setSelectedIOCs}
            onDeleteIOC={handleDeleteIOC}
          />
        )}
      </div>

      {/* Modals */}
      <AddIOCModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          queryClient.invalidateQueries('iocs');
        }}
      />

      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          setShowBulkModal(false);
          queryClient.invalidateQueries('iocs');
        }}
      />
    </motion.div>
  );
};

export default IOCsPage;
