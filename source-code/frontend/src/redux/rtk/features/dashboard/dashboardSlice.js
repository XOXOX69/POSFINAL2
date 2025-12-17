import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { errorHandler, successHandler } from "../../../../utils/functions";

const initialState = {
  info: null,
  chartData: null,
  activeUsers: null,
  totalActiveUsers: 0,
  error: "",
  loading: false,
  chartLoading: false,
  activeUsersLoading: false,
};

export const loadDashboardData = createAsyncThunk(
  "dashboard/loadDashboardData",
  async ({ startDate, endDate }) => {
    try {
      const { data } = await axios.get(
        `dashboard?startDate=${startDate}&endDate=${endDate}`
      );
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

export const loadChartData = createAsyncThunk(
  "dashboard/loadChartData",
  async () => {
    try {
      const { data } = await axios.get(`dashboard/chart-data`);
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

export const loadActiveUsers = createAsyncThunk(
  "dashboard/loadActiveUsers",
  async () => {
    try {
      const { data } = await axios.get(`dashboard/active-users`);
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.info = null;
      state.chartData = null;
    },
  },

  extraReducers: (builder) => {
    // 1) ====== builders for loadDashboardData ======

    builder.addCase(loadDashboardData.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(loadDashboardData.fulfilled, (state, action) => {
      state.loading = false;
      state.info = action.payload?.data;
    });

    // 2) ====== builders for loadChartData ======

    builder.addCase(loadChartData.pending, (state) => {
      state.chartLoading = true;
    });

    builder.addCase(loadChartData.fulfilled, (state, action) => {
      state.chartLoading = false;
      state.chartData = action.payload?.data;
    });

    builder.addCase(loadChartData.rejected, (state) => {
      state.chartLoading = false;
    });

    // 3) ====== builders for loadActiveUsers ======

    builder.addCase(loadActiveUsers.pending, (state) => {
      state.activeUsersLoading = true;
    });

    builder.addCase(loadActiveUsers.fulfilled, (state, action) => {
      state.activeUsersLoading = false;
      state.activeUsers = action.payload?.data?.activeUsers;
      state.totalActiveUsers = action.payload?.data?.totalActive;
    });

    builder.addCase(loadActiveUsers.rejected, (state) => {
      state.activeUsersLoading = false;
    });
  },
});

export default dashboardSlice.reducer;
export const { clearDashboard } = dashboardSlice.actions;
