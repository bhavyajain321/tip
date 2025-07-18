// File: frontend/src/pages/iocs/BulkImportModal.jsx
import React, { useState } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAPI } from '../../contexts/APIContext';

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('json');
  const api = useAPI();

  const bulkImportMutation = useMutation(
    (data) => api.iocs.bulkCreate(data),
    {
      onSuccess: (response) => {
        toast.success(`Successfully imported ${response.data.created} IOCs`);
        if (response.data.errors.length > 0) {
          toast.warning(`${response.data.errors.length} errors occurred during import`);
        }
        setImportData('');
        onSuccess();
      },
      onError: (error) => {
        toast.error(`Failed to import IOCs: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseImportData = () => {
    try {
      if (importFormat === 'json') {
        return JSON.parse(importData);
      } else if (importFormat === 'csv') {
        // Simple CSV parsing
        const lines = importData.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const ioc = {};
          headers.forEach((header, index) => {
            if (values[index]) {
              ioc[header] = values[index];
            }
          });
          return ioc;
        });
      } else if (importFormat === 'plain') {
        // Plain text format - one IOC per line
        return importData.split('\n')
          .filter(line => line.trim())
          .map(line => ({
            type: 'ip', // Default type
            value: line.trim(),
            severity: 'medium',
            confidence: 0.5
          }));
      }
    } catch (error) {
      toast.error('Failed to parse import data');
      return [];
    }
  };

  const handleImport = () => {
    const parsedData = parseImportData();
    if (parsedData.length === 0) {
      toast.error('No valid data to import');
      return;
    }
    
    bulkImportMutation.mutate(parsedData);
  };

  const sampleFormats = {
    json: JSON.stringify([
      {
        type: "ip",
        value: "192.168.1.100",
        severity: "high",
        confidence: 0.8,
        tlp: "white"
      },
      {
        type: "domain",
        value: "malicious.example.com",
        severity: "critical",
        confidence: 0.9,
        tlp: "amber"
      }
    ], null, 2),
    csv: `type,value,severity,confidence,tlp
ip,192.168.1.100,high,0.8,white
domain,malicious.example.com,critical,0.9,amber`,
    plain: `192.168.1.100
malicious.example.com
bad-actor.net`
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
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
                      Bulk Import IOCs
                    </Dialog.Title>
                    
                    {/* Format Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Import Format
                      </label>
                      <div className="flex space-x-4">
                        {['json', 'csv', 'plain'].map((format) => (
                          <label key={format} className="flex items-center">
                            <input
                              type="radio"
                              value={format}
                              checked={importFormat === format}
                              onChange={(e) => setImportFormat(e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload File (Optional)
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <DocumentArrowUpIcon className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">JSON, CSV, or TXT files</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            accept=".json,.csv,.txt"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Data Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Import Data
                      </label>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        rows={10}
                        className="form-input w-full font-mono text-sm"
                        placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                      />
                    </div>

                    {/* Sample Format */}
                    <div className="mb-6">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 mb-2">
                          Sample {importFormat.toUpperCase()} Format
                          <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {sampleFormats[importFormat]}
                        </pre>
                      </details>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleImport}
                        disabled={bulkImportMutation.isLoading || !importData.trim()}
                        className="btn-primary w-full sm:w-auto"
                      >
                        {bulkImportMutation.isLoading ? 'Importing...' : 'Import IOCs'}
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

export default BulkImportModal;
