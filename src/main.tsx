import App from './App'
import React from 'react'
import './styles/reset.scss';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
