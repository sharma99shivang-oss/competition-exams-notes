import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./api";

// Login (User + Admin dono ke liye same API)
export const login = createAsyncThunk("auth/login", async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
});

export const signup = createAsyncThunk("auth/signup", async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    accessToken: null,
    status: "idle",
  },

  reducers: {
    token: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },

    clear: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      });
  },
});

export const { token, clear } = authSlice.actions;
export default authSlice.reducer;