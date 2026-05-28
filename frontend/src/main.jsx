// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CustomThemeProvider } from './theme';  // اضافه کنید
import './themes.css';  // اضافه کنید
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomThemeProvider>     {/* 🔑 اینجا بسیار مهم است */}
      <App />
    </CustomThemeProvider>
  </React.StrictMode>
);