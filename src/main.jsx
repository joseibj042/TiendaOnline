import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SessionProvider } from './context/SessionContext';

// 👇 ¡ESTA ES LA LÍNEA QUE FALTABA! 👇
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SessionProvider>
      <App />
    </SessionProvider>
  </BrowserRouter>
);