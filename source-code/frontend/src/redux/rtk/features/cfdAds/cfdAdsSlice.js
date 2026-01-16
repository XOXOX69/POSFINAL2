import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Get all CFD ads (admin)
export const loadAllCfdAds = createAsyncThunk(
  "cfdAds/loadAll",
  async () => {
    const { data } = await axios.get(`cfd-ads/`);
    return data;
  }
);

// Get active CFD ads (public - for customer display)
export const loadActiveCfdAds = createAsyncThunk(
  "cfdAds/loadActive",
  async () => {
    const { data } = await axios.get(`cfd-ads/active`);
    return data;
  }
);

// Create new CFD ad
export const createCfdAd = createAsyncThunk(
  "cfdAds/create",
  async (formData) => {
    const { data } = await axios.post(`cfd-ads/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
);

// Update CFD ad
export const updateCfdAd = createAsyncThunk(
  "cfdAds/update",
  async ({ id, formData }) => {
    const { data } = await axios.post(`cfd-ads/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
);

// Delete CFD ad
export const deleteCfdAd = createAsyncThunk(
  "cfdAds/delete",
  async (id) => {
    await axios.delete(`cfd-ads/${id}`);
    return id;
  }
);

// Toggle active status
export const toggleCfdAdActive = createAsyncThunk(
  "cfdAds/toggleActive",
  async (id) => {
    const { data } = await axios.patch(`cfd-ads/${id}/toggle`);
    return data;
  }
);

const cfdAdsSlice = createSlice({
  name: "cfdAds",
  initialState: {
    list: [],
    activeAds: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Load all
    builder.addCase(loadAllCfdAds.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadAllCfdAds.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(loadAllCfdAds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Load active
    builder.addCase(loadActiveCfdAds.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadActiveCfdAds.fulfilled, (state, action) => {
      state.loading = false;
      state.activeAds = action.payload;
    });
    builder.addCase(loadActiveCfdAds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Create
    builder.addCase(createCfdAd.fulfilled, (state, action) => {
      state.list.push(action.payload.data);
    });

    // Update
    builder.addCase(updateCfdAd.fulfilled, (state, action) => {
      const index = state.list.findIndex((ad) => ad.id === action.payload.data.id);
      if (index !== -1) {
        state.list[index] = action.payload.data;
      }
    });

    // Delete
    builder.addCase(deleteCfdAd.fulfilled, (state, action) => {
      state.list = state.list.filter((ad) => ad.id !== action.payload);
    });

    // Toggle active
    builder.addCase(toggleCfdAdActive.fulfilled, (state, action) => {
      const index = state.list.findIndex((ad) => ad.id === action.payload.data.id);
      if (index !== -1) {
        state.list[index] = action.payload.data;
      }
    });
  },
});

export default cfdAdsSlice.reducer;
