import { reviewApi } from '@/config/api';
import { IReview } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IReview[]
}

export const fetchReview = createAsyncThunk(
    'review/fetchReview',
    async ({ query }: { query: string }) => {
        const response = await reviewApi.callFetchFilter(query);
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

export const reviewtSlide = createSlice({
    name: 'review',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchReceipt actions
        builder.addCase(fetchReview.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchReview.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchReview.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })
    }
});

export const { setActiveMenu } = reviewtSlide.actions;

export default reviewtSlide.reducer;
