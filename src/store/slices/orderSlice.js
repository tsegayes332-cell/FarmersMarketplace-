import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../api/orderService';

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (_, { rejectWithValue }) => {
  try {
    return await orderService.getMyOrders();
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
  }
});

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try {
    return await orderService.placeOrder(data);
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to place order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => { state.isLoading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default orderSlice.reducer;
