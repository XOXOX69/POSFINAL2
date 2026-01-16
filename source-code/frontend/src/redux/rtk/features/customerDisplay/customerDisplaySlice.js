import { createSlice } from "@reduxjs/toolkit";

// Broadcast channel for cross-tab communication
const STORAGE_KEY = 'pos_customer_display';

const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  taxRate: 0.08, // 8% default tax rate
  discount: 0,
  total: 0,
  customerName: "",
  isActive: false,
};

// Helper to broadcast state to other tabs
const broadcastState = (state) => {
  try {
    const data = {
      items: state.items,
      subtotal: state.subtotal,
      tax: state.tax,
      taxRate: state.taxRate,
      discount: state.discount,
      total: state.total,
      customerName: state.customerName,
      isActive: state.isActive,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Trigger storage event for same-tab listeners
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(data),
    }));
  } catch (e) {
    console.error('Failed to broadcast customer display state:', e);
  }
};

const customerDisplaySlice = createSlice({
  name: "customerDisplay",
  initialState,
  reducers: {
    // Update the entire cart display
    updateCustomerDisplay: (state, action) => {
      const { items, subtotal, tax, discount, total, customerName, taxRate } = action.payload;
      state.items = items || [];
      state.subtotal = subtotal || 0;
      state.tax = tax || 0;
      state.taxRate = taxRate || state.taxRate;
      state.discount = discount || 0;
      state.total = total || 0;
      state.customerName = customerName || "";
      state.isActive = true;
      
      // Broadcast to other tabs
      broadcastState(state);
    },
    
    // Add a single item to display
    addItemToDisplay: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      
      if (existingItem) {
        existingItem.quantity = action.payload.quantity;
        existingItem.totalPrice = action.payload.quantity * action.payload.unitPrice;
      } else {
        state.items.push({
          ...action.payload,
          totalPrice: action.payload.quantity * action.payload.unitPrice,
        });
      }
      state.isActive = true;
      
      // Broadcast to other tabs
      broadcastState(state);
    },
    
    // Remove an item from display
    removeItemFromDisplay: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      
      // Broadcast to other tabs
      broadcastState(state);
    },
    
    // Update totals
    updateTotals: (state, action) => {
      const { subtotal, tax, discount, total } = action.payload;
      state.subtotal = subtotal || 0;
      state.tax = tax || 0;
      state.discount = discount || 0;
      state.total = total || 0;
      
      // Broadcast to other tabs
      broadcastState(state);
    },
    
    // Clear the display (after sale completion)
    clearCustomerDisplay: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.discount = 0;
      state.total = 0;
      state.customerName = "";
      state.isActive = false;
      
      // Broadcast to other tabs
      broadcastState(state);
    },
    
    // Set customer name
    setCustomerName: (state, action) => {
      state.customerName = action.payload;
      
      // Broadcast to other tabs
      broadcastState(state);
    },
    
    // Activate/deactivate display
    setDisplayActive: (state, action) => {
      state.isActive = action.payload;
    },
    
    // Sync state from localStorage (called by other tabs)
    syncFromStorage: (state, action) => {
      const data = action.payload;
      if (data) {
        state.items = data.items || [];
        state.subtotal = data.subtotal || 0;
        state.tax = data.tax || 0;
        state.taxRate = data.taxRate || state.taxRate;
        state.discount = data.discount || 0;
        state.total = data.total || 0;
        state.customerName = data.customerName || "";
        state.isActive = data.isActive || false;
      }
    },
  },
});

export default customerDisplaySlice.reducer;
export const {
  updateCustomerDisplay,
  addItemToDisplay,
  removeItemFromDisplay,
  updateTotals,
  clearCustomerDisplay,
  setCustomerName,
  setDisplayActive,
  syncFromStorage,
} = customerDisplaySlice.actions;

// Export storage key for use in components
export const CUSTOMER_DISPLAY_STORAGE_KEY = STORAGE_KEY;
