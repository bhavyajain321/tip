// File: frontend/src/pages/threat-families/ThreatFamiliesPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ShieldExclamationIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAPI } from '../../contexts/APIContext';

const ThreatFamiliesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  
  const api = useAPI();
  const queryClient = useQueryClient();

  // Fetch threat families
  const { data: families, isLoading } = useQuery(
    ['threatFamilies', searchTerm],
    () => api.threatIntel.getThreatFamilies({ search: searchTerm }),
    { keepPreviousData: true }
  );

  const handleViewDetails = (family) => {
    setSelectedFamily(family);
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
          <h1 className="text-2xl font-bold text-gray-900">Threat Families</h1>
          <p className="mt-1 text-sm text-gray-500">
            Malware families and threat classifications
          </p>
        </div>
        <button className="btn-primary flex items-center mt-4 sm:mt-0">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Family
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search threat families..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pl-10 w-full"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {families?.length || 0}
            </div>
            <p className="text-sm text-gray-500">Total Families</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {families?.filter(f => f.family_type === 'malware')?.length || 0}
            </div>
            <p className="text-sm text-gray-500">Malware Families</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {families?.filter(f => f.mitre_id)?.length || 0}
            </div>
            <p className="text-sm text-gray-500">MITRE Mapped</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {families?.reduce((sum, f) => sum + (f.ioc_count || 0), 0) || 0}
            </div>
            <p className="text-sm text-gray-500">Total IOCs</p>
          </div>
        </div>
      </div>

      {/* Families Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {families?.map((family, index) => (
          <motion.div
            key={family.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewDetails(family)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {family.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge badge-primary">
                      {family.family_type || 'Unknown'}
                    </span>
                    {family.category && (
                      <span className="badge badge-gray">
                        {family.category}
                      </span>
                    )}
                    {family.mitre_id && (
                      <span className="badge badge-warning">
                        {family.mitre_id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {family.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{family.ioc_count || 0} IOCs</span>
                    <span>
                      {family.last_seen 
                        ? new Date(family.last_seen).toLocaleDateString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {families?.length === 0 && (
        <div className="text-center py-12">
          <ShieldExclamationIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No threat families found</p>
          <p className="text-sm text-gray-400">Add some threat feeds to populate data</p>
        </div>
      )}

      {/* Family Details Modal */}
      {selectedFamily && (
        <ThreatFamilyModal
          family={selectedFamily}
          onClose={() => setSelectedFamily(null)}
        />
      )}
    </motion.div>
  );
};

const ThreatFamilyModal = ({ family, onClose }) => {
  const api = useAPI();
  
  const { data: familyIOCs } = useQuery(
    ['familyIOCs', family.id],
    () => api.threatIntel.getFamilyIOCs(family.id),
    { enabled: !!family?.id }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
        >
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                {family.name}
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Family Information */}
                <div className="space-y-4">
                  <div className="card">
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Family Details</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Type:</dt>
                          <dd className="font-medium">{family.family_type || 'Unknown'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Category:</dt>
                          <dd className="font-medium">{family.category || 'Unknown'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Platform:</dt>
                          <dd className="font-medium">{family.platform || 'Unknown'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">MITRE ID:</dt>
                          <dd className="font-medium">{family.mitre_id || 'None'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {family.description && (
                    <div className="card">
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{family.description}</p>
                      </div>
                    </div>
                  )}

                  {family.aliases && family.aliases.length > 0 && (
                    <div className="card">
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Aliases</h4>
                        <div className="flex flex-wrap gap-2">
                          {family.aliases.map((alias, index) => (
                            <span key={index} className="badge badge-gray">
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* IOCs */}
                <div>
                  <div className="card">
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Associated IOCs ({familyIOCs?.length || 0})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {familyIOCs?.slice(0, 10).map((ioc) => (
                          <div key={ioc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {ioc.value}
                              </p>
                              <p className="text-xs text-gray-500">
                                {ioc.type} • {ioc.severity}
                              </p>
                            </div>
                            <span className={`badge ${
                              ioc.confidence > 0.8 ? 'badge-success' :
                              ioc.confidence > 0.5 ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {(ioc.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                        {familyIOCs?.length > 10 && (
                          <p className="text-xs text-gray-500 text-center">
                            ... and {familyIOCs.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThreatFamiliesPage;
