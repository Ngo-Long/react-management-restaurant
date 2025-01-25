import { ingredientApi } from '@/config/api';
import { IIngredient } from '@/types/backend';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IIngredient[]
}

export const fetchIngredient = createAsyncThunk(
    'ingredient/fetchIngredient',
    async ({ query }: { query: string }) => {
        return await ingredientApi.callFetchFilter(query);
    }
)

export const fetchIngredientByRestaurant = createAsyncThunk(
    'ingredient/fetchIngredientByRestaurant',
    async ({ query }: { query: string }) => {
        return await ingredientApi.callFetchByRestaurant(query);
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

export const ingredientSlide = createSlice({
    name: 'ingredient',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchIngredient actions
        builder.addCase(fetchIngredient.pending, (state, action) => {
            state.isFetching = true;
        })
        builder.addCase(fetchIngredient.rejected, (state, action) => {
            state.isFetching = false;
        })
        builder.addCase(fetchIngredient.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        // Handle fetchIngredientByRestaurant actions
        builder.addCase(fetchIngredientByRestaurant.pending, (state) => {
            state.isFetching = true;
        });

        builder.addCase(fetchIngredientByRestaurant.rejected, (state) => {
            state.isFetching = false;
        });

        builder.addCase(fetchIngredientByRestaurant.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        });
    }
});

export const { setActiveMenu } = ingredientSlide.actions;

export default ingredientSlide.reducer;
