import { useState, useEffect } from 'react'
import './App.css'
import { Button, Spin } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout';
import GlobalOverview from './Components/GlobalOverview';
import RepositoryDetails from './Components/RepositoryDetails';
import ErrorBoundary from './Components/ErrorBoundary';
import Login from './Components/Login';

// The Upgraded Route Guard (Option B: API Verification)
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('https://ec2-13-127-42-153.ap-south-1.compute.amazonaws.com/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" tip="Verifying secure session..." />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {

  // 1. Create the Global Search State
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout setGlobalSearch={setGlobalSearch}>
                  <Routes>
                    <Route path="/" element={<GlobalOverview globalSearch={globalSearch} />} />
                    <Route path="/repository/:id" element={<RepositoryDetails />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App
