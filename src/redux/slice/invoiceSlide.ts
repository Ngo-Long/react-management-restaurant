import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { invoiceApi } from '@/config/api';
import { IInvoice } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IInvoice[]
    totalRevenue: number;
}

const initialState: IState = {
    isFetching: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: [],
    totalRevenue: 0
};


// First, create the thunk
export const fetchInvoice = createAsyncThunk(
    'invoice/fetchInvoice',
    async ({ query }: { query: string }) => {
        const response = await invoiceApi.callFetchFilter(query);
        return response;
    }
)

export const fetchTotalRevenue = createAsyncThunk(
    'invoice/fetchTotalRevenue',
    async () => {
        const response = await invoiceApi.callTotalRevenue();
        return response.data;
    }
);


export const invoiceSlide = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchInvoice.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchInvoice.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchInvoice.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
        })

        builder.addCase(fetchTotalRevenue.fulfilled, (state, action) => {
            if (action.payload) {
                state.totalRevenue = action.payload.totalRevenue;
            }
        });
    },

});

export const {
    setActiveMenu,
} = invoiceSlide.actions;

export default invoiceSlide.reducer;
