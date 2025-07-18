// File: frontend/src/pages/iocs/AddIOCModal.jsx
import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAPI } from '../../contexts/APIContext';

const AddIOCModal = ({ isOpen, onClose, onSuccess }) => {
  const api = useAPI();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      type: 'ip',
      severity: 'medium',
      tlp: 'white',
      confidence: 0.5,
    }
  });

  const createIOCMutation = useMutation(
    (data) => api.iocs.create(data),
    {
      onSuccess: () => {
        toast.success('IOC created successfully');
        reset();
        onSuccess();
      },
      onError: (error) => {
        toast.error(`Failed to create IOC: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  const onSubmit = (data) => {
    createIOCMutation.mutate({
      ...data,
      confidence: parseFloat(data.confidence),
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
                      Add New IOC
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* IOC Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IOC Type *
                        </label>
                        <select
                          {...register('type', { required: 'IOC type is required' })}
                          className="form-select w-full"
                        >
                          <option value="ip">IP Address</option>
                          <option value="domain">Domain</option>
                          <option value="url">URL</option>
                          <option value="hash">Hash</option>
                          <option value="email">Email</option>
                        </select>
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                        )}
                      </div>

                      {/* IOC Value */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IOC Value *
                        </label>
                        <input
                          type="text"
                          {...register('value', { required: 'IOC value is required' })}
                          className="form-input w-full"
                          placeholder="Enter IOC value..."
                        />
                        {errors.value && (
                          <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
                        )}
                      </div>

                      {/* Severity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Severity
                        </label>
                        <select
                          {...register('severity')}
                          className="form-select w-full"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      {/* Confidence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confidence ({register('confidence').value || 0.5})
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

                      {/* TLP */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Traffic Light Protocol
                        </label>
                        <select
                          {...register('tlp')}
                          className="form-select w-full"
                        >
                          <option value="white">TLP:WHITE</option>
                          <option value="green">TLP:GREEN</option>
                          <option value="amber">TLP:AMBER</option>
                          <option value="red">TLP:RED</option>
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
                          disabled={createIOCMutation.isLoading}
                          className="btn-primary w-full sm:w-auto"
                        >
                          {createIOCMutation.isLoading ? 'Creating...' : 'Create IOC'}
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

export default AddIOCModal;
