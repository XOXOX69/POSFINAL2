import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { errorHandler, successHandler } from "../../../../utils/functions";

const initialState = {
  currentDrawer: null,
  transactions: [],
  history: [],
  loading: false,
  error: null,
};

// Get current open drawer
export const getCurrentDrawer = createAsyncThunk(
  "cashDrawer/getCurrent",
  async () => {
    try {
      const { data } = await axios.get("cash-drawer/current");
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

// Open drawer
export const openDrawer = createAsyncThunk(
  "cashDrawer/open",
  async (values) => {
    try {
      const { data } = await axios.post("cash-drawer/open", values);
      return successHandler(data, "Cash drawer opened");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Close drawer
export const closeDrawer = createAsyncThunk(
  "cashDrawer/close",
  async ({ id, values }) => {
    try {
      const { data } = await axios.post(`cash-drawer/${id}/close`, values);
      return successHandler(data, "Cash drawer closed");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Cash in
export const cashIn = createAsyncThunk(
  "cashDrawer/cashIn",
  async (values) => {
    try {
      const { data } = await axios.post("cash-drawer/cash-in", values);
      return successHandler(data, "Cash in recorded");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Cash out
export const cashOut = createAsyncThunk(
  "cashDrawer/cashOut",
  async (values) => {
    try {
      const { data } = await axios.post("cash-drawer/cash-out", values);
      return successHandler(data, "Cash out recorded");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Record sale
export const recordSale = createAsyncThunk(
  "cashDrawer/recordSale",
  async (values) => {
    try {
      const { data } = await axios.post("cash-drawer/sale", values);
      return data;
    } catch (error) {
      // Don't show error for sale recording - it's optional
      return null;
    }
  }
);

// Get drawer history
export const getDrawerHistory = createAsyncThunk(
  "cashDrawer/getHistory",
  async (params) => {
    try {
      const { data } = await axios.get("cash-drawer/history", { params });
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

// Get drawer transactions
export const getDrawerTransactions = createAsyncThunk(
  "cashDrawer/getTransactions",
  async (id) => {
    try {
      const { data } = await axios.get(`cash-drawer/${id}/transactions`);
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

const cashDrawerSlice = createSlice({
  name: "cashDrawer",
  initialState,
  reducers: {
    clearDrawer: (state) => {
      state.currentDrawer = null;
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    // Get current drawer
    builder.addCase(getCurrentDrawer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCurrentDrawer.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDrawer = action.payload?.data?.data || null;
    });
    builder.addCase(getCurrentDrawer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Open drawer
    builder.addCase(openDrawer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(openDrawer.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDrawer = action.payload?.data?.data || null;
    });
    builder.addCase(openDrawer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Close drawer
    builder.addCase(closeDrawer.fulfilled, (state, action) => {
      state.currentDrawer = null;
    });

    // Cash in
    builder.addCase(cashIn.fulfilled, (state, action) => {
      if (state.currentDrawer && action.payload?.data?.currentBalance) {
        state.currentDrawer.currentBalance = action.payload.data.currentBalance;
      }
    });

    // Cash out
    builder.addCase(cashOut.fulfilled, (state, action) => {
      if (state.currentDrawer && action.payload?.data?.currentBalance) {
        state.currentDrawer.currentBalance = action.payload.data.currentBalance;
      }
    });

    // Get history
    builder.addCase(getDrawerHistory.fulfilled, (state, action) => {
      state.history = action.payload?.data?.data || [];
    });

    // Get transactions
    builder.addCase(getDrawerTransactions.fulfilled, (state, action) => {
      state.transactions = action.payload?.data || [];
    });
  },
});

export const { clearDrawer } = cashDrawerSlice.actions;
export default cashDrawerSlice.reducer;
