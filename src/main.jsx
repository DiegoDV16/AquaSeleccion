import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import { FUTURO_ROUTER } from './routes/futuroRouter.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={FUTURO_ROUTER}>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);