import { useState } from 'react'
import './App.css'
import { Button } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout';
import GlobalOverview from './Components/GlobalOverview';
import RepositoryDetails from './Components/RepositoryDetails';
import ErrorBoundary from './Components/ErrorBoundary';

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
