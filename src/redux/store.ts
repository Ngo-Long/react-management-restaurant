import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import roleReducer from './slice/roleSlide';
import userReducer from './slice/userSlide';
import orderReducer from './slice/orderSlide';
import invoiceReducer from './slice/invoiceSlide';
import accountReducer from './slice/accountSlide';
import productReducer from './slice/productSlide';
import restaurantReducer from './slice/restaurantSlide';
import permissionReducer from './slice/permissionSlide';
import diningTableReducer from './slice/diningTableSlide';
import orderDetailReducer from './slice/orderDetailSlide';

// Configure the Redux store with various slice reducers
export const store = configureStore({
  reducer: {
    account: accountReducer,
    restaurant: restaurantReducer,
    user: userReducer,
    diningTable: diningTableReducer,
    order: orderReducer,
    invoice: invoiceReducer,
    orderDetail: orderDetailReducer,
    product: productReducer,
    role: roleReducer,
    permission: permissionReducer,
  },
});

// AppDispatch type defines the dispatch function for actions in the store
export type AppDispatch = typeof store.dispatch;

// RootState type defines the entire state of the Redux store, used for accessing the app state
export type RootState = ReturnType<typeof store.getState>;

// AppThunk type defines the structure for asynchronous actions (thunks)
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,       // The return type of the thunk
  RootState,        // The state type of the store
  unknown,          // The type for any additional data (if needed)
  Action<string>    // The type for the action, in this case, a string
>;