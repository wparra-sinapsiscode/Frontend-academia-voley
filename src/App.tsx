import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import AppRouter from './components/layout/AppRouter';

function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </AppProvider>
  );
}

export default App;