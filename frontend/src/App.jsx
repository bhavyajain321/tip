// File: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import IOCsPage from './pages/iocs/IOCsPage';
import FeedsPage from './pages/feeds/FeedsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import { APIProvider } from './contexts/APIContext';
import ThreatTimeline from './pages/dashboard/ThreatTimeline';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <APIProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/iocs" element={<IOCsPage />} />
                <Route path="/feeds" element={<FeedsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4ade80',
                  },
                },
                error: {
                  duration: 5000,
                  theme: {
                    primary: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </APIProvider>
    </QueryClientProvider>
  );
}

export default App;
