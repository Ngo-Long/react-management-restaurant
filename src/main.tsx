import App from './App'
import React from 'react'
import './styles/reset.scss';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
dayjs.locale('vi'); 
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={viVN}>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);