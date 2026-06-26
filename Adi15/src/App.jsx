import { useState } from 'react'
import './App.css'
import { Button } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout';
import GlobalOverview from './Components/GlobalOverview';
import RepositoryDetails from './Components/RepositoryDetails';
import ErrorBoundary from './Components/ErrorBoundary';
import Login from './Components/Login';

// 1. Create a "Guard" component
const ProtectedRoute = ({ children }) => {
  // Check if the JWT we saved during login exists
  const isAuthenticated = localStorage.getItem('enboarder_jwt');
  
  if (!isAuthenticated) {
    // If no token, kick them back to the login screen
    return <Navigate to="/login" replace />;
  }
  
  // If they have a token, let them see the dashboard!
  return children;
};


function App() {

  // 1. Create the Global Search State
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
          
          {/* ROUTE 1: Public Login Page (No Navbar or Footer) */}
          <Route path="/login" element={<Login />} />

          {/* ROUTE 2: Protected Dashboard Routes (Wrapped in Layout + Guard) */}
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
  )
}

export default App
