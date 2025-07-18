// File: frontend/src/pages/feeds/AddFeedModal.jsx
import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAPI } from '../../contexts/APIContext';

const AddFeedModal = ({ isOpen, onClose, onSuccess }) => {
  const api = useAPI();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      type: 'json',
      reliability: 'unknown',
      confidence: 0.5,
      update_frequency: 3600,
    }
  });

  const feedType = watch('type');

  const createFeedMutation = useMutation(
    (data) => api.feeds.create(data),
    {
      onSuccess: () => {
        toast.success('Feed created successfully');
        reset();
        onSuccess();
      },
      onError: (error) => {
        toast.error(`Failed to create feed: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  const onSubmit = (data) => {
    createFeedMutation.mutate({
      ...data,
      confidence: parseFloat(data.confidence),
      update_frequency: parseInt(data.update_frequency),
    });
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Add New Threat Feed
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Feed Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feed Name *
                        </label>
                        <input
                          type="text"
                          {...register('name', { required: 'Feed name is required' })}
                          className="form-input w-full"
                          placeholder="Enter feed name..."
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Feed Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feed Type *
                        </label>
                        <select
                          {...register('type', { required: 'Feed type is required' })}
                          className="form-select w-full"
                        >
                          <option value="json">JSON Feed</option>
                          <option value="csv">CSV Feed</option>
                          <option value="xml">XML Feed</option>
                          <option value="otx">AlienVault OTX</option>
                          <option value="misp">MISP</option>
                          <option value="custom">Custom</option>
                        </select>
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                        )}
                      </div>

                      {/* Feed URL */}
                      {feedType !== 'custom' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feed URL {feedType === 'otx' ? '' : '*'}
                          </label>
                          <input
                            type="url"
                            {...register('url', { 
                              required: feedType !== 'otx' ? 'Feed URL is required' : false 
                            })}
                            className="form-input w-full"
                            placeholder={
                              feedType === 'otx' 
                                ? 'Optional: Custom OTX URL' 
                                : 'https://example.com/threat-feed.json'
                            }
                          />
                          {errors.url && (
                            <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                          )}
                        </div>
                      )}

                      {/* API Key */}
                      {(feedType === 'otx' || feedType === 'misp') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key *
                          </label>
                          <input
                            type="password"
                            {...register('api_key', { required: 'API key is required' })}
                            className="form-input w-full"
                            placeholder="Enter API key..."
                          />
                          {errors.api_key && (
                            <p className="mt-1 text-sm text-red-600">{errors.api_key.message}</p>
                          )}
                        </div>
                      )}

                      {/* Reliability */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Source Reliability
                        </label>
                        <select
                          {...register('reliability')}
                          className="form-select w-full"
                        >
                          <option value="unknown">Unknown</option>
                          <option value="a">A - Completely reliable</option>
                          <option value="b">B - Usually reliable</option>
                          <option value="c">C - Fairly reliable</option>
                          <option value="d">D - Not usually reliable</option>
                          <option value="e">E - Unreliable</option>
                          <option value="f">F - Reliability cannot be judged</option>
                        </select>
                      </div>

                      {/* Confidence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confidence Level ({(watch('confidence') * 100).toFixed(0)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          {...register('confidence')}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Update Frequency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Update Frequency
                        </label>
                        <select
                          {...register('update_frequency')}
                          className="form-select w-full"
                        >
                          <option value={1800}>Every 30 minutes</option>
                          <option value={3600}>Every hour</option>
                          <option value={7200}>Every 2 hours</option>
                          <option value={14400}>Every 4 hours</option>
                          <option value={21600}>Every 6 hours</option>
                          <option value={43200}>Every 12 hours</option>
                          <option value={86400}>Daily</option>
                        </select>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createFeedMutation.isLoading}
                          className="btn-primary w-full sm:w-auto"
                        >
                          {createFeedMutation.isLoading ? 'Creating...' : 'Create Feed'}
                        </button>
                      </div>
                    </form>
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

export default AddFeedModal;
