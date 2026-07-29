import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';
import authService from '../../api/authService';

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username && credentials.password) {
      let user;
      try {
        user = JSON.parse(credentials.username);
      } catch {
        return rejectWithValue('Invalid stored credentials');
      }
      const token = credentials.password;
      return { user, token };
    }
    return rejectWithValue('No token found');
  } catch (error) {
    return rejectWithValue('Error loading credentials');
  }
});

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await authService.login(email, password);
    await Keychain.setGenericPassword(JSON.stringify(data.user), data.token);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await authService.register(userData);
    await Keychain.setGenericPassword(JSON.stringify(data.user), data.token);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await Keychain.resetGenericPassword();
  return null;
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (data, { getState, rejectWithValue }) => {
  try {
    const updatedUser = await authService.updateProfile(data);
    const state = getState();
    const currentToken = state.auth.token;
    await Keychain.setGenericPassword(JSON.stringify(updatedUser), currentToken);
    return updatedUser;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
  }
});

const initialState = {
  user: null,
  token: null,
  isLoading: true, // True initially to show splash while checking token
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadUser
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        // The API returns validation arrays sometimes, format them
        state.error = Array.isArray(action.payload) ? action.payload[0]?.message : action.payload;
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = Array.isArray(action.payload) ? action.payload[0]?.message : action.payload;
      })
      // updateUserProfile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
