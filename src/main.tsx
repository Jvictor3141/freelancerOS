// i18n must be the very first import so the instance is ready before any component renders
import './i18n/config';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { FeedbackProvider } from './components/FeedbackProvider';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
