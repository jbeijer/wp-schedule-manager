import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Find the app container in the WordPress admin
const container = document.getElementById('wp-schedule-manager-admin-app');

if (container) {
  // Get the page from the data attribute if available
  const page = container.dataset.page || 'dashboard';

  // Log for debugging
  console.log('WP Schedule Manager: Initializing app with page:', page);

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <HashRouter>
        <App initialPage={page} />
      </HashRouter>
    </React.StrictMode>
  );
}
