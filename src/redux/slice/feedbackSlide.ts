import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { feedbackApi } from '@/config/api';
import { IFeedback } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IFeedback[]
}
// First, create the thunk
export const fetchFeedback = createAsyncThunk(
    'feedback/fetchFeedback',
    async ({ query }: { query: string }) => {
        const response = await feedbackApi.callFetchFilter(query);
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


export const feedbackSlide = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFeedback.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchFeedback.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchFeedback.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })
    }
});

export const { setActiveMenu } = feedbackSlide.actions;

export default feedbackSlide.reducer;
