import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderApi } from '@/config/api';
import { IOrder } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IOrder[]
}

// First, create the thunk
export const fetchOrder = createAsyncThunk(
    'Order/fetchOrder',
    async ({ query }: { query: string }) => {
        const response = await orderApi.callFetchFilter(query);
        return response;
    }
)

export const fetchOrderByRestaurant = createAsyncThunk(
    'Order/fetchOrderByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await orderApi.callFetchByRestaurant(query);
        return response;
    }
)

const initialState: IState = {
    isFetching: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};

export const orderSlide = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchOrder.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchOrder.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchOrder.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })


        // Handle fetchOrderByRestaurant actions
        builder.addCase(fetchOrderByRestaurant.pending, (state) => {
            state.isFetching = true;
        });

        builder.addCase(fetchOrderByRestaurant.rejected, (state) => {
            state.isFetching = false;
        });

        builder.addCase(fetchOrderByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    },

});

export const { setActiveMenu } = orderSlide.actions;

export default orderSlide.reducer;
