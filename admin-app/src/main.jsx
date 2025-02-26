import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Find the app container in the WordPress admin
const container = document.getElementById('wp-schedule-manager-admin-app');

if (container) {
  // Get the page from the data attribute if available
  const page = container.dataset.page || 'dashboard';

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <BrowserRouter>
        <App initialPage={page} />
      </BrowserRouter>
    </React.StrictMode>
  );
}
