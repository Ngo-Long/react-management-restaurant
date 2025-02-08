import { receiptApi } from '@/config/api';
import { IReceipt } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IReceipt[]
}

export const fetchReceipt = createAsyncThunk(
    'receipt/fetchReceipt',
    async ({ query }: { query: string }) => {
        return await receiptApi.callFetchFilter(query);
    }
)

export const fetchReceiptByRestaurant = createAsyncThunk(
    'receipt/fetchReceiptByRestaurant',
    async ({ query }: { query: string }) => {
        return await receiptApi.callFetchByRestaurant(query);
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

export const receiptSlide = createSlice({
    name: 'receipt',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchReceipt actions
        builder.addCase(fetchReceipt.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchReceipt.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchReceipt.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        // Handle fetchReceiptByRestaurant actions
        builder.addCase(fetchReceiptByRestaurant.pending, (state) => {
            state.isFetching = true;
        });

        builder.addCase(fetchReceiptByRestaurant.rejected, (state) => {
            state.isFetching = false;
        });

        builder.addCase(fetchReceiptByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    }
});

export const { setActiveMenu } = receiptSlide.actions;

export default receiptSlide.reducer;
