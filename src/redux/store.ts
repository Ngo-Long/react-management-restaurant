import {
  Action,
  ThunkAction,
  configureStore
} from '@reduxjs/toolkit';
import roleReducer from './slice/roleSlide';
import userReducer from './slice/userSlide';
import shiftReducer from './slice/shiftSlide';
import orderReducer from './slice/orderSlide';
import clientReducer from './slice/clientSlide';
import reviewReducer from './slice/reviewSlide';
import receiptReducer from './slice/receiptSlide';
import invoiceReducer from './slice/invoiceSlide';
import accountReducer from './slice/accountSlide';
import productReducer from './slice/productSlide';
import feedbackReducer from './slice/feedbackSlide';
import supplierReducer from './slice/supplierSlide';
import restaurantReducer from './slice/restaurantSlide';
import permissionReducer from './slice/permissionSlide';
import ingredientReducer from './slice/ingredientSlide';
import orderDetailReducer from './slice/orderDetailSlide';
import diningTableReducer from './slice/diningTableSlide';

// Configure the Redux store with various slice reducers
export const store = configureStore({
  reducer: {
    role: roleReducer,
    user: userReducer,
    shift: shiftReducer,
    order: orderReducer,
    review: reviewReducer,
    client: clientReducer,
    account: accountReducer,
    invoice: invoiceReducer,
    product: productReducer,
    receipt: receiptReducer,
    feedback: feedbackReducer,
    supplier: supplierReducer,
    ingredient: ingredientReducer,
    permission: permissionReducer,
    restaurant: restaurantReducer,
    diningTable: diningTableReducer,
    orderDetail: orderDetailReducer,
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