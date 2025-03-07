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
    result: IOrder[],
    singleOrder: IOrder
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

export const fetchLatestUnpaidOrderByTableId = createAsyncThunk(
    'Order/fetchLatestUnpaidOrderByTableId',
    async (id: string) => {
        const response = await orderApi.callFetchByTable(id);
        return response?.data;
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
    result: [],
    singleOrder: {
        id: "",
        note: "",
        totalPrice: 0,
        status: ""
    }
};

export const orderSlide = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetSingleOrder: (state, action) => {
            state.singleOrder = {
                id: "",
                note: "",
                totalPrice: 0,
                status: ""
            }
        }
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

        // Handle fetchOrderByTable actions
        builder.addCase(fetchLatestUnpaidOrderByTableId.pending, (state) => {
            state.isFetching = true;
            state.singleOrder = {
                id: "",
                note: "",
                totalPrice: 0,
                status: ""
            }
        });

        builder.addCase(fetchLatestUnpaidOrderByTableId.rejected, (state) => {
            state.isFetching = false;
            state.singleOrder = {
                id: "",
                note: "",
                totalPrice: 0,
                status: ""
            }
        });

        builder.addCase(fetchLatestUnpaidOrderByTableId.fulfilled, (state, action) => {
            // if (action.payload && action.payload.data) {
            state.isFetching = false;
            // state.singleOrder = action.payload.data;
            // }
        });
    },

});

export const { resetSingleOrder } = orderSlide.actions;

export default orderSlide.reducer;
