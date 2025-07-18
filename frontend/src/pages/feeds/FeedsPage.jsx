// File: frontend/src/pages/feeds/FeedsPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { PlusIcon, PlayIcon, StopIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import FeedsTable from './FeedsTable';
import AddFeedModal from './AddFeedModal';
import FeedDetailsModal from './FeedDetailsModal';
import { useAPI } from '../../contexts/APIContext';

const FeedsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const api = useAPI();
  const queryClient = useQueryClient();

  // Fetch feeds
  const { data: feeds, isLoading, error } = useQuery('feeds', api.feeds.getAll);

  // Delete feed mutation
  const deleteFeedMutation = useMutation(
    (feedId) => api.feeds.delete(feedId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feeds');
        toast.success('Feed deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete feed: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  // Trigger feed update mutation
  const triggerUpdateMutation = useMutation(
    (feedId) => api.feeds.triggerUpdate(feedId),
    {
      onSuccess: () => {
        toast.success('Feed update triggered successfully');
        queryClient.invalidateQueries('feeds');
      },
      onError: (error) => {
        toast.error(`Failed to trigger update: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  // Toggle feed status mutation
  const toggleFeedMutation = useMutation(
    ({ feedId, isActive }) => api.feeds.update(feedId, { is_active: !isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feeds');
        toast.success('Feed status updated');
      },
      onError: (error) => {
        toast.error(`Failed to update feed: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  const handleDeleteFeed = (feedId) => {
    if (window.confirm('Are you sure you want to delete this feed?')) {
      deleteFeedMutation.mutate(feedId);
    }
  };

  const handleTriggerUpdate = (feedId) => {
    triggerUpdateMutation.mutate(feedId);
  };

  const handleToggleFeed = (feed) => {
    toggleFeedMutation.mutate({ feedId: feed.id, isActive: feed.is_active });
  };

  const handleViewDetails = (feed) => {
    setSelectedFeed(feed);
    setShowDetailsModal(true);
  };

  // Calculate stats
  const stats = {
    total: feeds?.data?.length || 0,
    active: feeds?.data?.filter(f => f.is_active)?.length || 0,
    inactive: feeds?.data?.filter(f => !f.is_active)?.length || 0,
    totalIOCs: feeds?.data?.reduce((sum, f) => sum + (f.total_iocs || 0), 0) || 0,
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
            Threat Intelligence Feeds
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage external threat intelligence sources and data feeds
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Feed
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-primary-500">
                  <Cog6ToothIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Feeds</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-success-500">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Feeds</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-gray-500">
                  <StopIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive Feeds</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-warning-500">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total IOCs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalIOCs.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feeds Table */}
      <div className="card">
        {error ? (
          <div className="p-6 text-center text-red-600">
            <p>Failed to load feeds: {error.message}</p>
          </div>
        ) : (
          <FeedsTable
            feeds={feeds?.data || []}
            loading={isLoading}
            onDeleteFeed={handleDeleteFeed}
            onTriggerUpdate={handleTriggerUpdate}
            onToggleFeed={handleToggleFeed}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Modals */}
      <AddFeedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          queryClient.invalidateQueries('feeds');
        }}
      />

      <FeedDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        feed={selectedFeed}
      />
    </motion.div>
  );
};

export default FeedsPage;
