import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create order');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders/myorders');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch your orders');
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    order: null,
    myOrders: [],
    allOrders: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetOrder: (state) => {
      state.order = null;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => { state.loading = true; state.success = false; })
      .addCase(createOrder.fulfilled, (state, action) => { state.loading = false; state.success = true; state.order = action.payload; })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.myOrders = action.payload; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch all orders (admin)
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.allOrders = action.payload.orders || action.payload; })
      .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update order status (admin)
      .addCase(updateOrderStatus.pending, (state) => { state.loading = true; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => { 
        state.loading = false; 
        const updatedOrder = action.payload;
        const index = state.allOrders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.allOrders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
