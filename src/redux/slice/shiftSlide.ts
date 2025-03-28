import { shiftApi } from '@/config/api';
import { IShift } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IShift[]
}

export const fetchShifts = createAsyncThunk(
    'shift/fetchShifts',
    async ({ query }: { query: string }) => {
        const response = await shiftApi.callFetchFilter(query);
        return response;
    }
)

export const fetchShiftsByRestaurant = createAsyncThunk(
    'shift/fetchShiftsByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await shiftApi.callFetchByRestaurant(query);
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

export const shiftSlide = createSlice({
    name: 'shift',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchShifts.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchShifts.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchShifts.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        builder.addCase(fetchShiftsByRestaurant.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchShiftsByRestaurant.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchShiftsByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
            }
        })
    }
});

export const { setActiveMenu } = shiftSlide.actions;

export default shiftSlide.reducer;
