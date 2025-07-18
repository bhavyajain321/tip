// File: frontend/src/pages/feeds/FeedDetailsModal.jsx
import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { useAPI } from '../../contexts/APIContext';

const FeedDetailsModal = ({ isOpen, onClose, feed }) => {
  const api = useAPI();

  // Fetch feed updates history
  const { data: updates } = useQuery(
    ['feedUpdates', feed?.id],
    () => api.feeds.getUpdates(feed.id, { limit: 10 }),
    {
      enabled: !!feed?.id && isOpen,
    }
  );

  // Fetch feed stats
  const { data: stats } = useQuery(
    ['feedStats', feed?.id],
    () => api.feeds.getStats(feed.id),
    {
      enabled: !!feed?.id && isOpen,
    }
  );

  if (!feed) return null;

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-success-600 bg-success-100',
      running: 'text-blue-600 bg-blue-100',
      failed: 'text-danger-600 bg-danger-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      Feed Details: {feed.name}
                    </Dialog.Title>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Feed Information */}
                      <div className="space-y-6">
                        <div className="card">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Feed Information</h4>
                            <dl className="space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Reliability:</dt>
                                <dd className="text-sm font-medium text-gray-900">{feed.reliability.toUpperCase()}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Confidence:</dt>
                                <dd className="text-sm font-medium text-gray-900">{(feed.confidence * 100).toFixed(0)}%</dd>
                              </div>
                              {feed.url && (
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">URL:</dt>
                                  <dd className="text-sm font-medium text-gray-900 truncate">{feed.url}</dd>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Update Frequency:</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {feed.update_frequency >= 3600 
                                    ? `${feed.update_frequency / 3600}h` 
                                    : `${feed.update_frequency / 60}m`
                                  }
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="card">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Statistics</h4>
                            <dl className="space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Total IOCs:</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {feed.total_iocs?.toLocaleString() || '0'}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Successful Updates:</dt>
                                <dd className="text-sm font-medium text-gray-900">{feed.successful_updates || 0}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Failed Updates:</dt>
                                <dd className="text-sm font-medium text-gray-900">{feed.failed_updates || 0}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Success Rate:</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {feed.successful_updates || feed.failed_updates 
                                    ? ((feed.successful_updates || 0) / ((feed.successful_updates || 0) + (feed.failed_updates || 0)) * 100).toFixed(1) + '%'
                                    : 'N/A'
                                  }
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Last Update:</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {feed.last_update 
                                    ? formatDistanceToNow(new Date(feed.last_update)) + ' ago'
                                    : 'Never'
                                  }
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>

                      {/* Update History */}
                      <div className="card">
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Updates</h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {updates?.data?.map((update) => (
                              <div key={update.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`badge ${getStatusColor(update.status)}`}>
                                    {update.status}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(update.start_time), 'MMM dd, HH:mm')}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Processed:</span>
                                    <span className="ml-1 font-medium">{update.iocs_processed}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Added:</span>
                                    <span className="ml-1 font-medium">{update.iocs_added}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Updated:</span>
                                    <span className="ml-1 font-medium">{update.iocs_updated}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="ml-1 font-medium">
                                      {update.end_time 
                                        ? Math.round((new Date(update.end_time) - new Date(update.start_time)) / 1000) + 's'
                                        : 'Running...'
                                      }
                                    </span>
                                  </div>
                                </div>
                                {update.error_message && (
                                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    {update.error_message}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {!updates?.data?.length && (
                              <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No update history available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={onClose}
                        className="btn-primary"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FeedDetailsModal;
