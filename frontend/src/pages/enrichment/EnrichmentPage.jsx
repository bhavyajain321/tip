// File: frontend/src/pages/enrichment/EnrichmentPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAPI } from '../../contexts/APIContext';

const EnrichmentPage = () => {
  const [selectedIOC, setSelectedIOC] = useState('');
  const [enrichmentResults, setEnrichmentResults] = useState(null);
  
  const api = useAPI();
  const queryClient = useQueryClient();

  // Fetch enrichment sources
  const { data: sources } = useQuery(
    'enrichmentSources',
    () => api.threatIntel.getEnrichmentSources()
  );

  // Enrich IOC mutation
  const enrichMutation = useMutation(
    (iocId) => api.threatIntel.enrichIOC(iocId),
    {
      onSuccess: (data) => {
        setEnrichmentResults(data);
        queryClient.invalidateQueries(['iocEnrichment', selectedIOC]);
      }
    }
  );

  const handleEnrichIOC = () => {
    if (selectedIOC) {
      enrichMutation.mutate(selectedIOC);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">IOC Enrichment</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enrich indicators with external threat intelligence
        </p>
      </div>

      {/* Enrichment Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input & Sources */}
        <div className="space-y-6">
          {/* IOC Input */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enrich IOC
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IOC Value
                  </label>
                  <input
                    type="text"
                    value={selectedIOC}
                    onChange={(e) => setSelectedIOC(e.target.value)}
                    placeholder="Enter IP, domain, URL, or hash..."
                    className="form-input w-full"
                  />
                </div>
                <button
                  onClick={handleEnrichIOC}
                  disabled={!selectedIOC || enrichMutation.isLoading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {enrichMutation.isLoading ? 'Enriching...' : 'Enrich IOC'}
                </button>
              </div>
            </div>
          </div>

          {/* Enrichment Sources */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enrichment Sources
              </h3>
              <div className="space-y-3">
                {sources?.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {source.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {source.source_type} • {source.total_queries || 0} queries
                      </p>
                    </div>
                    <div className="flex items-center">
                      {source.is_active ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {enrichmentResults ? (
            <EnrichmentResults results={enrichmentResults} />
          ) : (
            <div className="card">
              <div className="p-6 text-center">
                <GlobeAltIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  Enter an IOC and click "Enrich" to see results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const EnrichmentResults = ({ results }) => {
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Enrichment Results
          </h3>
          
          {/* GeoIP Results */}
          {results.enrichment_results?.geoip && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Geographic Information</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Country:</dt>
                    <dd className="font-medium">{results.enrichment_results.geoip.country || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">City:</dt>
                    <dd className="font-medium">{results.enrichment_results.geoip.city || 'Unknown'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* WHOIS Results */}
          {results.enrichment_results?.whois && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">WHOIS Information</h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Registrar:</dt>
                    <dd className="font-medium">{results.enrichment_results.whois.registrar || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Creation Date:</dt>
                    <dd className="font-medium">
                      {results.enrichment_results.whois.creation_date 
                        ? new Date(results.enrichment_results.whois.creation_date).toLocaleDateString()
                        : 'Unknown'
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Reputation Results */}
          {results.enrichment_results?.reputation && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Reputation</h4>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Reputation score: 
                  <span className="font-medium ml-1">
                    {results.enrichment_results.reputation.reputation_score || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrichmentPage;
