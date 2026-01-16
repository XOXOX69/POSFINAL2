import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const OFFLINE_SALES_KEY = "offline_sales_queue";

// Get offline sales from localStorage
const getOfflineSales = () => {
  try {
    const stored = localStorage.getItem(OFFLINE_SALES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save offline sales to localStorage
const saveOfflineSales = (sales) => {
  try {
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(sales));
  } catch (e) {
    console.error("Failed to save offline sales:", e);
  }
};

const initialState = {
  isOnline: navigator.onLine,
  offlineSales: getOfflineSales(),
  syncing: false,
  syncError: null,
  lastSyncTime: null,
};

// Sync offline sales to server
export const syncOfflineSales = createAsyncThunk(
  "offline/syncSales",
  async (_, { getState, rejectWithValue }) => {
    const { offlineSales } = getState().offline;
    
    if (offlineSales.length === 0) {
      return { synced: [], failed: [] };
    }

    const synced = [];
    const failed = [];

    for (const sale of offlineSales) {
      try {
        await axios.post("sale-invoice/", sale);
        synced.push(sale.offlineId);
      } catch (error) {
        failed.push({ ...sale, error: error.message });
      }
    }

    return { synced, failed };
  }
);

const offlineSlice = createSlice({
  name: "offline",
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    addOfflineSale: (state, action) => {
      const sale = {
        ...action.payload,
        offlineId: Date.now().toString(),
        createdOfflineAt: new Date().toISOString(),
      };
      state.offlineSales.push(sale);
      saveOfflineSales(state.offlineSales);
    },
    removeOfflineSale: (state, action) => {
      state.offlineSales = state.offlineSales.filter(
        (sale) => sale.offlineId !== action.payload
      );
      saveOfflineSales(state.offlineSales);
    },
    clearSyncedSales: (state, action) => {
      const syncedIds = action.payload;
      state.offlineSales = state.offlineSales.filter(
        (sale) => !syncedIds.includes(sale.offlineId)
      );
      saveOfflineSales(state.offlineSales);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncOfflineSales.pending, (state) => {
      state.syncing = true;
      state.syncError = null;
    });
    builder.addCase(syncOfflineSales.fulfilled, (state, action) => {
      state.syncing = false;
      state.lastSyncTime = new Date().toISOString();
      // Remove synced sales
      if (action.payload.synced.length > 0) {
        state.offlineSales = state.offlineSales.filter(
          (sale) => !action.payload.synced.includes(sale.offlineId)
        );
        saveOfflineSales(state.offlineSales);
      }
    });
    builder.addCase(syncOfflineSales.rejected, (state, action) => {
      state.syncing = false;
      state.syncError = action.payload;
    });
  },
});

export const {
  setOnlineStatus,
  addOfflineSale,
  removeOfflineSale,
  clearSyncedSales,
} = offlineSlice.actions;

export default offlineSlice.reducer;
