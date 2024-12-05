import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { diningTableApi } from '@/config/api';
import { IDiningTable } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IDiningTable[]
}
// First, create the thunk
export const fetchDiningTable = createAsyncThunk(
    'diningTable/fetchDiningTable',
    async ({ query }: { query: string }) => {
        const response = await diningTableApi.callFetchFilter(query);
        return response;
    }
)

export const fetchDiningTableByRestaurant = createAsyncThunk(
    'diningTable/fetchDiningTableByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await diningTableApi.callFetchByRestaurant(query);
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


export const diningTableSlide = createSlice({
    name: 'diningTable',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchDiningTable actions
        builder.addCase(fetchDiningTable.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchDiningTable.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchDiningTable.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        // Handle fetchDiningTableByRestaurant actions
        builder.addCase(fetchDiningTableByRestaurant.pending, (state) => {
            state.isFetching = true;
        });

        builder.addCase(fetchDiningTableByRestaurant.rejected, (state) => {
            state.isFetching = false;
        });

        builder.addCase(fetchDiningTableByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    }
});

export const { setActiveMenu } = diningTableSlide.actions;

export default diningTableSlide.reducer;
