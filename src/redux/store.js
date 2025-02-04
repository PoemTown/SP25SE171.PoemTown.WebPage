import { configureStore } from '@reduxjs/toolkit';
import resetPasswordReducer from './slices/resetPasswordSlice';


const store = configureStore({
  reducer: {
    passwordReset: resetPasswordReducer,
    
  },
});

export default store;

