import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Get the container element
const container = document.getElementById('wp-schedule-manager-public-app');

// Get the initial page from the data-page attribute
const initialPage = container?.dataset?.page || 'dashboard';

// Create a root
const root = ReactDOM.createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App initialPage={initialPage} />
    </BrowserRouter>
  </React.StrictMode>
);
