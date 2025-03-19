import { userApi } from '@/config/api';
import { IUser } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IUser[]
}
// First, create the thunk
export const fetchAllUser = createAsyncThunk(
    'user/fetchAllUser',
    async ({ query }: { query: string }) => {
        const response = await userApi.callFetchAll(query);
        return response;
    }
)

export const fetchUserByRestaurant = createAsyncThunk(
    'user/fetchUserByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await userApi.callFetchByRestaurant(query);
        return response;
    }
)

export const fetchClientByRestaurant = createAsyncThunk(
    'user/fetchClientByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await userApi.callFetchClientByRestaurant(query);
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

export const userSlide = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllUser.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchAllUser.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchAllUser.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        builder.addCase(fetchUserByRestaurant.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchUserByRestaurant.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchUserByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        builder.addCase(fetchClientByRestaurant.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchClientByRestaurant.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchClientByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })
    },

});

export const { setActiveMenu } = userSlide.actions;

export default userSlide.reducer;
