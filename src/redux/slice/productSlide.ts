import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productApi } from '@/config/api';
import { IProduct } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IProduct[]
}
// First, create the thunk
export const fetchProduct = createAsyncThunk(
    'product/fetchProduct',
    async ({ query }: { query: string }) => {
        const response = await productApi.callFetchFilter(query);
        return response;
    }
)

export const fetchProductByRestaurant = createAsyncThunk(
    'product/fetchProductByRestaurant',
    async ({ query }: { query: string }) => {
        const response = await productApi.callFetchByRestaurant(query);
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


export const productSlide = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchProduct actions
        builder.addCase(fetchProduct.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchProduct.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchProduct.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        // Handle fetchProductByRestaurant actions
        builder.addCase(fetchProductByRestaurant.pending, (state) => {
            state.isFetching = true;
        });

        builder.addCase(fetchProductByRestaurant.rejected, (state) => {
            state.isFetching = false;
        });

        builder.addCase(fetchProductByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    }
});

export const { setActiveMenu } = productSlide.actions;

export default productSlide.reducer;
