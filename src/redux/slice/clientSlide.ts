import { clientApi } from '@/config/api';
import { IClient } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IClient[]
}
// First, create the thunk
export const fetchClients = createAsyncThunk(
    'client/fetchClients',
    async ({ query }: { query: string }) => {
        const response = await clientApi.callFetchAll(query);
        return response;
    }
)

export const fetchClientsByRestaurant = createAsyncThunk(
    'client/fetchClientsByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await clientApi.callFetchByRestaurant(query);
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

export const clientSlide = createSlice({
    name: 'client',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchClients.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchClients.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchClients.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        builder.addCase(fetchClientsByRestaurant.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchClientsByRestaurant.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchClientsByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })
    },

});

export const { setActiveMenu } = clientSlide.actions;

export default clientSlide.reducer;
