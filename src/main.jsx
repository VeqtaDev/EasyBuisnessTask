import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import './utils/initDB.js'

// Vérifier que le root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="color: white; padding: 20px;">Error: Root element not found</div>';
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="color: white; padding: 20px; background: #000;">
        <h1>Erreur de rendu</h1>
        <pre>${error.toString()}</pre>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
}

