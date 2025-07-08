import React from 'react';
import { FormConfigProvider } from './contexts/FormConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppContent from './AppContent';
import Toasts from './components/common/Toasts';

function App() {
  return (
    <ThemeProvider>
      <FormConfigProvider>
        <AppContent />
        <Toasts />
      </FormConfigProvider>
    </ThemeProvider>
  );
}

export default App;
