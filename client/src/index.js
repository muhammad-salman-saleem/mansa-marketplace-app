import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { SnackbarProvider } from 'notistack';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <SnackbarProvider
          maxSnack={2}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Router>
            <App />
          </Router>
        </SnackbarProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
  ,
  document.getElementById('root')
);