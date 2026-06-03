import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      containerStyle={{ zIndex: 99999 }}
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'DM Sans, sans-serif',
          background: '#0f1117',
          color: '#e8e8e8',
          border: '1px solid #2a2d3a',
          borderRadius: '10px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#6ee7b7', secondary: '#0f1117' } },
        error:   { iconTheme: { primary: '#fca5a5', secondary: '#0f1117' } },
      }}
    />
  </React.StrictMode>,
)
