import { useEffect, useRef, useState } from 'react';
import { createBrowserRouter, Link, Outlet, RouterProvider, useLocation, useNavigate } from "react-router-dom"
import LayoutAdmin from "./components/admin/layout.admin"
import NotFound from "./components/share/not.found";
import DashboardPage from "./pages/admin/dashboard";
import UserPage from "./pages/admin/user";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import LayoutApp from "./components/share/layout.app";
import ProtectedRoute from "./components/share/protected-route.ts";
import { Header } from 'antd/es/layout/layout';
import { Dropdown, message, Space, theme } from 'antd';
import { authApi } from './config/api';
import styles from './styles/app.module.scss';
import { useAppDispatch } from './redux/hooks.ts';
import { setLogoutAction } from './redux/slice/accountSlide';

const LayoutClient = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const rootRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const { token: { colorBgContainer } } = theme.useToken();

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleLogout = async () => {
    const res = await authApi.callLogout();
    if (res && +res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      message.success('Đăng xuất thành công');
      navigate('/login')
    }
  }

  const itemsDropdown = [
    {
      label: <Link to={'/'}>Trang chủ</Link>,
      key: 'home',
    },
    {
      label: <label
        style={{ cursor: 'pointer' }}
        onClick={() => handleLogout()}
      >Đăng xuất</label>,
      key: 'logout',
    },
  ];

  return (
    <div className='layout-app' ref={rootRef}>
      <Header style={{ padding: 0, background: colorBgContainer, position: "relative", boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}>
        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
          <Space style={{ cursor: "pointer", position: "absolute", right: "18px" }}>
            Welcome Kim Long
          </Space>
        </Dropdown>
      </Header>

      {/* <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div> */}

    </div>
  )
}

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      // children: [
      //   { index: true, element: <HomePage /> },

      //   { path: "job", element: <ClientJobPage /> },
      //   { path: "job/:id", element: <ClientJobDetailPage /> },

      //   { path: "company", element: <ClientCompanyPage /> },
      //   { path: "company/:id", element: <ClientCompanyDetailPage /> },

      //   { path: "news", element: <ClientNewsPage /> },
      //   { path: "news/:id", element: <ClientNewsDetailPage /> }
      // ],
    },
    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },
      ]
    },
    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
