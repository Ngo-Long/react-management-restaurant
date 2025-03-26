import {
  Action,
  ThunkAction,
  configureStore
} from '@reduxjs/toolkit';
import roleReducer from './slice/roleSlide';
import userReducer from './slice/userSlide';
import orderReducer from './slice/orderSlide';
import receiptReducer from './slice/receiptSlide';
import invoiceReducer from './slice/invoiceSlide';
import accountReducer from './slice/accountSlide';
import productReducer from './slice/productSlide';
import supplierReducer from './slice/supplierSlide';
import restaurantReducer from './slice/restaurantSlide';
import permissionReducer from './slice/permissionSlide';
import ingredientReducer from './slice/ingredientSlide';
import orderDetailReducer from './slice/orderDetailSlide';
import diningTableReducer from './slice/diningTableSlide';
import reviewReducer from './slice/reviewSlide';

// Configure the Redux store with various slice reducers
export const store = configureStore({
  reducer: {
    role: roleReducer,
    user: userReducer,
    order: orderReducer,
    account: accountReducer,
    invoice: invoiceReducer,
    product: productReducer,
    receipt: receiptReducer,
    supplier: supplierReducer,
    ingredient: ingredientReducer,
    permission: permissionReducer,
    restaurant: restaurantReducer,
    diningTable: diningTableReducer,
    orderDetail: orderDetailReducer,
    review: reviewReducer,
  },
});

// AppDispatch type defines the dispatch function for actions in the store
export type AppDispatch = typeof store.dispatch;

// RootState type defines the entire state of the Redux store, used for accessing the app state
export type RootState = ReturnType<typeof store.getState>;

// AppThunk type defines the structure for asynchronous actions (thunks)
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;