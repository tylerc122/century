import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
// Import Tauri store plugin
import { Store } from '@tauri-apps/plugin-store';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    // Create React root and render App component
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(React.StrictMode, null, 
        React.createElement(App, null)
      )
    );
  } else {
    console.error('Root element not found');
  }
});