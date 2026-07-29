import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../api/productService';

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    return await productService.getProducts(params);
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data || action.payload.products || action.payload;
        state.totalItems = action.payload.pagination?.total || action.payload.totalItems || 0;
        state.totalPages = action.payload.pagination?.totalPages || action.payload.totalPages || 1;
        state.currentPage = action.payload.pagination?.page || action.payload.currentPage || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
