import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (queryString = '', { rejectWithValue }) => {
  try {
    const response = await api.get(`/products?${queryString}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductDetails = createAsyncThunk('products/fetchDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
  }
});

export const updateProductAPI = createAsyncThunk('products/updateProduct', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update product');
  }
});

export const deleteProductAPI = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    productDetails: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.totalProducts = action.payload.total;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch single
      .addCase(fetchProductDetails.pending, (state) => { state.loading = true; state.productDetails = null; })
      .addCase(fetchProductDetails.fulfilled, (state, action) => { state.loading = false; state.productDetails = action.payload; })
      .addCase(fetchProductDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update Product
      .addCase(updateProductAPI.pending, (state) => { state.loading = true; })
      .addCase(updateProductAPI.fulfilled, (state, action) => {
        state.loading = false;
        // Update the item in the list if it exists
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.productDetails && state.productDetails._id === action.payload._id) {
          state.productDetails = action.payload;
        }
      })
      .addCase(updateProductAPI.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Delete Product
      .addCase(deleteProductAPI.pending, (state) => { state.loading = true; })
      .addCase(deleteProductAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProductAPI.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default productSlice.reducer;
