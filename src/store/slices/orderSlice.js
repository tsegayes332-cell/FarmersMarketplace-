import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../api/orderService';

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (_, { rejectWithValue }) => {
  try {
    return await orderService.getMyOrders();
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
  }
});

export const fetchFarmerOrders = createAsyncThunk('orders/fetchFarmer', async (_, { rejectWithValue }) => {
  try {
    return await orderService.getFarmerOrders();
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch farmer orders');
  }
});

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try {
    return await orderService.placeOrder(data);
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to place order');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    return await orderService.updateOrderStatus(id, status);
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update order status');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    farmerOrders: [],
    isLoading: false,
    isUpdating: false,
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
      .addCase(fetchFarmerOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.farmerOrders = action.payload;
      })
      .addCase(fetchFarmerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => { state.isLoading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const orders = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.myOrders.unshift(...orders);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => { state.isUpdating = true; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const idx = state.farmerOrders.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.farmerOrders[idx].status = action.payload.status;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  }
});

export default orderSlice.reducer;
