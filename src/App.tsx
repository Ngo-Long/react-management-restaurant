import RolePage from './pages/admin/role';
import UserPage from "./pages/admin/user";
import LoginPage from "./pages/auth/login";
import ProductPage from './pages/admin/product';
import RegisterPage from "./pages/auth/register";
import DashboardPage from "./pages/admin/dashboard";
import RestaurantPage from './pages/admin/restaurant';
import PermissionPage from './pages/admin/permission';
import DiningTablePage from './pages/admin/dining.table';

import NotFound from "./components/share/not.found";
import LayoutApp from "./components/share/layout.app";
import LayoutAdmin from "./components/admin/layout.admin"
import ProtectedRoute from "./components/share/protected-route.ts";

import { useEffect, useRef } from 'react';
import { fetchAccount } from './redux/slice/accountSlide';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom"
import OrderClient from './components/client/order.client';
import Loading from './components/share/loading';

const LayoutClient = () => {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className='layout-app' ref={rootRef}>
      <Outlet />
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);

  useEffect(() => {
    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      return;
    }
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <OrderClient /> }
      ],
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
          path: "restaurant",
          element:
            <ProtectedRoute>
              <RestaurantPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },
        {
          path: "dining-table",
          element:
            <ProtectedRoute>
              <DiningTablePage />
            </ProtectedRoute>
        },
        {
          path: "product",
          element:
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        }
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