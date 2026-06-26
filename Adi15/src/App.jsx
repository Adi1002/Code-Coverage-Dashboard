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
      {/* 2. The Layout Shell wraps ALL routes */}
      <DashboardLayout setGlobalSearch={setGlobalSearch}>

        {/* 3. The Router swaps the pages right in the {children} spot! */}
        <Routes>
          {/* Route 1: The Home Page (Your Dashboard) */}
          <Route path="/" element={<GlobalOverview globalSearch={globalSearch} />} />

          {/* Route 2: The Details Page */}
          <Route path="/repository/:id" element={<RepositoryDetails />} />
        </Routes>

      </DashboardLayout>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
