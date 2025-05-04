import { orderDetailApi } from '@/config/api';
import { IOrderDetail } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IOrderDetail[],
    totalCost: number
}

const initialState: IState = {
    isFetching: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: [],
    totalCost: 0
};

// First, create the thunk
export const fetchTotalCost = createAsyncThunk(
    'orderDetail/fetchTotalCost',
    async () => {
        const response = await orderDetailApi.callTotalCost();
        return response.data;
    }
);

export const fetchOrderDetail = createAsyncThunk(
    'orderDetail/fetchOrderDetail',
    async ({ query }: { query: string }) => {
        const response = await orderDetailApi.callFetchFilter(query);
        return response;
    }
)

export const fetchOrderDetailsByOrderId = createAsyncThunk(
    'orderDetail/fetchOrderDetailsByOrderId',
    async (id: string) => {
        const response = await orderDetailApi.callFetchByOrderId(id);
        return response;
    }
)

export const fetchOrderDetailsByRestaurant = createAsyncThunk(
    'orderDetail/fetchOrderDetailsByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await orderDetailApi.callFetchByRestaurant(query);
        return response;
    }
)

export const orderDetailSlide = createSlice({
    name: 'orderDetail',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => { },
        resetOrderDetails: (state) => {
            state.result = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOrderDetail.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchOrderDetail.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchOrderDetail.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        // Handle fetchOrderDetailsByOrderId actions
        builder.addCase(fetchOrderDetailsByOrderId.pending, (state) => {
            state.isFetching = true;
        });
        builder.addCase(fetchOrderDetailsByOrderId.rejected, (state) => {
            state.isFetching = false;
        });
        builder.addCase(fetchOrderDetailsByOrderId.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });

        // Handle fetchOrderDetailsByRestaurant actions
        builder.addCase(fetchOrderDetailsByRestaurant.pending, (state) => {
            state.isFetching = true;
        })
        builder.addCase(fetchOrderDetailsByRestaurant.rejected, (state) => {
            state.isFetching = false;
        })
        builder.addCase(fetchOrderDetailsByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });

        // fetch total cost
        builder.addCase(fetchTotalCost.fulfilled, (state, action) => {
            if (action.payload) {
                state.totalCost = action.payload.totalCost;
            }
        });
    },

});

export const {
    setActiveMenu, resetOrderDetails
} = orderDetailSlide.actions;

export default orderDetailSlide.reducer;
