import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderDetailApi } from '@/config/api';
import { IOrderDetail } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IOrderDetail[]
}

// First, create the thunk
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

export const orderDetailSlide = createSlice({
    name: 'orderDetail',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
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
            }
        });
    },

});

export const {
    setActiveMenu,
} = orderDetailSlide.actions;

export default orderDetailSlide.reducer;
