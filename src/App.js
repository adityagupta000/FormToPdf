import React from 'react';
import { FormConfigProvider } from './contexts/FormConfigContext';
import AppContent from './AppContent';
import Toasts from './components/common/Toasts';

function App() {
  return (
    <FormConfigProvider>
      <AppContent />
      <Toasts />
    </FormConfigProvider>
  );
}

export default App;
