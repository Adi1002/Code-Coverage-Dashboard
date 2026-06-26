import { StrictMode } from 'react'
import { createRoot, BrowserRouter } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_GOES_HERE">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
)
