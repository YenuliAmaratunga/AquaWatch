import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import './src/utils/errorSuppression'; // Suppress annoying console warnings
import './src/utils/globalErrorHandler'; // Global error handling
import "./global.css"

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
