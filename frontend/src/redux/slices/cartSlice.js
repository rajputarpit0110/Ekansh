import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for backend cart operations
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/cart');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCartAPI = createAsyncThunk('cart/addToCartAPI', async (itemData, { rejectWithValue }) => {
  try {
    const response = await api.post('/cart', {
      productId: itemData.product,
      quantity: itemData.quantity
    });
    return response.data.data; // Returns updated cart
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
  }
});

export const removeFromCartAPI = createAsyncThunk('cart/removeFromCartAPI', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
  }
});

const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
  paymentMethod: localStorage.getItem('paymentMethod') || 'COD',
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local guest cart operations
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) => 
          x.product === existItem.product 
            ? { ...item, quantity: x.quantity + Number(item.quantity) } 
            : x
        );
      } else {
        state.cartItems = [...state.cartItems, { ...item, quantity: Number(item.quantity) }];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCartLocal: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // Map backend cart structure to frontend state
        if (action.payload && action.payload.items) {
          state.cartItems = action.payload.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0]?.url,
            price: item.product.price || item.price,
            quantity: item.quantity
          }));
          localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        }
      })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Add to Cart
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        if (action.payload && action.payload.items) {
          state.cartItems = action.payload.items.map(item => ({
            product: item.product._id || item.product,
            name: item.name || item.product.name,
            image: item.image?.url || item.image || item.product.images?.[0]?.url,
            price: item.product.price || item.price,
            quantity: item.quantity
          }));
          localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        }
      })
      // Remove from cart
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        if (action.payload && action.payload.items) {
          state.cartItems = action.payload.items.map(item => ({
            product: item.product._id || item.product,
            name: item.name || item.product.name,
            image: item.image?.url || item.image || item.product.images?.[0]?.url,
            price: item.product.price || item.price,
            quantity: item.quantity
          }));
          localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        }
      });
  }
});

export const { addToCartLocal, removeFromCartLocal, saveShippingAddress, savePaymentMethod, clearCart } = cartSlice.actions;

// Wrapper action to handle guest vs authenticated user automatically
export const addToCart = (item) => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.user) {
    dispatch(addToCartAPI(item));
  } else {
    dispatch(addToCartLocal(item));
  }
};

export const removeFromCart = (id) => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.user) {
    dispatch(removeFromCartAPI(id));
  } else {
    dispatch(removeFromCartLocal(id));
  }
};

export default cartSlice.reducer;
