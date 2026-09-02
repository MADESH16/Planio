import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
