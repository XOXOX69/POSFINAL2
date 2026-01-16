import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { errorHandler, successHandler } from "../../../../utils/functions";

const initialState = {
  groups: [],
  modifiers: [],
  productModifiers: {},
  loading: false,
  error: null,
};

// Load all modifier groups
export const loadModifierGroups = createAsyncThunk(
  "modifiers/loadGroups",
  async () => {
    try {
      const { data } = await axios.get("modifiers/groups");
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

// Load all modifiers
export const loadAllModifiers = createAsyncThunk(
  "modifiers/loadAll",
  async () => {
    try {
      const { data } = await axios.get("modifiers/");
      return successHandler(data);
    } catch (error) {
      return errorHandler(error);
    }
  }
);

// Create modifier group
export const createModifierGroup = createAsyncThunk(
  "modifiers/createGroup",
  async (values) => {
    try {
      const { data } = await axios.post("modifiers/groups", values);
      return successHandler(data, "Modifier group created");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Create modifier
export const createModifier = createAsyncThunk(
  "modifiers/create",
  async (values) => {
    try {
      const { data } = await axios.post("modifiers/", values);
      return successHandler(data, "Modifier created");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Update modifier group
export const updateModifierGroup = createAsyncThunk(
  "modifiers/updateGroup",
  async ({ id, values }) => {
    try {
      const { data } = await axios.put(`modifiers/groups/${id}`, values);
      return successHandler(data, "Modifier group updated");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Update modifier
export const updateModifier = createAsyncThunk(
  "modifiers/update",
  async ({ id, values }) => {
    try {
      const { data } = await axios.put(`modifiers/${id}`, values);
      return successHandler(data, "Modifier updated");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Delete modifier group
export const deleteModifierGroup = createAsyncThunk(
  "modifiers/deleteGroup",
  async (id) => {
    try {
      const { data } = await axios.delete(`modifiers/groups/${id}`);
      return successHandler({ ...data, id }, "Modifier group deleted");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Delete modifier
export const deleteModifier = createAsyncThunk(
  "modifiers/delete",
  async (id) => {
    try {
      const { data } = await axios.delete(`modifiers/${id}`);
      return successHandler({ ...data, id }, "Modifier deleted");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

// Load modifiers for a product
export const loadProductModifiers = createAsyncThunk(
  "modifiers/loadForProduct",
  async (productId) => {
    try {
      const { data } = await axios.get(`modifiers/product/${productId}`);
      return { productId, data };
    } catch (error) {
      return errorHandler(error);
    }
  }
);

// Assign modifier groups to product
export const assignModifiersToProduct = createAsyncThunk(
  "modifiers/assignToProduct",
  async ({ productId, modifierGroupIds }) => {
    try {
      const { data } = await axios.post("modifiers/assign-product", {
        productId,
        modifierGroupIds,
      });
      return successHandler(data, "Modifiers assigned to product");
    } catch (error) {
      return errorHandler(error, true);
    }
  }
);

const modifiersSlice = createSlice({
  name: "modifiers",
  initialState,
  reducers: {
    clearProductModifiers: (state) => {
      state.productModifiers = {};
    },
  },
  extraReducers: (builder) => {
    // Load groups
    builder.addCase(loadModifierGroups.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadModifierGroups.fulfilled, (state, action) => {
      state.loading = false;
      state.groups = action.payload?.data || [];
    });
    builder.addCase(loadModifierGroups.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Load all modifiers
    builder.addCase(loadAllModifiers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadAllModifiers.fulfilled, (state, action) => {
      state.loading = false;
      state.modifiers = action.payload?.data || [];
    });
    builder.addCase(loadAllModifiers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Create group
    builder.addCase(createModifierGroup.fulfilled, (state, action) => {
      if (action.payload?.data?.data) {
        state.groups.push(action.payload.data.data);
      }
    });

    // Create modifier
    builder.addCase(createModifier.fulfilled, (state, action) => {
      if (action.payload?.data?.data) {
        state.modifiers.push(action.payload.data.data);
      }
    });

    // Delete group
    builder.addCase(deleteModifierGroup.fulfilled, (state, action) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload?.data?.id);
    });

    // Delete modifier
    builder.addCase(deleteModifier.fulfilled, (state, action) => {
      state.modifiers = state.modifiers.filter((m) => m.id !== action.payload?.data?.id);
    });

    // Load product modifiers
    builder.addCase(loadProductModifiers.fulfilled, (state, action) => {
      if (action.payload?.productId) {
        state.productModifiers[action.payload.productId] = action.payload.data || [];
      }
    });
  },
});

export const { clearProductModifiers } = modifiersSlice.actions;
export default modifiersSlice.reducer;
