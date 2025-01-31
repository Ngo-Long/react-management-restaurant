import { supplierApi } from '@/config/api';
import { ISupplier } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: ISupplier[]
}

export const fetchSupplier = createAsyncThunk(
    'supplier/fetchSupplier',
    async ({ query }: { query: string }) => {
        return await supplierApi.callFetchFilter(query);
    }
)

export const fetchSupplierByRestaurant = createAsyncThunk(
    'supplier/fetchSupplierByRestaurant',
    async ({ query }: { query: string }) => {
        return await supplierApi.callFetchByRestaurant(query);
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

export const supplierSlide = createSlice({
    name: 'supplier',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchSupplier actions
        builder.addCase(fetchSupplier.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchSupplier.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchSupplier.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        // Handle fetchSupplierByRestaurant actions
        builder.addCase(fetchSupplierByRestaurant.pending, (state) => {
            state.isFetching = true;
        });

        builder.addCase(fetchSupplierByRestaurant.rejected, (state) => {
            state.isFetching = false;
        });

        builder.addCase(fetchSupplierByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    }
});

export const { setActiveMenu } = supplierSlide.actions;

export default supplierSlide.reducer;
