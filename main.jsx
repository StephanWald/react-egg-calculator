import React from 'react';
import ReactDOM from 'react-dom/client';
import EggCalculator from './egg-calculator.jsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <EggCalculator />
    </ErrorBoundary>
  </React.StrictMode>
);
