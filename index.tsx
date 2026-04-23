import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Global Error Logger for Debugging
const GlobalErrorLogger = () => {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.width = '100%';
      errorDiv.style.padding = '20px';
      errorDiv.style.backgroundColor = 'red';
      errorDiv.style.color = 'white';
      errorDiv.style.zIndex = '99999';
      errorDiv.innerHTML = `<h3>Global Error</h3><pre>${event.message}\n${event.filename}:${event.lineno}</pre>`;
      document.body.appendChild(errorDiv);
      console.error("Global Error Caught:", event.error);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.bottom = '0';
      errorDiv.style.left = '0';
      errorDiv.style.width = '100%';
      errorDiv.style.padding = '20px';
      errorDiv.style.backgroundColor = 'orange';
      errorDiv.style.color = 'black';
      errorDiv.style.zIndex = '99999';
      errorDiv.innerHTML = `<h3>Unhandled Promise Rejection</h3><pre>${event.reason}</pre>`;
      document.body.appendChild(errorDiv);
      console.error("Unhandled Rejection:", event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    }
  }, []);
  return null;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <GlobalErrorLogger />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
