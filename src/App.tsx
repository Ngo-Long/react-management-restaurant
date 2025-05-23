import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import ShiftPage from './pages/admin/shift';
import OrderPage from './pages/admin/order';
import ReviewPage from './pages/admin/review';
import ClientPage from './pages/admin/client';
import ProductPage from './pages/admin/product';
import ReceiptPage from './pages/admin/receipt';
import InvoicePage from './pages/admin/invoice';
import FeedbackPage from './pages/admin/feedback';
import SupplierPage from './pages/admin/supplier';
import DashboardPage from './pages/admin/dashboard';
import IngredientPage from './pages/admin/ingredient';
import RestaurantPage from './pages/admin/restaurant';
import PermissionPage from './pages/admin/permission';
import DiningTablePage from './pages/admin/dining-table';
import ViewUpsertProduct from './pages/admin/product/container';
import { ViewUpsertReceipt } from './pages/admin/receipt/container';

import HomePage from './pages/client/home';
import SaleClient from './pages/client/sales';
import KitchenClient from './pages/client/kitchen';
import ReceptionClient from './pages/client/reception';

import NotFound from './components/share/not.found';
import LayoutApp from './components/share/layout.app';
import LayoutAdmin from './components/admin/layout.admin';
import ProtectedRoute from './components/share/protected-route';

import './styles/reset.scss';
import viVN from 'antd/locale/vi_VN';
import { ConfigProvider } from 'antd';
import { useEffect, useRef } from 'react';
// import Loading from './components/share/loading';
import { fetchAccount } from './redux/slice/accountSlide';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";

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
  // const { isAuthenticated, isLoading } = useAppSelector(state => state.account);

  useEffect(() => {
    if (window.location.pathname === '/') {
      return;
    }

    dispatch(fetchAccount());
  }, [dispatch])

  const router = createBrowserRouter([
    {
      path: "/",
      element:
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <HomePage />
        },
        {
          path: "/sales",
          element:
            <ProtectedRoute>
              <SaleClient />
            </ProtectedRoute>
        },
        {
          path: "/sales/kitchen",
          element:
            <ProtectedRoute>
              <KitchenClient />
            </ProtectedRoute>
        },
        {
          path: "/sales/reception",
          element:
            <ProtectedRoute>
              <ReceptionClient />
            </ProtectedRoute>
        }
      ],
    },

    {
      path: "/admin",
      element:
        <LayoutApp>
          <LayoutAdmin />
        </LayoutApp>,
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
          path: "client",
          element:
            <ProtectedRoute>
              <ClientPage />
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
          children: [
            {
              index: true,
              element:
                <ProtectedRoute>
                  <ProductPage />
                </ProtectedRoute>
            },
            {
              path: "upsert",
              element:
                <ProtectedRoute>
                  <ViewUpsertProduct />
                </ProtectedRoute>
            }
          ]
        },
        {
          path: "ingredient",
          element:
            <ProtectedRoute>
              <IngredientPage />
            </ProtectedRoute>
        },
        {
          path: "order",
          element:
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
        },
        {
          path: "invoice",
          element: <ProtectedRoute> <InvoicePage /> </ProtectedRoute>
        },
        {
          path: "review",
          element: <ProtectedRoute> <ReviewPage /> </ProtectedRoute>
        },
        {
          path: "feedback",
          element: <ProtectedRoute> <FeedbackPage /> </ProtectedRoute>
        },
        {
          path: "shift",
          element: <ProtectedRoute> <ShiftPage /> </ProtectedRoute>
        },
        {
          path: "receipt",
          children: [
            {
              index: true,
              element: <ProtectedRoute> <ReceiptPage /> </ProtectedRoute>
            },
            {
              path: "upsert",
              element: <ProtectedRoute> <ViewUpsertReceipt /></ProtectedRoute>
            }
          ]
        },
        {
          path: "supplier",
          element: <ProtectedRoute> <SupplierPage /> </ProtectedRoute>
        },
        {
          path: "role",
          element: <ProtectedRoute> <RolePage /> </ProtectedRoute>
        },
        {
          path: "permission",
          element: <ProtectedRoute> <PermissionPage /> </ProtectedRoute>
        }
      ]
    }
  ]);

  return (
    <ConfigProvider locale={viVN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}