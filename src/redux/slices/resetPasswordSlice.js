
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const resetPassword = createAsyncThunk('password/reset', async (data) => {
  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/accounts/v1/password/recovery`, data);
  return response.data;
});

const passwordResetSlice = createSlice({
  name: 'passwordReset',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearSuccess } = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
